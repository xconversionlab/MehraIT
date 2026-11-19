import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LocationButton, LocationSheet } from "@/components/mehrait/location-sheet";
import { CategoryGlyph } from "@/components/mehrait/icons";
import { ProductCard } from "@/components/mehrait/product-card";
import { Shell, SkeletonRows } from "@/components/mehrait/shell";
import { useCart, usePlace } from "@/lib/mehrait/cart-store";
import { useCatalog, rootCategory } from "@/lib/mehrait/use-catalog";
import type { Catalog, Product } from "@/lib/mehrait/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { catalog, error, loading, reload } = useCatalog();
  const place = usePlace();
  const [open, setOpen] = useState(false);
  const introSeen = useCart((state) => state.introSeen);
  const dismissIntro = useCart((state) => state.dismissIntro);
  const setCoupon = useCart((state) => state.setCoupon);
  const biharCities = catalog ? [...new Set(catalog.areas.map((area) => area.city))].join(", ") : "";

  return (
    <Shell>
      {loading || !catalog ? (
        <div>
          <div className="mb-4 h-11 w-56 animate-pulse rounded-full bg-line" />
          <SkeletonRows />
          {error ? (
            <div className="mt-4 rounded-3xl border border-line bg-cream p-4">
              <p className="font-semibold">The store did not load.</p>
              <p className="mt-1 text-sm text-muted">{error}</p>
              <button type="button" onClick={reload} className="mt-3 h-11 rounded-full bg-brand px-4 font-semibold">
                Try again
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <LocationButton catalog={catalog} onOpen={() => setOpen(true)} />
            <p className="text-sm text-muted">{catalog.settings.tagline}</p>
          </div>
          {!place.serviceable ? (
            <div className="mt-4 rounded-3xl bg-ink p-4 text-cream">
              <p className="font-semibold">MehraIT is not in {place.pincode || "this pin"} yet.</p>
              <p className="mt-1 text-sm text-cream/80">This demo currently shows service areas in {biharCities}, Bihar. Choose a listed area to shop.</p>
            </div>
          ) : null}
          {!introSeen ? (
            <div className="mt-4 flex items-start justify-between gap-3 rounded-3xl bg-brand p-4 text-ink">
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase">Bihar favourites</p>
                <p className="mt-1 text-lg font-semibold">Everyday essentials and regional favourites from a nearby Bihar store.</p>
              </div>
              <button type="button" onClick={dismissIntro} className="h-9 shrink-0 rounded-full bg-ink px-3 text-sm font-semibold text-cream">
                Got it
              </button>
            </div>
          ) : null}
          <div className="rail mt-4 flex gap-3 overflow-x-auto pb-1">
            {catalog.banners.map((banner) => {
              const slug = banner.href.startsWith("/c/") ? banner.href.slice(3) : "";
              const className = cn(
                "block w-72 shrink-0 snap-start rounded-3xl p-5",
                banner.tone === "ink" && "bg-ink text-cream",
                banner.tone === "cream" && "border border-line bg-cream text-ink",
                banner.tone !== "ink" && banner.tone !== "cream" && "bg-brand text-ink",
              );
              const inner = (
                <>
                  <p className="text-xs font-semibold tracking-wide uppercase opacity-70">{catalog.settings.promise}</p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{banner.title}</h2>
                  <p className="mt-2 text-sm opacity-80">{banner.subtitle}</p>
                </>
              );
              return slug ? (
                <Link key={banner.id} to="/c/$slug" params={{ slug }} className={className}>
                  {inner}
                </Link>
              ) : (
                <div key={banner.id} className={className}>{inner}</div>
              );
            })}
          </div>
          <Link to="/search" className="mt-4 flex h-12 items-center rounded-full border border-line bg-cream px-4 text-sm text-muted md:hidden">
            Search sattu, makhana, litti atta
          </Link>
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Categories</h2>
              <Link to="/categories" className="text-sm font-semibold">See all</Link>
            </div>
            <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
              {catalog.categories.filter((category) => category.parentId == null).map((category) => (
                <Link key={category.id} to="/c/$slug" params={{ slug: category.slug }} className="text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand">
                    <CategoryGlyph slug={category.slug} className="size-6" />
                  </span>
                  <span className="mt-2 block text-xs leading-4 font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </section>
          <Rail title="Bestsellers" catalog={catalog} products={catalog.products.filter((product) => product.bestseller)} placeStore={place.storeId} />
          <Rail title="Featured" catalog={catalog} products={catalog.products.filter((product) => product.featured)} placeStore={place.storeId} />
          <section className="mt-6">
            <h2 className="text-lg font-semibold">Offers</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {catalog.coupons.map((coupon) => (
                <button
                  key={coupon.code}
                  type="button"
                  onClick={() => setCoupon(coupon.code)}
                  className="rounded-3xl border border-line bg-cream p-4 text-left"
                >
                  <p className="text-xs font-semibold tracking-wide text-muted uppercase">Tap to apply</p>
                  <p className="mt-1 text-lg font-extrabold">{coupon.code}</p>
                  <p className="text-sm text-muted">{coupon.description}</p>
                </button>
              ))}
            </div>
          </section>
          <footer className="mt-10 border-t border-line pt-4 text-sm text-muted">
            <p className="font-semibold text-ink">{catalog.settings.businessName}</p>
            <p className="mt-1">{catalog.settings.tagline}</p>
            {catalog.settings.supportPhone || catalog.settings.supportEmail ? (
              <p className="mt-1">Care { [catalog.settings.supportPhone, catalog.settings.supportEmail].filter(Boolean).join(" · ") }</p>
            ) : null}
            {catalog.settings.gstin ? <p className="mt-1">GSTIN {catalog.settings.gstin}</p> : null}
            <p className="mt-2 text-xs">Service locations and delivery estimates shown here are illustrative demo data.</p>
          </footer>
          {open ? <LocationSheet catalog={catalog} onClose={() => setOpen(false)} /> : null}
        </div>
      )}
    </Shell>
  );
}

function Rail({ title, products, catalog, placeStore }: { title: string; products: Product[]; catalog: Catalog; placeStore: number | null }) {
  if (!products || !Array.isArray(products) || products.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="rail mt-3 flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible">
        {products.map((product) => {
          const root = rootCategory(catalog.categories, product.categoryId);
          return <ProductCard key={product.id} product={product} slug={root?.slug ?? "snacks"} storeId={placeStore} />;
        })}
      </div>
    </section>
  );
}
