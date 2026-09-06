"use client";

import { useRouter } from "next/navigation";

export function AdminLogout() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        router.refresh();
      }}
      className="font-mono text-[10px] tracking-[0.16em] text-ink-3 uppercase underline-offset-4 hover:text-ink hover:underline"
    >
      Logout
    </button>
  );
}
