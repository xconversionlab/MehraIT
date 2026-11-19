import { useEffect, useState } from "react";
import { getCatalog } from "./catalog.functions";
import type { Catalog, Category, Product } from "./types";

let cache: Catalog | null = null;

export function invalidateCatalog() {
  cache = null;
}

export function useCatalog() {
  const [data, setData] = useState<Catalog | null>(cache);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (cache) {
      setData(cache);
      return;
    }
    let live = true;
    getCatalog()
      .then((catalog) => {
        cache = catalog;
        if (live) setData(catalog);
      })
      .catch((reason: unknown) => {
        if (live) setError(reason instanceof Error ? reason.message : "The store could not load.");
      });
    return () => {
      live = false;
    };
  }, []);
  return { catalog: data, error, loading: !data && !error, reload: () => {
    cache = null;
    setData(null);
    setError(null);
    getCatalog().then((catalog) => {
      cache = catalog;
      setData(catalog);
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "The store could not load."));
  } };
}

export function rootCategory(categories: Category[], categoryId: number) {
  let current = categories.find((category) => category.id === categoryId);
  let guard = 0;
  while (current?.parentId && guard < 6) {
    current = categories.find((category) => category.id === current?.parentId);
    guard += 1;
  }
  return current;
}

export function categoryTrail(categories: Category[], categoryId: number) {
  const trail: Category[] = [];
  let current = categories.find((category) => category.id === categoryId);
  let guard = 0;
  while (current && guard < 6) {
    trail.unshift(current);
    current = current.parentId ? categories.find((category) => category.id === current?.parentId) : undefined;
    guard += 1;
  }
  return trail;
}

export function productsIn(catalog: Catalog, slug: string) {
  const category = catalog.categories.find((item) => item.slug === slug);
  if (!category) return [];
  const ids = new Set<number>([category.id]);
  for (const item of catalog.categories) if (item.parentId === category.id) ids.add(item.id);
  return catalog.products.filter((product) => ids.has(product.categoryId));
}

export function stockAt(product: Product, variantId: number, storeId: number | null) {
  const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0];
  if (!variant || storeId == null) return 0;
  return variant.stock.find((cell) => cell.storeId === storeId)?.qty ?? 0;
}
