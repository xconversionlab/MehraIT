import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/mehrait/product-card";
import { EmptyState, Shell, SkeletonRows } from "@/components/mehrait/shell";
import { usePlace } from "@/lib/mehrait/cart-store";
import { productsIn, rootCategory, useCatalog } from "@/lib/mehrait/use-catalog";

export const Route = createFileRoute("/c/$slug")({ component: CategoryPage });

function CategoryPage() {
  const { slug } = Route.useParams();
  const { catalog, error, loading } = useCatalog();
  const storeId = usePlace((state) => state.storeId);
  const [child, setChild] = useState<string | null>(null);
  const category = catalog?.categories.find((item) => item.slug === slug);
  const children = catalog?.categories.filter((item) => item.parentId === category?.id) ?? [];
  const products = catalog ? productsIn(catalog, child ?? slug) : [];
  return (
    <Shell>
      {loading || !catalog ? (
        <SkeletonRows />
      ) : error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : !category ? (
        <EmptyState title="Category not found" body="That aisle is not on the shelf." action={<Link to="/categories" className="font-semibold">All categories</Link>} />
      ) : (
        <div>
          <p className="text-sm text-muted">{rootCategory(catalog.categories, category.id)?.name}</p>
          <h1 className="text-2xl font-extrabold tracking-tight">{category.name}</h1>
          {category.blurb ? <p className="mt-1 text-sm text-muted">{category.blurb}</p> : null}
          {children.length > 0 ? (
            <div className="rail mt-4 flex gap-2 overflow-x-auto">
              <button type="button" onClick={() => setChild(null)} className={`h-9 shrink-0 rounded-full px-3 text-sm font-semibold ${child == null ? "bg-ink text-cream" : "border border-line bg-cream"}`}>All</button>
              {children.map((item) => (
                <button key={item.id} type="button" onClick={() => setChild(item.slug)} className={`h-9 shrink-0 rounded-full px-3 text-sm font-semibold ${child === item.slug ? "bg-ink text-cream" : "border border-line bg-cream"}`}>
                  {item.name}
                </button>
              ))}
            </div>
          ) : null}
          {products.length === 0 ? (
            <div className="mt-6"><EmptyState title="Nothing in this aisle" body="Try another category." /></div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} slug={rootCategory(catalog.categories, product.categoryId)?.slug ?? slug} storeId={storeId} />
              ))}
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
