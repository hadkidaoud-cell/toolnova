"use client";
import { useEffect, useState } from "react";

interface Subscription {
  plan: "free" | "pro" | "enterprise";
  expiresAt: string | null;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription>({ plan: "free", expiresAt: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscription/status")
      .then((r) => r.json())
      .then((data) => {
        setSubscription(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { subscription, loading, isPro: subscription.plan !== "free" };
}
