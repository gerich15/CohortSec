"""Celery backup worker - copy S3 to internal MinIO (Air Gap)."""

import logging
from datetime import datetime
from typing import Any, Dict, Optional

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def get_s3_client(
    endpoint: str,
    access_key: str,
    secret_key: str,
    secure: bool = False,
) -> Any:
    """Create S3 client for external or MinIO."""
    return boto3.client(
        "s3",
        endpoint_url=f"http{'s' if secure else ''}://{endpoint}",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )


def _endpoint_looks_valid(endpoint: str) -> bool:
    """Endpoint must look like a real host to avoid DNS resolution errors."""
    if not endpoint or len(endpoint) < 4:
        return False
    if "." in endpoint or endpoint.startswith("localhost") or ":" in endpoint:
        return True
    return False


def copy_bucket(
    source_endpoint: str,
    source_access_key: str,
    source_secret_key: str,
    source_bucket: str,
    source_prefix: Optional[str],
    target_bucket: str,
) -> Dict[str, Any]:
    """Copy objects from source S3 to internal MinIO.

    Returns: {objects_count, total_bytes, status, error}
    """
    result = {
        "objects_count": 0,
        "total_bytes": 0,
        "status": "success",
        "error": None,
    }

    if not _endpoint_looks_valid(source_endpoint):
        result["status"] = "failed"
        result["error"] = (
            "Invalid backup config: endpoint must be a valid host "
            "(e.g. s3.amazonaws.com or localhost:9000). "
            "Update the config in Backup settings."
        )
        logger.warning("Backup skipped: invalid endpoint %r", source_endpoint)
        return result

    if not source_bucket or len(source_bucket.strip()) < 2:
        result["status"] = "failed"
        result["error"] = "Invalid backup config: bucket name must be at least 2 characters."
        logger.warning("Backup skipped: invalid bucket %r", source_bucket)
        return result

    try:
        target_client = get_s3_client(
            settings.minio_endpoint,
            settings.minio_access_key,
            settings.minio_secret_key,
        )
        ensure_bucket_exists(target_client, target_bucket)

        source_client = get_s3_client(
            source_endpoint,
            source_access_key,
            source_secret_key,
        )

        paginator = source_client.get_paginator("list_objects_v2")
        pages = paginator.paginate(
            Bucket=source_bucket,
            Prefix=source_prefix or "",
        )

        for page in pages:
            for obj in page.get("Contents", []):
                key = obj["Key"]
                size = obj.get("Size", 0)
                if size == 0 and key.endswith("/"):
                    continue

                try:
                    copy_source = {"Bucket": source_bucket, "Key": key}
                    target_client.copy_object(
                        Bucket=target_bucket,
                        Key=key,
                        CopySource=copy_source,
                    )
                    result["objects_count"] += 1
                    result["total_bytes"] += size
                except ClientError as e:
                    logger.warning("Copy failed for %s: %s", key, e)
                    # Try get + put for cross-provider copy
                    try:
                        body = source_client.get_object(Bucket=source_bucket, Key=key)
                        target_client.put_object(
                            Bucket=target_bucket,
                            Key=key,
                            Body=body["Body"].read(),
                        )
                        result["objects_count"] += 1
                        result["total_bytes"] += size
                    except ClientError as e2:
                        logger.error("Fallback copy failed for %s: %s", key, e2)
                        result["status"] = "partial"
                        result["error"] = str(e2)

    except Exception as e:
        logger.exception("Backup copy failed: %s", e)
        result["status"] = "failed"
        result["error"] = str(e)

    return result


def ensure_bucket_exists(client: Any, bucket: str) -> None:
    """Create bucket if not exists."""
    try:
        client.head_bucket(Bucket=bucket)
    except ClientError as e:
        if e.response["Error"]["Code"] == "404":
            client.create_bucket(Bucket=bucket)
        else:
            raise
