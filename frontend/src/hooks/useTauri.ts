/**
 * Хуки для интеграции с Tauri (десктопное приложение)
 */

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useCallback, useState } from "react";

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

export function useAutostart() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    if (!isTauri()) return;
    try {
      const e = await invoke<boolean>("is_autostart_enabled");
      setEnabled(e);
    } catch {
      setEnabled(false);
    }
  }, []);

  const set = useCallback(async (value: boolean) => {
    if (!isTauri()) return;
    setLoading(true);
    try {
      await invoke("set_autostart", { enabled: value });
      setEnabled(value);
    } catch {
      setEnabled(!value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { enabled, set, loading, isDesktop: isTauri() };
}

export function useCheckSecurityEvent(callback: () => void) {
  useEffect(() => {
    if (!isTauri()) return;
    const unlisten = listen("check-security", callback);
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [callback]);
}

export function useTriggerSecurityCheck() {
  return useCallback(async () => {
    if (!isTauri()) return;
    await invoke("trigger_security_check");
  }, []);
}
