"use client";

import { useEffect } from "react";

const loginUrl =
  process.env.NEXT_PUBLIC_MAYOR_LOGIN_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:4187/"
    : "https://mayors-dashboard-login.vercel.app/");

export function SessionHistoryGuard() {
  useEffect(() => {
    let locking = false;

    const lockSession = async () => {
      if (locking) return;
      locking = true;
      document.documentElement.dataset.sessionLocking = "true";

      try {
        await fetch("/api/auth/lock", {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          keepalive: true,
        });
      } finally {
        window.location.replace(loginUrl);
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void lockSession();
    };

    window.addEventListener("pageshow", handlePageShow);

    const navigation = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (
      document.documentElement.dataset.historyNavigation === "true" ||
      navigation?.type === "back_forward"
    ) {
      void lockSession();
    }

    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
}
