import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cancelOrder, createReview, getOrder } from "@/lib/mehrait/account.functions";
import { inr } from "@/lib/mehrait/pricing";
import { ORDER_FLOW, STATUS_LABEL } from "@/lib/mehrait/types";
import { Shell } from "@/components/mehrait/shell";

export const Route = createFileRoute("/orders/$id")({ component: OrderPage });

function OrderPage() {
  const { id } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const [order, setOrder] = useState<Awaited<ReturnType<typeof getOrder>> | null>(null);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("Changed my mind");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  function load() {
    getOrder({ data: id }).then(setOrder).catch((err: unknown) => setError(err instanceof Error ? err.message : "Order not found."));
  }

  useEffect(() => {
    if (user) load();
  }, [user, id]);

  if (isPending) return <Shell><p className="text-sm text-muted">Checking your session…</p></Shell>;
  if (!user) return <RedirectToSignIn />;

  const address = order?.address ?? {};
  const flowIndex = order ? ORDER_FLOW.indexOf(order.status as (typeof ORDER_FLOW)[number]) : -1;
  const terminal = order?.status === "cancelled" || order?.status === "refund_initiated" || order?.status === "refunded";

  return (
    <Shell>
      <Link to="/account" className="text-sm font-semibold">Account</Link>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{id}</h1>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {!order && !error ? <p className="mt-3 text-sm text-muted">Loading order…</p> : null}
      {order ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <section className="rounded-3xl border border-line bg-cream p-4">
            <p className="text-sm font-semibold">{STATUS_LABEL[order.status] ?? order.status}</p>
            {terminal ? <p className="mt-2 text-sm text-muted">{order.cancelReason}</p> : (
              <ol className="mt-3 space-y-2">
                {ORDER_FLOW.map((status, index) => (
                  <li key={status} className="flex items-center gap-2 text-sm">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${index <= flowIndex ? "bg-brand text-ink" : "bg-line text-muted"}`}>{index + 1}</span>
                    {STATUS_LABEL[status]}
                  </li>
                ))}
              </ol>
            )}
            {order.otp ? (
              <p className="mt-4 rounded-2xl bg-brand p-3 text-sm font-semibold">Delivery code {order.otp}. Share it when the partner arrives.</p>
            ) : null}
            {order.partner ? (
              <div className="mt-4 text-sm">
                <p className="font-semibold">{order.partner.name}</p>
                <p className="text-muted">{order.partner.phone || "Phone shared at pickup"}</p>
                {order.partner.lat != null && order.partner.lng != null ? (
                  <a className="mt-1 inline-block font-semibold" href={`https://www.google.com/maps/dir/?api=1&destination=${order.partner.lat},${order.partner.lng}`} target="_blank" rel="noreferrer">
                    Last shared pin
                  </a>
                ) : <p className="text-muted">Live GPS appears when the partner shares a fix. Automatic dispatch is not connected.</p>}
              </div>
            ) : null}
          </section>
          <section className="rounded-3xl border border-line bg-cream p-4 text-sm">
            <h2 className="font-semibold">Delivering to</h2>
            <p className="mt-1">{String(address.line1 ?? "")}</p>
            <p className="text-muted">{String(address.area ?? "")}, {String(address.city ?? "")} {String(address.pincode ?? "")}</p>
            <ul className="mt-4 space-y-1">
              {order.items.map((item) => (
                <li key={item.name} className="flex justify-between"><span>{item.name} × {item.qty}</span><span className="tabular-nums">{inr(item.pricePaise * item.qty)}</span></li>
              ))}
            </ul>
            <p className="mt-3 flex justify-between font-bold"><span>Paid</span><span className="tabular-nums">{inr(order.payablePaise)}</span></p>
            <p className="text-muted">{order.payment?.provider ?? order.paymentMethod} · {order.payment?.status ?? "recorded"} · GST included {inr(order.taxPaise)}</p>
            {(order.status === "pending" || order.status === "confirmed") ? (
              <form className="mt-4 space-y-2" onSubmit={(event) => {
                event.preventDefault();
                cancelOrder({ data: { publicId: order.publicId, reason } })
                  .then(() => { toast.success("Order cancelled"); load(); })
                  .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not cancel."));
              }}>
                <input value={reason} onChange={(event) => setReason(event.target.value)} className="h-11 w-full rounded-full border border-line px-4" />
                <button type="submit" className="h-11 rounded-full border border-line px-4 font-semibold">Cancel order</button>
              </form>
            ) : null}
            {order.status === "delivered" ? (
              <form className="mt-4 space-y-2" onSubmit={(event) => {
                event.preventDefault();
                const productId = order.items.find((item) => item.productId)?.productId;
                if (!productId) return;
                createReview({ data: { publicId: order.publicId, productId, rating, body: review } })
                  .then(() => toast.success("Thanks for the rating"))
                  .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not save the rating."));
              }}>
                <p className="font-semibold">Rate this order</p>
                <input type="number" min={1} max={5} value={rating} onChange={(event) => setRating(Number(event.target.value))} className="h-11 w-24 rounded-full border border-line px-4" aria-label="Rating" />
                <textarea value={review} onChange={(event) => setReview(event.target.value)} placeholder="Optional note" className="min-h-20 w-full rounded-2xl border border-line p-3" />
                <button type="submit" className="h-11 rounded-full bg-brand px-4 font-bold">Submit rating</button>
              </form>
            ) : null}
          </section>
        </div>
      ) : null}
    </Shell>
  );
}
