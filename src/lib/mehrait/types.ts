export type Category = {
  id: number;
  parentId: number | null;
  slug: string;
  name: string;
  blurb: string;
  sort: number;
};

export type StockCell = { storeId: number; qty: number };

export type Variant = {
  id: number;
  productId: number;
  name: string;
  sku: string;
  barcode: string;
  mrpPaise: number;
  pricePaise: number;
  unit: string;
  weightG: number;
  taxBps: number;
  stock: StockCell[];
};

export type Product = {
  id: number;
  categoryId: number;
  brand: string;
  name: string;
  description: string;
  featured: boolean;
  bestseller: boolean;
  imageUrl: string | null;
  variants: Variant[];
};

export type Store = {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  radiusKm: number;
  opens: string;
  closes: string;
  deliveryFeePaise: number;
  freeAbovePaise: number;
};

export type Area = {
  id: number;
  name: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  storeId: number;
};

export type Banner = {
  id: number;
  title: string;
  subtitle: string;
  tone: string;
  href: string;
  sort: number;
};

export type Coupon = {
  code: string;
  description: string;
  kind: "flat" | "percent";
  amount: number;
  maxDiscountPaise: number;
  minSubtotalPaise: number;
};

export type Settings = {
  businessName: string;
  tagline: string;
  supportPhone: string;
  supportEmail: string;
  gstin: string;
  promise: string;
  popular: string[];
  razorpayConfigured: boolean;
};

export type Catalog = {
  categories: Category[];
  products: Product[];
  stores: Store[];
  areas: Area[];
  banners: Banner[];
  coupons: Coupon[];
  settings: Settings;
};

export type CartLine = { variantId: number; qty: number };

export type AddressSnapshot = {
  label: string;
  line1: string;
  line2: string;
  area: string;
  city: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  contactName: string;
  contactPhone: string;
  storeName?: string;
};

export type Place = {
  areaId: number | null;
  storeId: number | null;
  label: string;
  city: string;
  pincode: string;
  serviceable: boolean;
  lat: number | null;
  lng: number | null;
};

export const ORDER_FLOW = [
  "pending",
  "confirmed",
  "preparing",
  "packed",
  "ready_for_pickup",
  "assigned",
  "picked_up",
  "out_for_delivery",
  "delivered",
] as const;

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  packed: "Packed",
  ready_for_pickup: "Ready for pickup",
  assigned: "Assigned",
  picked_up: "Picked up",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refund_initiated: "Refund initiated",
  refunded: "Refunded",
};

export const STAFF_ROLES = [
  "super_admin",
  "admin",
  "store_manager",
  "inventory_manager",
  "order_manager",
  "delivery_manager",
] as const;

export const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  store_manager: "Store manager",
  inventory_manager: "Inventory manager",
  order_manager: "Order manager",
  delivery_manager: "Delivery manager",
};
