"use client";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
  });

export function useClientSession() {
  const { data, error, mutate, isLoading } = useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
  });

  return {
    isLoading,
    user: data?.user,
    folders: data?.folders,
    error: error?.message,
    mutate,
  };
}
