import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, Shell, SkeletonRows } from "@/components/mehrait/shell";
import { useCart, usePlace } from "@/lib/mehrait/cart-store";
import { inr, quoteCart } from "@/lib/mehrait/pricing";
import { stockAt, useCatalog } from "@/lib/mehrait/use-catalog";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { catalog, loading } = useCatalog();
  const lines = useCart((state) => state.lines);
  const setQty = useCart((state) => state.setQty);
  const couponCode = useCart((state) => state.coupon);
  const setCoupon = useCart((state) => state.setCoupon);
  const place = usePlace();
  const store = catalog?.stores.find((item) => item.id === place.storeId) ?? catalog?.stores[0];

  const resolved = !catalog
    ? []
    : lines.flatMap((line) => {
        for (const product of catalog.products) {
          const variant = product.variants.find((item) => item.id === line.variantId);
          if (!variant) continue;
          return [{
            variantId: variant.id,
            productId: product.id,
            name: product.name,
            brand: product.brand,
            sku: variant.sku,
            unit: variant.unit,
            qty: line.qty,
            mrpPaise: variant.mrpPaise,
            pricePaise: variant.pricePaise,
            taxBps: variant.taxBps,
            stock: stockAt(product, variant.id, place.storeId),
          }];
        }
        return [];
      });

  const coupon = catalog?.coupons.find((item) => item.code === couponCode.trim().toUpperCase()) ?? null;
  const quote = store
    ? quoteCart({
        lines: resolved,
        coupon: couponCode ? coupon : null,
        deliveryFeePaise: store.deliveryFeePaise,
        freeAbovePaise: store.freeAbovePaise,
      })
    : null;

  return (
    <Shell>
      <h1 className="text-2xl font-extrabold tracking-tight">Cart</h1>
      {loading ? <div className="mt-4"><SkeletonRows /></div> : null}
      {!loading && resolved.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Your cart is empty" body="Add milk, fruit or whatever is missing at home." action={<Link to="/" className="inline-flex h-11 items-center rounded-full bg-brand px-4 font-semibold">Browse the store</Link>} />
        </div>
      ) : null}
      <ul className="mt-4 space-y-3">
        {resolved.map((line) => (
          <li key={line.variantId} className="flex items-center justify-between gap-3 rounded-3xl border border-line bg-cream p-3">
            <div>
              <p className="font-semibold">{line.name}</p>
              <p className="text-sm text-muted">{line.unit} · {inr(line.pricePaise)}</p>
              {line.qty > line.stock ? <p className="text-xs font-semibold text-danger">Only {line.stock} in stock here</p> : null}
            </div>
            <div className="flex h-10 items-center rounded-full bg-brand">
              <button type="button" className="grid h-10 w-9 place-items-center font-bold" onClick={() => setQty(line.variantId, line.qty - 1)} aria-label="Decrease">−</button>
              <span className="w-5 text-center text-sm font-bold tabular-nums">{line.qty}</span>
              <button type="button" className="grid h-10 w-9 place-items-center font-bold" onClick={() => setQty(line.variantId, Math.min(line.stock, line.qty + 1))} aria-label="Increase">+</button>
            </div>
          </li>
        ))}
      </ul>
      {quote && resolved.length > 0 ? (
        <section className="mt-4 rounded-3xl border border-line bg-cream p-4">
          <label className="text-sm font-semibold" htmlFor="coupon">Coupon</label>
          <input id="coupon" value={couponCode} onChange={(event) => setCoupon(event.target.value)} placeholder="MEHRA50" className="mt-2 h-11 w-full rounded-full border border-line bg-paper px-4 uppercase" />
          {couponCode && !coupon ? <p className="mt-2 text-sm text-danger">That code is not active.</p> : null}
          {quote.couponError ? <p className="mt-2 text-sm text-danger">{quote.couponError}</p> : null}
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between"><dt>Item total</dt><dd className="tabular-nums">{inr(quote.subtotalPaise)}</dd></div>
            <div className="flex justify-between"><dt>Discount</dt><dd className="tabular-nums">− {inr(quote.discountPaise)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd className="tabular-nums">{quote.deliveryPaise === 0 ? "Free" : inr(quote.deliveryPaise)}</dd></div>
            <div className="flex justify-between text-muted"><dt>GST included</dt><dd className="tabular-nums">{inr(quote.taxPaise)}</dd></div>
            <div className="flex justify-between pt-2 text-base font-bold"><dt>To pay</dt><dd className="tabular-nums">{inr(quote.payablePaise)}</dd></div>
          </dl>
          {!place.serviceable ? <p className="mt-3 text-sm text-danger">Choose a serviceable address before checkout.</p> : null}
          <Link to="/checkout" className="mt-4 flex h-12 items-center justify-center rounded-full bg-ink font-semibold text-cream">Checkout</Link>
        </section>
      ) : null}
    </Shell>
  );
}
