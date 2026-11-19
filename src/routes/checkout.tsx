import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listAddresses, placeOrder, saveAddress, startOnlinePayment, confirmOnlinePayment } from "@/lib/mehrait/account.functions";
import { useCart, usePlace } from "@/lib/mehrait/cart-store";
import { inr, quoteCart } from "@/lib/mehrait/pricing";
import { stockAt, useCatalog } from "@/lib/mehrait/use-catalog";
import { Shell } from "@/components/mehrait/shell";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

type Address = Awaited<ReturnType<typeof listAddresses>>[number];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function CheckoutPage() {
  const { user, isPending } = useCurrentUserState();
  const { catalog } = useCatalog();
  const navigate = useNavigate();
  const place = usePlace();
  const lines = useCart((state) => state.lines);
  const couponCode = useCart((state) => state.coupon);
  const clear = useCart((state) => state.clear);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ line1: "", label: "Home" as "Home" | "Work" | "Other", contactName: "", contactPhone: "" });

  useEffect(() => {
    if (!user) return;
    listAddresses().then((rows) => {
      setAddresses(rows);
      const match = rows.find((row) => row.pincode === place.pincode) ?? rows.find((row) => row.isDefault) ?? rows[0];
      if (match) setAddressId(match.id);
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load addresses."));
  }, [user, place.pincode]);

  if (isPending) return <Shell><p className="text-sm text-muted">Checking your session…</p></Shell>;
  if (!user) return <RedirectToSignIn />;

  const store = catalog?.stores.find((item) => item.id === place.storeId);
  const resolved = !catalog ? [] : lines.flatMap((line) => {
    for (const product of catalog.products) {
      const variant = product.variants.find((item) => item.id === line.variantId);
      if (!variant) continue;
      return [{
        variantId: variant.id, productId: product.id, name: product.name, brand: product.brand, sku: variant.sku,
        unit: variant.unit, qty: line.qty, mrpPaise: variant.mrpPaise, pricePaise: variant.pricePaise, taxBps: variant.taxBps,
        stock: stockAt(product, variant.id, place.storeId),
      }];
    }
    return [];
  });
  const coupon = catalog?.coupons.find((item) => item.code === couponCode.trim().toUpperCase()) ?? null;
  const quote = store ? quoteCart({ lines: resolved, coupon: couponCode ? coupon : null, deliveryFeePaise: store.deliveryFeePaise, freeAbovePaise: store.freeAbovePaise }) : null;
  const blocked = resolved.some((line) => line.qty > line.stock) || !place.serviceable || !store;

  async function addAddress() {
    if (!place.serviceable) {
      setError("Pick a serviceable area before saving an address.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const saved = await saveAddress({
        data: {
          label: form.label,
          line1: form.line1,
          area: place.label,
          city: place.city,
          pincode: place.pincode,
          contactName: form.contactName || user?.displayName || "Customer",
          contactPhone: form.contactPhone,
          isDefault: addresses.length === 0,
        },
      });
      const rows = await listAddresses();
      setAddresses(rows);
      setAddressId(saved.id ?? null);
      toast.success("Address saved");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save the address.");
    } finally {
      setBusy(false);
    }
  }

  async function payCod() {
    if (!store || !addressId || !quote) return;
    setBusy(true);
    setError("");
    try {
      const order = await placeOrder({
        data: {
          storeId: store.id,
          addressId,
          lines: resolved.map((line) => ({ variantId: line.variantId, qty: line.qty })),
          couponCode,
          paymentMethod: "cod",
        },
      });
      clear();
      toast.success("Order placed");
      await navigate({ to: "/orders/$id", params: { id: order.publicId } });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  async function payOnline() {
    if (!store || !addressId) return;
    setBusy(true);
    setError("");
    try {
      const started = await startOnlinePayment({
        data: {
          storeId: store.id,
          addressId,
          lines: resolved.map((line) => ({ variantId: line.variantId, qty: line.qty })),
          couponCode,
          paymentMethod: "online",
        },
      });
      await loadRazorpay();
      if (!window.Razorpay) throw new Error("Razorpay checkout did not load.");
      const checkout = new window.Razorpay({
        key: started.keyId,
        amount: started.amount,
        currency: "INR",
        order_id: started.gatewayOrderId,
        name: "MehraIT",
        description: started.publicId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await confirmOnlinePayment({
              data: {
                publicId: started.publicId,
                gatewayOrderId: response.razorpay_order_id,
                gatewayPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            });
            clear();
            await navigate({ to: "/orders/$id", params: { id: started.publicId } });
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Payment could not be confirmed.");
          }
        },
      });
      checkout.open();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Online payment is unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <h1 className="text-2xl font-extrabold tracking-tight">Checkout</h1>
      {!place.serviceable ? <p className="mt-3 text-sm text-danger">This location is outside the delivery area. Change it from the home screen.</p> : null}
      <section className="mt-4 rounded-3xl border border-line bg-cream p-4">
        <h2 className="font-semibold">Address</h2>
        <div className="mt-3 space-y-2">
          {addresses.map((address) => (
            <label key={address.id} className="flex cursor-pointer gap-3 rounded-2xl border border-line p-3">
              <input type="radio" name="address" checked={addressId === address.id} onChange={() => setAddressId(address.id)} />
              <span>
                <span className="block font-semibold">{address.label} · {address.area}</span>
                <span className="text-sm text-muted">{address.line1}, {address.city} {address.pincode}</span>
                {catalog && !catalog.areas.some((area) => area.pincode === address.pincode) ? <span className="block text-xs font-semibold text-danger">Outside delivery area</span> : null}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-2">
          <p className="text-sm text-muted">New address in {place.serviceable ? `${place.label}, ${place.pincode}` : "a serviceable area"}</p>
          <select value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value as "Home" | "Work" | "Other" })} className="h-11 rounded-full border border-line bg-paper px-3" aria-label="Label">
            <option>Home</option>
            <option>Work</option>
            <option>Other</option>
          </select>
          <input value={form.line1} onChange={(event) => setForm({ ...form, line1: event.target.value })} placeholder="Flat, building, street" className="h-11 rounded-full border border-line bg-paper px-4" />
          <input value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} placeholder="Name on the doorbell" className="h-11 rounded-full border border-line bg-paper px-4" />
          <input value={form.contactPhone} onChange={(event) => setForm({ ...form, contactPhone: event.target.value })} placeholder="10-digit mobile" inputMode="numeric" className="h-11 rounded-full border border-line bg-paper px-4" />
          <button type="button" disabled={busy} onClick={() => void addAddress()} className="h-11 rounded-full border border-line font-semibold">Save address</button>
        </div>
      </section>
      {quote ? (
        <section className="mt-4 rounded-3xl border border-line bg-cream p-4 text-sm">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="mt-2 space-y-1">
            {resolved.map((line) => <li key={line.variantId} className="flex justify-between"><span>{line.name} × {line.qty}</span><span className="tabular-nums">{inr(line.pricePaise * line.qty)}</span></li>)}
          </ul>
          <p className="mt-3 flex justify-between font-bold"><span>To pay</span><span className="tabular-nums">{inr(quote.payablePaise)}</span></p>
          <p className="text-muted">Delivery {quote.deliveryPaise === 0 ? "free" : inr(quote.deliveryPaise)} · GST included {inr(quote.taxPaise)}</p>
        </section>
      ) : null}
      <section className="mt-4 rounded-3xl border border-line bg-cream p-4">
        <h2 className="font-semibold">Payment</h2>
        <p className="mt-1 text-sm text-muted">Cash on delivery is live. Razorpay runs only when sandbox keys are configured on the server — nothing is charged otherwise.</p>
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
        <button type="button" disabled={busy || blocked || !addressId} onClick={() => void payCod()} className="mt-3 h-12 w-full rounded-full bg-brand font-bold text-ink disabled:opacity-40">
          Place cash on delivery order
        </button>
        <button type="button" disabled={busy || blocked || !addressId || !catalog?.settings.razorpayConfigured} onClick={() => void payOnline()} className="mt-2 h-12 w-full rounded-full bg-ink font-semibold text-cream disabled:opacity-40">
          {catalog?.settings.razorpayConfigured ? "Pay online with Razorpay" : "Online payment not connected"}
        </button>
      </section>
    </Shell>
  );
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay."));
    document.body.appendChild(script);
  });
}
