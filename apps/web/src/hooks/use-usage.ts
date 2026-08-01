"use client";
import { useEffect, useState } from "react";

interface Usage {
  toolUsage: number;
  apiCalls: number;
  limit: number;
}

export function useUsage() {
  const [usage, setUsage] = useState<Usage>({ toolUsage: 0, apiCalls: 0, limit: 10 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data) => {
        setUsage(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { usage, loading, isLimited: usage.toolUsage >= usage.limit };
}
