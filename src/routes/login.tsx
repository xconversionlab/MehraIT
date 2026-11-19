import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isPending && user) return <Navigate to="/" />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "up") {
        const created = await authClient.signUp.email({ email, password, name: name || email.split("@")[0] });
        if (created.error) throw new Error(created.error.message || "Could not create the account.");
      }
      const signed = await authClient.signIn.email({ email, password });
      if (signed.error) throw new Error(signed.error.message || "Could not sign in.");
      window.location.assign("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in.");
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <section className="flex flex-col justify-between bg-brand p-6 text-ink md:p-10">
        <Link to="/" className="flex items-center gap-3">
          <img src="/brand/icon-192.png" alt="" className="h-14 w-14 rounded-2xl" />
          <span className="text-2xl font-extrabold tracking-tight">MEHRA<span className="rounded-md bg-ink px-1 text-brand">IT</span></span>
        </Link>
        <div className="mt-8">
          <p className="text-sm font-semibold tracking-wide uppercase">Shop smart · Live better</p>
          <h1 className="mt-2 max-w-sm text-4xl font-extrabold tracking-tight">Groceries from a store near you.</h1>
          <ul className="mt-6 space-y-2 text-sm font-medium">
            <li>Minutes, not a next-day slot.</li>
            <li>Live in parts of Bengaluru and Mumbai.</li>
            <li>Track the order from packed to delivered.</li>
          </ul>
        </div>
        <p className="mt-8 text-sm">SMS one-time passwords are not used. Sign in with email, Google or X.</p>
      </section>
      <section className="flex items-center bg-paper p-6 md:p-10">
        <div className="mx-auto w-full max-w-sm">
          {isPending ? <div className="h-11 w-40 animate-pulse rounded-full bg-line" /> : null}
          <h2 className="text-2xl font-extrabold">{mode === "in" ? "Welcome back" : "Create your account"}</h2>
          <form onSubmit={(event) => void submit(event)} className="mt-4 space-y-3">
            {mode === "up" ? (
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className="h-12 w-full rounded-full border border-line bg-cream px-4" required />
            ) : null}
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" autoComplete="email" className="h-12 w-full rounded-full border border-line bg-cream px-4" required />
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" autoComplete={mode === "up" ? "new-password" : "current-password"} className="h-12 w-full rounded-full border border-line bg-cream px-4" required />
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <button type="submit" disabled={busy || !authEnabled} className="h-12 w-full rounded-full bg-brand font-bold text-ink disabled:opacity-50">
              {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
            </button>
          </form>
          <button type="button" className="mt-3 text-sm font-semibold" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? "New to MehraIT? Create an account" : "Already have an account? Sign in"}
          </button>
          <div className="my-4 h-px bg-line" />
          <div className="space-y-2">
            {authEnabled ? GROK_PROVIDERS.map((provider) => (
              <button key={provider.providerId} type="button" onClick={() => signIn(provider.providerId, { callbackURL: "/" })} className="h-12 w-full rounded-full border border-line bg-cream font-semibold">
                Continue with {provider.label}
              </button>
            )) : <p className="text-sm text-muted">Sign-in is turned off.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
