"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, useNotificationStore } from "@/store";

/**
 * AuthInitializer — silently syncs the Zustand auth store with the server
 * cookie session on every page mount. Must be rendered inside the Providers tree.
 * It does NOT render any UI.
 */
export function AuthInitializer() {
  const { user, setUser, setLoading } = useAuthStore();
  const { setNotifications } = useNotificationStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch {
        // Network error — keep existing user from persisted store
      } finally {
        setLoading(false);
      }
    }

    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications?limit=20", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setNotifications(data.data?.notifications || []);
          }
        }
      } catch {
        // Silently ignore
      }
    }

    init();
    fetchNotifications();
  }, [setUser, setLoading, setNotifications]);

  return null;
}
