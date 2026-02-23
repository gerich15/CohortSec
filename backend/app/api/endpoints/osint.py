"""OSINT endpoints: Sherlock username search, phone validation."""

import asyncio
import re
from typing import Any, List

import phonenumbers
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.utils.deps import get_current_user

def _phone_type_str(nt) -> str:
    if nt is None:
        return "UNKNOWN"
    return getattr(nt, "name", str(nt))


router = APIRouter(prefix="/osint", tags=["osint"])


class UsernameSearchRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50, pattern=r"^[a-zA-Z0-9_.-]+$")


class UsernameResult(BaseModel):
    site: str
    url: str
    status: str
    response_time: float | None = None


class UsernameSearchResponse(BaseModel):
    username: str
    found: List[UsernameResult] = []
    total: int = 0


class PhoneValidateRequest(BaseModel):
    phone: str = Field(..., min_length=5, max_length=20)


class PhoneValidateResponse(BaseModel):
    valid: bool
    formatted: str | None = None
    country_code: int | None = None
    country: str | None = None
    carrier: str | None = None
    number_type: str | None = None


def _run_sherlock(username: str) -> List[dict[str, Any]]:
    """Run Sherlock as Python module and collect claimed accounts. Needs: pip install sherlock-project."""
    found: List[dict[str, Any]] = []
    try:
        from sherlock.notify import QueryNotifyPrint
        from sherlock.result import QueryStatus
        from sherlock.sherlock import sherlock
        from sherlock.sites import SitesInformation

        sites_info = SitesInformation()
        notify = QueryNotifyPrint(verbose=False, print_all=False)
        results = sherlock(username, sites_info.sites, notify, timeout=15)
        if isinstance(results, dict):
            for site_name, site_result in results.items():
                if hasattr(site_result, "status") and getattr(site_result.status, "status", None) == QueryStatus.CLAIMED:
                    url = getattr(site_result, "url_user", None) or getattr(site_result, "url", "")
                    found.append(
                        {
                            "site": site_name,
                            "url": str(url) if url else "",
                            "status": "Claimed",
                            "response_time": getattr(site_result, "query_time", None),
                        }
                    )
    except (ImportError, AttributeError, Exception):
        pass
    return found


@router.post("/username-search", response_model=UsernameSearchResponse)
def search_username(
    request: UsernameSearchRequest,
    user: Any = Depends(get_current_user),
):
    """Search for username across social networks (Sherlock). Requires auth."""
    username = request.username.strip()
    found = _run_sherlock(username)
    return UsernameSearchResponse(
        username=username,
        found=[
            UsernameResult(
                site=r["site"],
                url=r.get("url", ""),
                status=r.get("status", "Claimed"),
                response_time=r.get("response_time"),
            )
            for r in found
        ],
        total=len(found),
    )


@router.post("/phone-validate", response_model=PhoneValidateResponse)
def validate_phone(
    request: PhoneValidateRequest,
    user: Any = Depends(get_current_user),
):
    """Validate and parse phone number. Returns format and region info."""
    raw = re.sub(r"[\s\-\(\)]", "", request.phone)
    if not raw.startswith("+"):
        raw = "+" + raw
    try:
        parsed = phonenumbers.parse(raw, None)
        valid = phonenumbers.is_valid_number(parsed)
        return PhoneValidateResponse(
            valid=valid,
            formatted=phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL),
            country_code=parsed.country_code,
            country=phonenumbers.region_code_for_number(parsed),
            number_type=_phone_type_str(phonenumbers.number_type(parsed)) if valid else None,
        )
    except phonenumbers.NumberParseException:
        return PhoneValidateResponse(valid=False)
