import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, Search, ShoppingBag, UserRound } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { pullCart, syncCart } from "@/lib/mehrait/account.functions";
import { useCart, usePlace } from "@/lib/mehrait/cart-store";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/categories", label: "Categories", icon: LayoutGrid, exact: false },
  { to: "/search", label: "Search", icon: Search, exact: false },
  { to: "/cart", label: "Cart", icon: ShoppingBag, exact: false },
  { to: "/account", label: "Account", icon: UserRound, exact: false },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const lines = useCart((state) => state.lines);
  const setLines = useCart((state) => state.setLines);
  const user = useCurrentUser();
  const pulled = useRef(false);
  const count = lines.reduce((sum, line) => sum + line.qty, 0);

  useEffect(() => {
    void Promise.all([useCart.persist.rehydrate(), usePlace.persist.rehydrate()]);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (lines.length === 0 && !pulled.current) {
      pulled.current = true;
      pullCart()
        .then((rows) => {
          if (rows.length) setLines(rows);
        })
        .catch(() => undefined);
      return;
    }
    const timer = window.setTimeout(() => {
      syncCart({ data: lines }).catch(() => undefined);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [lines, setLines, user]);

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/brand/icon-192.png" alt="" className="h-11 w-11 rounded-2xl object-cover" />
            <span className="text-lg leading-none font-extrabold tracking-tight">
              MEHRA<span className="ml-0.5 rounded-md bg-brand px-1 py-0.5">IT</span>
            </span>
          </Link>
          <Link
            to="/search"
            className="ml-auto hidden h-11 min-w-0 flex-1 items-center rounded-full border border-line bg-cream px-4 text-sm text-muted md:flex"
          >
            Search milk, atta, bananas
          </Link>
          <Link to="/cart" className="relative ml-auto grid h-11 w-11 place-items-center rounded-full border border-line bg-cream md:ml-0" aria-label="Cart">
            <ShoppingBag className="size-5" />
            {count > 0 ? (
              <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-bold text-ink tabular-nums">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream md:hidden" aria-label="Primary">
        <ul className="grid grid-cols-5">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link to={item.to} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 text-xs", active ? "font-semibold text-ink" : "text-muted")}>
                  <span className={cn("grid h-8 w-10 place-items-center rounded-full", active && "bg-brand")}>
                    <Icon className="size-5" />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-cream px-6 py-12 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function SkeletonRows() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-56 animate-pulse rounded-3xl bg-line/70" />
      ))}
    </div>
  );
}
