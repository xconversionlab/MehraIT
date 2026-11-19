import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Desk } from "@/components/mehrait/desk";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const { user, isPending } = useCurrentUserState();
  const [Chart, setChart] = useState<typeof import("@/components/mehrait/desk-chart").DeskChart | null>(null);
  useEffect(() => {
    void import("@/components/mehrait/desk-chart").then((mod) => setChart(() => mod.DeskChart));
  }, []);
  if (isPending) return <p className="p-6 text-sm text-muted">Opening the store desk…</p>;
  if (!user) return <RedirectToSignIn />;
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-extrabold">
          <img src="/brand/icon-192.png" alt="" className="h-10 w-10 rounded-xl" />
          Store desk
        </Link>
        <Link to="/account" className="text-sm font-semibold">Account</Link>
      </header>
      <Desk Chart={Chart} />
    </div>
  );
}
