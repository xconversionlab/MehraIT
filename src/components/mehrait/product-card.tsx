import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CategoryGlyph } from "./icons";
import { discountPercent, inr } from "@/lib/mehrait/pricing";
import { useCart } from "@/lib/mehrait/cart-store";
import { stockAt } from "@/lib/mehrait/use-catalog";
import type { Product } from "@/lib/mehrait/types";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  slug,
  storeId,
}: {
  product: Product;
  slug: string;
  storeId: number | null;
}) {
  const variant = product.variants[0];
  const lines = useCart((state) => state.lines);
  const add = useCart((state) => state.add);
  const setQty = useCart((state) => state.setQty);
  if (!variant) return null;
  const stock = stockAt(product, variant.id, storeId);
  const inCart = lines.find((line) => line.variantId === variant.id)?.qty ?? 0;
  const off = discountPercent(variant.mrpPaise, variant.pricePaise);
  return (
    <article className="flex w-40 shrink-0 snap-start flex-col rounded-3xl border border-line bg-cream p-2.5 sm:w-auto">
      <Link to="/p/$id" params={{ id: String(product.id) }} className="block">
        <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-brand/40">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <CategoryGlyph slug={slug} className="size-10 text-ink" />
          )}
        </div>
        <p className="mt-2 text-xs font-semibold tracking-wide text-muted uppercase">{product.brand}</p>
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-ink">{product.name}</h3>
        <p className="text-xs text-muted">{variant.unit}</p>
      </Link>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <p className="text-sm font-bold tabular-nums">{inr(variant.pricePaise)}</p>
          {off > 0 ? (
            <p className="text-xs text-muted">
              <span className="line-through tabular-nums">{inr(variant.mrpPaise)}</span>
              <span className="ml-1 font-semibold text-ink">{off}% off</span>
            </p>
          ) : null}
        </div>
        {stock <= 0 ? (
          <span className="text-xs font-semibold text-danger">Out</span>
        ) : inCart > 0 ? (
          <div className="flex h-9 items-center rounded-full bg-brand text-ink">
            <button type="button" className="grid h-9 w-8 place-items-center font-bold" onClick={() => setQty(variant.id, inCart - 1)} aria-label="Decrease quantity">
              −
            </button>
            <span className="w-4 text-center text-sm font-bold tabular-nums">{inCart}</span>
            <button
              type="button"
              className="grid h-9 w-8 place-items-center font-bold disabled:opacity-40"
              disabled={inCart >= stock}
              onClick={() => setQty(variant.id, inCart + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={cn("h-9 rounded-full bg-brand px-3 text-sm font-bold text-ink active:scale-95")}
            onClick={() => {
              add(variant.id, 1);
              toast.success(`${product.name} added`);
            }}
          >
            Add
          </button>
        )}
      </div>
      {stock > 0 && stock <= 8 ? <p className="mt-1 text-xs font-medium text-ink">Only {stock} left</p> : null}
    </article>
  );
}
