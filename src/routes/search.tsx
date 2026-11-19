import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/mehrait/product-card";
import { EmptyState, Shell } from "@/components/mehrait/shell";
import { usePlace } from "@/lib/mehrait/cart-store";
import { rootCategory, useCatalog } from "@/lib/mehrait/use-catalog";

export const Route = createFileRoute("/search")({ component: SearchPage });

const RECENT = "mehrait-recent";

function SearchPage() {
  const { catalog, loading, error } = useCatalog();
  const storeId = usePlace((state) => state.storeId);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [sort, setSort] = useState("relevance");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT);
      if (raw) setRecent(JSON.parse(raw) as string[]);
    } catch { /* ignore */ }
  }, []);

  function remember(term: string) {
    const next = [term, ...recent.filter((item) => item !== term)].slice(0, 6);
    setRecent(next);
    localStorage.setItem(RECENT, JSON.stringify(next));
  }

  const results = useMemo(() => {
    if (!catalog) return [];
    const term = q.trim().toLowerCase();
    let list = catalog.products.filter((product) => {
      const cat = catalog.categories.find((item) => item.id === product.categoryId);
      const root = rootCategory(catalog.categories, product.categoryId);
      const hay = `${product.name} ${product.brand} ${cat?.name ?? ""} ${root?.name ?? ""}`.toLowerCase();
      if (term && !hay.includes(term)) return false;
      if (category !== "all" && root?.slug !== category) return false;
      if (onlyDeals && product.variants[0] && product.variants[0].pricePaise >= product.variants[0].mrpPaise) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.variants[0].pricePaise - b.variants[0].pricePaise);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.variants[0].pricePaise - a.variants[0].pricePaise);
    if (sort === "discount") {
      list = [...list].sort((a, b) => (b.variants[0].mrpPaise - b.variants[0].pricePaise) - (a.variants[0].mrpPaise - a.variants[0].pricePaise));
    }
    return list;
  }, [catalog, q, category, onlyDeals, sort]);

  const suggestions = catalog && q.trim().length > 0
    ? catalog.products.filter((product) => product.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 5)
    : [];

  return (
    <Shell>
      <h1 className="text-2xl font-extrabold tracking-tight">Search</h1>
      <input
        autoFocus
        value={q}
        onChange={(event) => setQ(event.target.value)}
        onBlur={() => { if (q.trim()) remember(q.trim()); }}
        placeholder="Try sattu, makhana, litchi"
        className="mt-3 h-12 w-full rounded-full border border-line bg-cream px-4"
      />
      {suggestions.length > 0 && q.trim() ? (
        <ul className="mt-2 overflow-hidden rounded-2xl border border-line bg-cream">
          {suggestions.map((product) => (
            <li key={product.id}>
              <button type="button" className="block w-full px-4 py-3 text-left text-sm" onClick={() => { setQ(product.name); remember(product.name); }}>
                {product.name} <span className="text-muted">· {product.brand}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {!q && recent.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-semibold">Recent</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recent.map((term) => (
              <button key={term} type="button" onClick={() => setQ(term)} className="rounded-full border border-line bg-cream px-3 py-1 text-sm">{term}</button>
            ))}
          </div>
        </div>
      ) : null}
      {!q && catalog ? (
        <div className="mt-4">
          <p className="text-sm font-semibold">Popular</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {catalog.settings.popular.map((term) => (
              <button key={term} type="button" onClick={() => setQ(term)} className="rounded-full bg-brand px-3 py-1 text-sm font-semibold">{term}</button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-full border border-line bg-cream px-3 text-sm" aria-label="Category">
          <option value="all">All categories</option>
          {catalog?.categories.filter((item) => item.parentId == null).map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-full border border-line bg-cream px-3 text-sm" aria-label="Sort">
          <option value="relevance">Relevance</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="discount">Discount</option>
        </select>
        <button type="button" onClick={() => setOnlyDeals((value) => !value)} className={`h-10 rounded-full px-3 text-sm font-semibold ${onlyDeals ? "bg-ink text-cream" : "border border-line bg-cream"}`}>
          On offer
        </button>
      </div>
      {loading ? <p className="mt-6 text-sm text-muted">Loading the catalogue…</p> : null}
      {error ? <p className="mt-6 text-sm text-danger">{error}</p> : null}
      {catalog && q.trim() && results.length === 0 ? (
        <div className="mt-6"><EmptyState title="No matches" body="Try a shorter word, or browse a category." /></div>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {(q.trim() ? results : []).map((product) => (
          <ProductCard key={product.id} product={product} slug={rootCategory(catalog!.categories, product.categoryId)?.slug ?? "snacks"} storeId={storeId} />
        ))}
      </div>
    </Shell>
  );
}
