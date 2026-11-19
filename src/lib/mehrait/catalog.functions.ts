import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { asBool, num } from "./num";
import type { Catalog, Coupon } from "./types";

function settingMap(rows: { key: string; value: string }[]) {
  const map = new Map(rows.map((row) => [row.key, row.value]));
  return (key: string, fallback = "") => map.get(key) ?? fallback;
}

export const getCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<Catalog> => {
  const sql = await getSql();
  const categories = await sql<{
    id: number;
    parent_id: number | null;
    slug: string;
    name: string;
    blurb: string;
    sort: number;
  }>`select id, parent_id, slug, name, blurb, sort from categories
     where visible = true and archived = false order by sort, id`;
  const products = await sql<{
    id: number;
    category_id: number;
    brand: string;
    name: string;
    description: string;
    featured: boolean;
    bestseller: boolean;
  }>`select id, category_id, brand, name, description, featured, bestseller
     from products where active = true and archived = false order by id`;
  const variants = await sql<{
    id: number;
    product_id: number;
    name: string;
    sku: string;
    barcode: string | null;
    mrp_paise: number;
    price_paise: number;
    unit: string;
    weight_g: number;
    tax_bps: number;
  }>`select id, product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps
     from product_variants where active = true order by id`;
  const stock = await sql<{ store_id: number; variant_id: number; qty: number }>`
    select store_id, variant_id, qty from inventory`;
  const images = await sql<{ product_id: number; url: string; sort: number }>`
    select product_id, url, sort from product_images order by sort, id`;
  const stores = await sql<{
    id: number;
    name: string;
    code: string;
    address: string;
    city: string;
    pincode: string;
    lat: number;
    lng: number;
    radius_km: number;
    opens: string;
    closes: string;
    delivery_fee_paise: number;
    free_above_paise: number;
  }>`select id, name, code, address, city, pincode, lat, lng, radius_km, opens, closes,
            delivery_fee_paise, free_above_paise
     from stores where active = true order by id`;
  const areas = await sql<{
    id: number;
    name: string;
    city: string;
    pincode: string;
    lat: number;
    lng: number;
    store_id: number;
  }>`select a.id, a.name, a.city, a.pincode, a.lat, a.lng, ssa.store_id
     from service_areas a
     join store_service_areas ssa on ssa.area_id = a.id
     where a.active = true
     order by a.city, a.name`;
  const banners = await sql<{
    id: number;
    title: string;
    subtitle: string;
    tone: string;
    href: string;
    sort: number;
  }>`select id, title, subtitle, tone, href, sort from banners where active = true order by sort, id`;
  const coupons = await sql<{
    code: string;
    description: string;
    kind: string;
    amount: number;
    max_discount_paise: number;
    min_subtotal_paise: number;
  }>`select code, description, kind, amount, max_discount_paise, min_subtotal_paise
     from coupons where active = true and archived = false order by id`;
  const settingsRows = await sql<{ key: string; value: string }>`select key, value from app_settings`;
  const get = settingMap(settingsRows);
  const imageByProduct = new Map<number, string>();
  for (const image of images) {
    if (!imageByProduct.has(num(image.product_id))) imageByProduct.set(num(image.product_id), image.url);
  }
  const stockByVariant = new Map<number, { storeId: number; qty: number }[]>();
  for (const cell of stock) {
    const id = num(cell.variant_id);
    const list = stockByVariant.get(id) ?? [];
    list.push({ storeId: num(cell.store_id), qty: num(cell.qty) });
    stockByVariant.set(id, list);
  }
  const variantsByProduct = new Map<number, Catalog["products"][number]["variants"]>();
  for (const variant of variants) {
    const productId = num(variant.product_id);
    const list = variantsByProduct.get(productId) ?? [];
    list.push({
      id: num(variant.id),
      productId,
      name: variant.name,
      sku: variant.sku,
      barcode: variant.barcode ?? variant.sku,
      mrpPaise: num(variant.mrp_paise),
      pricePaise: num(variant.price_paise),
      unit: variant.unit,
      weightG: num(variant.weight_g),
      taxBps: num(variant.tax_bps),
      stock: stockByVariant.get(num(variant.id)) ?? [],
    });
    variantsByProduct.set(productId, list);
  }
  return {
    categories: categories.map((row) => ({
      id: num(row.id),
      parentId: row.parent_id == null ? null : num(row.parent_id),
      slug: row.slug,
      name: row.name,
      blurb: row.blurb,
      sort: num(row.sort),
    })),
    products: products.map((row) => ({
      id: num(row.id),
      categoryId: num(row.category_id),
      brand: row.brand,
      name: row.name,
      description: row.description,
      featured: asBool(row.featured),
      bestseller: asBool(row.bestseller),
      imageUrl: imageByProduct.get(num(row.id)) ?? null,
      variants: variantsByProduct.get(num(row.id)) ?? [],
    })),
    stores: stores.map((row) => ({
      id: num(row.id),
      name: row.name,
      code: row.code,
      address: row.address,
      city: row.city,
      pincode: row.pincode,
      lat: num(row.lat),
      lng: num(row.lng),
      radiusKm: num(row.radius_km),
      opens: row.opens,
      closes: row.closes,
      deliveryFeePaise: num(row.delivery_fee_paise),
      freeAbovePaise: num(row.free_above_paise),
    })),
    areas: areas.map((row) => ({
      id: num(row.id),
      name: row.name,
      city: row.city,
      pincode: row.pincode,
      lat: num(row.lat),
      lng: num(row.lng),
      storeId: num(row.store_id),
    })),
    banners: banners.map((row) => ({
      id: num(row.id),
      title: row.title,
      subtitle: row.subtitle,
      tone: row.tone,
      href: row.href,
      sort: num(row.sort),
    })),
    coupons: coupons.map(
      (row): Coupon => ({
        code: row.code,
        description: row.description,
        kind: row.kind === "percent" ? "percent" : "flat",
        amount: num(row.amount),
        maxDiscountPaise: num(row.max_discount_paise),
        minSubtotalPaise: num(row.min_subtotal_paise),
      }),
    ),
    settings: {
      businessName: get("business_name", "MehraIT"),
      tagline: get("tagline", "Shop smart. Live better."),
      supportPhone: get("support_phone"),
      supportEmail: get("support_email"),
      gstin: get("gstin"),
      promise: get("promise", "8–12 min"),
      popular: get("popular_searches")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    },
  };
});

export const listProductReviews = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const id = Number(input);
    if (!Number.isInteger(id) || id <= 0) throw new Error("Unknown product.");
    return id;
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ rating: number; body: string | null; created_at: string; name: string }>`
      select r.rating, r.body, r.created_at::text as created_at,
             coalesce(nullif(p.full_name, ''), 'Customer') as name
      from reviews r
      left join profiles p on p.user_id = r.user_id
      where r.product_id = ${data}
      order by r.id desc
      limit 20`;
    return rows.map((row) => ({
      rating: num(row.rating),
      body: row.body ?? "",
      createdAt: row.created_at,
      name: row.name,
    }));
  });
