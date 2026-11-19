import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getRider, joinRoster, riderAdvance, setAvailability, shareLocation } from "@/lib/mehrait/rider.functions";
import { inr } from "@/lib/mehrait/pricing";
import { STATUS_LABEL } from "@/lib/mehrait/types";

export const Route = createFileRoute("/rider")({ component: RiderPage });

function RiderPage() {
  const { user, isPending } = useCurrentUserState();
  const [data, setData] = useState<Awaited<ReturnType<typeof getRider>> | null>(null);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");

  function load() {
    getRider().then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not open rider mode."));
  }
  useEffect(() => { if (user) load(); }, [user]);

  if (isPending) return <p className="p-6 text-sm">Opening rider mode…</p>;
  if (!user) return <RedirectToSignIn />;

  async function act(publicId: string, action: "pickup" | "out" | "deliver") {
    setError("");
    try {
      await riderAdvance({ data: { publicId, action, otp } });
      setOtp("");
      toast.success("Updated");
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update the delivery.");
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-paper px-4 py-4 text-ink">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold">
          <img src="/brand/icon-192.png" alt="" className="h-10 w-10 rounded-xl" /> Rider
        </Link>
        <Link to="/account" className="text-sm font-semibold">Account</Link>
      </div>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {!data ? <p className="mt-6 text-sm text-muted">Loading assignments…</p> : null}
      {data && !data.enrolled ? (
        <section className="mt-6 rounded-3xl border border-line bg-cream p-4">
          <h1 className="text-xl font-extrabold">You are not on the roster</h1>
          <p className="mt-2 text-sm text-muted">A delivery manager adds partners. The first store owner is enrolled automatically.</p>
          {data.canJoin ? (
            <button type="button" className="mt-4 h-12 rounded-full bg-brand px-5 font-bold" onClick={() => joinRoster().then(load).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not join."))}>
              Join the roster
            </button>
          ) : null}
        </section>
      ) : null}
      {data && data.enrolled ? (
        <div className="mt-4 space-y-4">
          <section className="rounded-3xl bg-brand p-4">
            <p className="text-sm font-semibold">{data.name}</p>
            <p className="text-2xl font-extrabold tabular-nums">{inr(data.earningsPaise)}</p>
            <p className="text-sm">Delivered earnings · {data.vehicle}</p>
            <button
              type="button"
              className="mt-3 h-12 w-full rounded-full bg-ink font-bold text-cream"
              onClick={() => setAvailability({ data: !data.available }).then(load)}
            >
              {data.available ? "You are available · go offline" : "Go available"}
            </button>
            <button
              type="button"
              className="mt-2 h-11 w-full rounded-full bg-cream font-semibold"
              onClick={() => {
                if (!navigator.geolocation) { setError("This browser cannot share location."); return; }
                navigator.geolocation.getCurrentPosition(
                  (pos) => shareLocation({ data: { lat: pos.coords.latitude, lng: pos.coords.longitude } }).then(() => toast.success("Location shared")).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not share.")),
                  () => setError("Location permission is off."),
                );
              }}
            >
              Share my location
            </button>
          </section>
          <section>
            <h2 className="font-semibold">Assigned</h2>
            {data.jobs.length === 0 ? <p className="mt-2 text-sm text-muted">No active drops. Stay available and the desk will assign you.</p> : null}
            <ul className="mt-2 space-y-3">
              {data.jobs.map((job) => {
                const line1 = String(job.address.line1 ?? "");
                const area = String(job.address.area ?? "");
                const pin = String(job.address.pincode ?? "");
                const lat = job.address.lat;
                const lng = job.address.lng;
                const dest = typeof lat === "number" && typeof lng === "number" ? `${lat},${lng}` : encodeURIComponent(`${line1} ${area} ${pin}`);
                return (
                  <li key={job.publicId} className="rounded-3xl border border-line bg-cream p-4">
                    <p className="font-extrabold">{job.publicId}</p>
                    <p className="text-sm">{STATUS_LABEL[job.status] ?? job.status} · payout {inr(job.payoutPaise)}</p>
                    <p className="mt-2 text-sm font-semibold">Pickup · {job.storeName}</p>
                    <p className="text-sm text-muted">{job.storeAddress}</p>
                    <a className="text-sm font-semibold" href={`https://www.google.com/maps/dir/?api=1&destination=${job.storeLat},${job.storeLng}`} target="_blank" rel="noreferrer">Navigate to store</a>
                    <p className="mt-2 text-sm font-semibold">Drop · {area}</p>
                    <p className="text-sm text-muted">{line1}, {pin}</p>
                    <a className="text-sm font-semibold" href={`https://www.google.com/maps/dir/?api=1&destination=${dest}`} target="_blank" rel="noreferrer">Navigate to customer</a>
                    <div className="mt-3 grid gap-2">
                      {job.status === "assigned" ? <button type="button" className="h-12 rounded-full bg-brand font-bold" onClick={() => void act(job.publicId, "pickup")}>Confirm pickup</button> : null}
                      {job.status === "picked_up" ? <button type="button" className="h-12 rounded-full bg-brand font-bold" onClick={() => void act(job.publicId, "out")}>Start delivery</button> : null}
                      {job.status === "out_for_delivery" ? (
                        <>
                          <input value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" placeholder="Customer delivery code" className="h-12 rounded-full border border-line px-4" />
                          <button type="button" className="h-12 rounded-full bg-ink font-bold text-cream" onClick={() => void act(job.publicId, "deliver")}>Complete delivery</button>
                        </>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
          <section>
            <h2 className="font-semibold">History</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {data.history.length === 0 ? <li className="text-muted">No completed drops yet.</li> : null}
              {data.history.map((row) => (
                <li key={row.publicId} className="flex justify-between rounded-2xl border border-line px-3 py-2">
                  <span>{row.publicId}</span>
                  <span className="tabular-nums">{STATUS_LABEL[row.status] ?? row.status} · {inr(row.payoutPaise)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </main>
  );
}
