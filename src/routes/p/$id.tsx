import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell, SkeletonRows } from "@/components/mehrait/shell";
import { CategoryGlyph } from "@/components/mehrait/icons";
import { listProductReviews } from "@/lib/mehrait/catalog.functions";
import { useCart, usePlace } from "@/lib/mehrait/cart-store";
import { discountPercent, inr } from "@/lib/mehrait/pricing";
import { rootCategory, stockAt, useCatalog } from "@/lib/mehrait/use-catalog";

export const Route = createFileRoute("/p/$id")({ component: ProductPage });

function ProductPage() {
  const { id } = Route.useParams();
  const { catalog, loading, error } = useCatalog();
  const storeId = usePlace((state) => state.storeId);
  const add = useCart((state) => state.add);
  const product = catalog?.products.find((item) => item.id === Number(id));
  const [variantId, setVariantId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<{ rating: number; body: string; name: string }[]>([]);
  const variant = product?.variants.find((item) => item.id === (variantId ?? product.variants[0]?.id));
  const slug = product && catalog ? rootCategory(catalog.categories, product.categoryId)?.slug ?? "snacks" : "snacks";
  const stock = product && variant ? stockAt(product, variant.id, storeId) : 0;

  useEffect(() => {
    if (!product) return;
    listProductReviews({ data: product.id }).then(setReviews).catch(() => setReviews([]));
  }, [product?.id]);

  return (
    <Shell>
      {loading || !catalog ? <SkeletonRows /> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {catalog && !product ? (
        <p>This product is not on the shelf. <Link to="/" className="font-semibold">Back home</Link></p>
      ) : null}
      {product && variant ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid aspect-square place-items-center rounded-3xl bg-brand/40">
            {product.imageUrl ? <img src={product.imageUrl} alt="" className="h-full w-full rounded-3xl object-cover" /> : <CategoryGlyph slug={slug} className="size-16" />}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">{product.brand}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{product.name}</h1>
            <p className="mt-2 text-sm text-muted">{product.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.variants.map((item) => (
                <button key={item.id} type="button" onClick={() => setVariantId(item.id)} className={`h-10 rounded-full px-3 text-sm font-semibold ${item.id === variant.id ? "bg-ink text-cream" : "border border-line bg-cream"}`}>
                  {item.name}
                </button>
              ))}
            </div>
            <p className="mt-4 text-2xl font-extrabold tabular-nums">{inr(variant.pricePaise)}</p>
            {discountPercent(variant.mrpPaise, variant.pricePaise) > 0 ? (
              <p className="text-sm text-muted">MRP <span className="line-through tabular-nums">{inr(variant.mrpPaise)}</span> · {discountPercent(variant.mrpPaise, variant.pricePaise)}% off · incl. GST</p>
            ) : <p className="text-sm text-muted">Inclusive of GST · {variant.sku}</p>}
            <p className="mt-2 text-sm">{stock > 0 ? `${stock} in stock at this store` : "Out of stock at this store"}</p>
            <button
              type="button"
              disabled={stock <= 0}
              onClick={() => { add(variant.id, 1); toast.success("Added to cart"); }}
              className="mt-4 h-12 w-full rounded-full bg-brand font-bold text-ink disabled:opacity-40 md:w-auto md:px-8"
            >
              {stock > 0 ? "Add to cart" : "Out of stock"}
            </button>
            <section className="mt-8">
              <h2 className="font-semibold">Ratings</h2>
              {reviews.length === 0 ? <p className="mt-2 text-sm text-muted">No ratings yet.</p> : (
                <ul className="mt-2 space-y-2">
                  {reviews.map((review, index) => (
                    <li key={index} className="rounded-2xl border border-line bg-cream p-3">
                      <p className="text-sm font-semibold">{review.name} · {review.rating}/5</p>
                      {review.body ? <p className="text-sm text-muted">{review.body}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}
