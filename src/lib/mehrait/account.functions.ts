import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { num } from "./num";
import { quoteCart } from "./pricing";
import type { AddressSnapshot, Coupon } from "./types";

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Check that form and try again.");
  return result.data;
}

const phone = z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number.");

async function bootstrap(sql: Sql, userId: string) {
  const users = await sql<{ name: string; email: string }>`select name, email from "user" where id = ${userId}`;
  const user = users[0];
  if (!user) return;
  await sql`
    insert into profiles (user_id, full_name, email)
    values (${userId}, ${user.name}, ${user.email})
    on conflict (user_id) do update set email = excluded.email`;
  await sql`
    insert into user_roles (user_id, role)
    select ${userId}, 'super_admin'
    where not exists (select 1 from user_roles where role = 'super_admin')
    on conflict do nothing`;
  await sql`
    insert into delivery_partners (user_id, full_name, phone, vehicle)
    select p.user_id, coalesce(nullif(p.full_name, ''), 'Store owner'), p.phone, 'bike'
    from profiles p
    where p.user_id = ${userId}
      and exists (select 1 from user_roles r where r.user_id = ${userId} and r.role = 'super_admin')
    on conflict (user_id) do nothing`;
}

async function notify(sql: Sql, userId: string, title: string, body: string, href: string) {
  await sql`insert into notifications (user_id, title, body, href) values (${userId}, ${title}, ${body}, ${href})`;
}

async function giveBack(sql: Sql, orderId: number, storeId: number) {
  const items = await sql<{ variant_id: number | null; qty: number }>`
    select variant_id, qty from order_items where order_id = ${orderId}`;
  for (const item of items) {
    if (item.variant_id == null) continue;
    await sql`
      update inventory set qty = qty + ${item.qty}, updated_at = now()
      where store_id = ${storeId} and variant_id = ${item.variant_id}`;
  }
}

export const getMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await bootstrap(sql, context.userId);
    const profiles = await sql<{ full_name: string | null; phone: string | null; email: string | null }>`
      select full_name, phone, email from profiles where user_id = ${context.userId}`;
    const roles = await sql<{ role: string }>`select role from user_roles where user_id = ${context.userId}`;
    const partners = await sql<{ id: number; is_available: boolean }>`
      select id, is_available from delivery_partners where user_id = ${context.userId} and active = true`;
    const profile = profiles[0];
    return {
      name: profile?.full_name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      roles: roles.map((row) => row.role),
      partnerId: partners[0] ? num(partners[0].id) : null,
      available: partners[0] ? partners[0].is_available === true : false,
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => parse(z.object({ fullName: z.string().trim().min(2).max(80), phone }), input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await bootstrap(sql, context.userId);
    await sql`update profiles set full_name = ${data.fullName}, phone = ${data.phone} where user_id = ${context.userId}`;
    await sql`update delivery_partners set full_name = ${data.fullName}, phone = ${data.phone} where user_id = ${context.userId}`;
    return { ok: true as const };
  });

const AddressInput = z.object({
  id: z.number().int().positive().nullable().optional(),
  label: z.enum(["Home", "Work", "Other"]),
  line1: z.string().trim().min(3).max(160),
  line2: z.string().trim().max(160).optional().default(""),
  area: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit pincode."),
  contactName: z.string().trim().min(2).max(80),
  contactPhone: phone,
  isDefault: z.boolean().optional().default(false),
});

export const listAddresses = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      label: string;
      line1: string;
      line2: string | null;
      area: string;
      city: string;
      pincode: string;
      lat: number | null;
      lng: number | null;
      contact_name: string | null;
      contact_phone: string | null;
      is_default: boolean;
    }>`select id, label, line1, line2, area, city, pincode, lat, lng, contact_name, contact_phone, is_default
       from addresses where user_id = ${context.userId} order by is_default desc, id desc`;
    return rows.map((row) => ({
      id: num(row.id),
      label: row.label,
      line1: row.line1,
      line2: row.line2 ?? "",
      area: row.area,
      city: row.city,
      pincode: row.pincode,
      lat: row.lat == null ? null : num(row.lat),
      lng: row.lng == null ? null : num(row.lng),
      contactName: row.contact_name ?? "",
      contactPhone: row.contact_phone ?? "",
      isDefault: row.is_default === true,
    }));
  });

export const saveAddress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => parse(AddressInput, input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const areas = await sql<{ lat: number; lng: number }>`
      select lat, lng from service_areas where pincode = ${data.pincode} and active = true limit 1`;
    const lat = areas[0] ? num(areas[0].lat) : null;
    const lng = areas[0] ? num(areas[0].lng) : null;
    let id = data.id ?? null;
    if (id) {
      const updated = await sql<{ id: number }>`
        update addresses set label = ${data.label}, line1 = ${data.line1}, line2 = ${data.line2},
          area = ${data.area}, city = ${data.city}, pincode = ${data.pincode}, lat = ${lat}, lng = ${lng},
          contact_name = ${data.contactName}, contact_phone = ${data.contactPhone}
        where id = ${id} and user_id = ${context.userId} returning id`;
      if (!updated[0]) throw new Error("Address not found.");
    } else {
      const inserted = await sql<{ id: number }>`
        insert into addresses (user_id, label, line1, line2, area, city, pincode, lat, lng, contact_name, contact_phone, is_default)
        values (${context.userId}, ${data.label}, ${data.line1}, ${data.line2}, ${data.area}, ${data.city},
                ${data.pincode}, ${lat}, ${lng}, ${data.contactName}, ${data.contactPhone}, false)
        returning id`;
      id = num(inserted[0].id);
    }
    if (data.isDefault && id) {
      await sql`update addresses set is_default = false where user_id = ${context.userId}`;
      await sql`update addresses set is_default = true where id = ${id} and user_id = ${context.userId}`;
    }
    return { id };
  });

export const deleteAddress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => parse(z.number().int().positive(), input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from addresses where id = ${data} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

const Line = z.object({ variantId: z.number().int().positive(), qty: z.number().int().min(1).max(20) });
const PlaceInput = z.object({
  storeId: z.number().int().positive(),
  addressId: z.number().int().positive(),
  lines: z.array(Line).min(1).max(40),
  couponCode: z.string().trim().max(32).optional().default(""),
  paymentMethod: z.enum(["cod", "online"]),
});

function makePublicId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "MH";
  for (let i = 0; i < 8; i += 1) id += alphabet[Math.floor(Math.random() * alphabet.length)];
  return id;
}

async function buildOrder(sql: Sql, userId: string, data: z.infer<typeof PlaceInput>) {
  const addresses = await sql<{
    label: string;
    line1: string;
    line2: string | null;
    area: string;
    city: string;
    pincode: string;
    lat: number | null;
    lng: number | null;
    contact_name: string | null;
    contact_phone: string | null;
  }>`select label, line1, line2, area, city, pincode, lat, lng, contact_name, contact_phone
     from addresses where id = ${data.addressId} and user_id = ${userId}`;
  const address = addresses[0];
  if (!address) throw new Error("Choose a saved address.");
  const service = await sql<{ id: number }>`
    select a.id from service_areas a
    join store_service_areas ssa on ssa.area_id = a.id
    where a.pincode = ${address.pincode} and a.active = true and ssa.store_id = ${data.storeId} limit 1`;
  if (!service[0]) throw new Error("That address is outside this store's delivery area.");
  const stores = await sql<{ delivery_fee_paise: number; free_above_paise: number; name: string }>`
    select delivery_fee_paise, free_above_paise, name from stores where id = ${data.storeId} and active = true`;
  const store = stores[0];
  if (!store) throw new Error("That store is not taking orders.");

  const resolved: {
    variantId: number;
    productId: number;
    name: string;
    brand: string;
    sku: string;
    unit: string;
    qty: number;
    mrpPaise: number;
    pricePaise: number;
    taxBps: number;
  }[] = [];
  for (const line of data.lines) {
    const rows = await sql<{
      id: number;
      product_id: number;
      sku: string;
      unit: string;
      mrp_paise: number;
      price_paise: number;
      tax_bps: number;
      name: string;
      brand: string;
    }>`select v.id, v.product_id, v.sku, v.unit, v.mrp_paise, v.price_paise, v.tax_bps, p.name, p.brand
       from product_variants v join products p on p.id = v.product_id
       where v.id = ${line.variantId} and v.active = true and p.active = true and p.archived = false`;
    const row = rows[0];
    if (!row) throw new Error("A product in your cart is no longer available.");
    const stock = await sql<{ qty: number }>`
      select qty from inventory where store_id = ${data.storeId} and variant_id = ${line.variantId}`;
    if (num(stock[0]?.qty) < line.qty) throw new Error(`${row.name} does not have enough stock at this store.`);
    resolved.push({
      variantId: num(row.id),
      productId: num(row.product_id),
      name: row.name,
      brand: row.brand,
      sku: row.sku,
      unit: row.unit,
      qty: line.qty,
      mrpPaise: num(row.mrp_paise),
      pricePaise: num(row.price_paise),
      taxBps: num(row.tax_bps),
    });
  }

  let coupon: Coupon | null = null;
  let couponId: number | null = null;
  const code = data.couponCode.trim().toUpperCase();
  if (code) {
    const rows = await sql<{
      id: number;
      code: string;
      description: string;
      kind: string;
      amount: number;
      max_discount_paise: number;
      min_subtotal_paise: number;
    }>`select id, code, description, kind, amount, max_discount_paise, min_subtotal_paise
       from coupons where code = ${code} and active = true and archived = false`;
    if (!rows[0]) throw new Error("That coupon is not valid.");
    const used = await sql<{ id: number }>`
      select id from coupon_redemptions where coupon_id = ${rows[0].id} and user_id = ${userId}`;
    if (used[0]) throw new Error("You have already used this coupon.");
    couponId = num(rows[0].id);
    coupon = {
      code: rows[0].code,
      description: rows[0].description,
      kind: rows[0].kind === "percent" ? "percent" : "flat",
      amount: num(rows[0].amount),
      maxDiscountPaise: num(rows[0].max_discount_paise),
      minSubtotalPaise: num(rows[0].min_subtotal_paise),
    };
  }
  const priced = quoteCart({
    lines: resolved,
    coupon,
    deliveryFeePaise: num(store.delivery_fee_paise),
    freeAbovePaise: num(store.free_above_paise),
  });
  if (coupon && priced.couponError) throw new Error(priced.couponError);
  const snapshot = {
    label: address.label,
    line1: address.line1,
    line2: address.line2 ?? "",
    area: address.area,
    city: address.city,
    pincode: address.pincode,
    lat: address.lat == null ? null : num(address.lat),
    lng: address.lng == null ? null : num(address.lng),
    contactName: address.contact_name ?? "",
    contactPhone: address.contact_phone ?? "",
    storeName: store.name,
  };
  const publicId = makePublicId();
  const inserted = await sql<{ id: number }>`
    insert into orders (
      public_id, user_id, store_id, status, address_snapshot, subtotal_paise, discount_paise,
      delivery_fee_paise, tax_paise, payable_paise, coupon_code, payment_method
    ) values (
      ${publicId}, ${userId}, ${data.storeId}, 'pending', ${JSON.stringify(snapshot)}::jsonb,
      ${priced.subtotalPaise}, ${priced.discountPaise}, ${priced.deliveryPaise}, ${priced.taxPaise},
      ${priced.payablePaise}, ${priced.couponCode}, ${data.paymentMethod}
    ) returning id`;
  const orderId = num(inserted[0].id);
  try {
    for (const line of priced.lines) {
      const moved = await sql<{ qty: number }>`
        update inventory set qty = qty - ${line.qty}, updated_at = now()
        where store_id = ${data.storeId} and variant_id = ${line.variantId} and qty >= ${line.qty}
        returning qty`;
      if (!moved[0]) throw new Error(`${line.name} just sold out.`);
      await sql`
        insert into order_items (order_id, variant_id, product_id, name, brand, sku, unit, qty, mrp_paise, price_paise, tax_bps)
        values (${orderId}, ${line.variantId}, ${line.productId}, ${line.name}, ${line.brand}, ${line.sku},
                ${line.unit}, ${line.qty}, ${line.mrpPaise}, ${line.pricePaise}, ${line.taxBps})`;
      await sql`
        insert into inventory_movements (store_id, variant_id, delta, reason, actor_id)
        values (${data.storeId}, ${line.variantId}, ${-line.qty}, ${"sale " + publicId}, ${userId})`;
    }
    await sql`
      insert into order_status_history (order_id, status, note, actor_id)
      values (${orderId}, 'pending', 'Order placed', ${userId})`;
    if (couponId) {
      await sql`insert into coupon_redemptions (coupon_id, user_id, order_id) values (${couponId}, ${userId}, ${orderId})`;
    }
  } catch (error) {
    await giveBack(sql, orderId, data.storeId);
    await sql`delete from orders where id = ${orderId}`;
    throw error;
  }
  return { publicId, orderId, payablePaise: priced.payablePaise };
}

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => parse(PlaceInput, input))
  .handler(async ({ context, data }) => {
    if (data.paymentMethod !== "cod") throw new Error("Use Pay online for Razorpay. Cash on delivery is the live tender.");
    const sql = await getSql();
    const order = await buildOrder(sql, context.userId, data);
    await sql`
      insert into payments (order_id, provider, method, amount_paise, status)
      values (${order.orderId}, 'cod', 'cod', ${order.payablePaise}, 'cod')`;
    await notify(sql, context.userId, "Order placed", `${order.publicId} is pending with the store.`, `/orders/${order.publicId}`);
    return { publicId: order.publicId, payablePaise: order.payablePaise };
  });

export const startOnlinePayment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = typeof input === "object" && input ? input : {};
    return parse(PlaceInput, { ...raw, paymentMethod: "online" });
  })
  .handler(async ({ context, data }) => {
    const key = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key || !secret) throw new Error("Online payment is not connected yet. Cash on delivery is available.");
    const sql = await getSql();
    const order = await buildOrder(sql, context.userId, data);
    try {
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: order.payablePaise, currency: "INR", receipt: order.publicId, payment_capture: 1 }),
      });
      const body = (await response.json()) as { id?: string; error?: { description?: string } };
      if (!response.ok || !body.id) throw new Error(body.error?.description || "Razorpay did not create an order.");
      await sql`
        insert into payments (order_id, provider, method, amount_paise, status, gateway_order_id)
        values (${order.orderId}, 'razorpay', 'online', ${order.payablePaise}, 'created', ${body.id})`;
      return { keyId: key, gatewayOrderId: body.id, publicId: order.publicId, amount: order.payablePaise };
    } catch (error) {
      await giveBack(sql, order.orderId, data.storeId);
      await sql`delete from orders where id = ${order.orderId}`;
      throw error;
    }
  });

export const confirmOnlinePayment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    parse(
      z.object({
        publicId: z.string().trim().min(4),
        gatewayOrderId: z.string().trim().min(4),
        gatewayPaymentId: z.string().trim().min(4),
        signature: z.string().trim().min(8),
      }),
      input,
    ),
  )
  .handler(async ({ context, data }) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const key = process.env.RAZORPAY_KEY_ID;
    if (!secret || !key) throw new Error("Online payment is not connected.");
    const { createHmac } = await import("node:crypto");
    const expected = createHmac("sha256", secret).update(`${data.gatewayOrderId}|${data.gatewayPaymentId}`).digest("hex");
    if (expected !== data.signature) throw new Error("Payment could not be verified.");
    const sql = await getSql();
    const orders = await sql<{ id: number; status: string }>`
      select id, status from orders where public_id = ${data.publicId} and user_id = ${context.userId}`;
    const order = orders[0];
    if (!order) throw new Error("Order not found.");
    const response = await fetch(`https://api.razorpay.com/v1/payments/${data.gatewayPaymentId}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` },
    });
    const body = (await response.json()) as { status?: string; order_id?: string };
    if (!response.ok || body.order_id !== data.gatewayOrderId) throw new Error("Payment could not be verified.");
    if (body.status !== "captured" && body.status !== "authorized") throw new Error("Payment is not captured yet.");
    await sql`
      update payments set status = 'captured', gateway_payment_id = ${data.gatewayPaymentId}
      where order_id = ${order.id} and gateway_order_id = ${data.gatewayOrderId}`;
    if (order.status === "pending") {
      await sql`update orders set status = 'confirmed', updated_at = now() where id = ${order.id}`;
      await sql`
        insert into order_status_history (order_id, status, note, actor_id)
        values (${order.id}, 'confirmed', 'Payment captured', ${context.userId})`;
    }
    await notify(sql, context.userId, "Payment received", `${data.publicId} is confirmed.`, `/orders/${data.publicId}`);
    return { publicId: data.publicId };
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      public_id: string;
      status: string;
      payable_paise: number;
      created_at: string;
      item_count: number;
      payment_method: string;
    }>`select o.public_id, o.status, o.payable_paise, o.payment_method, o.created_at::text as created_at,
              (select count(*) from order_items i where i.order_id = o.id) as item_count
       from orders o where o.user_id = ${context.userId} order by o.id desc limit 40`;
    return rows.map((row) => ({
      publicId: row.public_id,
      status: row.status,
      payablePaise: num(row.payable_paise),
      createdAt: row.created_at,
      itemCount: num(row.item_count),
      paymentMethod: row.payment_method,
    }));
  });

export const getOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => parse(z.string().trim().min(4).max(20), input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const orders = await sql<{
      id: number;
      public_id: string;
      status: string;
      address_snapshot: unknown;
      subtotal_paise: number;
      discount_paise: number;
      delivery_fee_paise: number;
      tax_paise: number;
      payable_paise: number;
      coupon_code: string | null;
      payment_method: string;
      delivery_otp: string | null;
      cancel_reason: string | null;
      created_at: string;
    }>`select id, public_id, status, address_snapshot, subtotal_paise, discount_paise, delivery_fee_paise,
              tax_paise, payable_paise, coupon_code, payment_method, delivery_otp, cancel_reason, created_at::text as created_at
       from orders where public_id = ${data} and user_id = ${context.userId}`;
    const order = orders[0];
    if (!order) throw new Error("Order not found.");
    const items = await sql<{
      product_id: number | null;
      name: string;
      brand: string;
      unit: string;
      qty: number;
      price_paise: number;
      mrp_paise: number;
    }>`select product_id, name, brand, unit, qty, price_paise, mrp_paise from order_items where order_id = ${order.id}`;
    const history = await sql<{ status: string; note: string | null; created_at: string }>`
      select status, note, created_at::text as created_at from order_status_history where order_id = ${order.id} order by id`;
    const payments = await sql<{ provider: string; method: string; status: string; amount_paise: number }>`
      select provider, method, status, amount_paise from payments where order_id = ${order.id} order by id desc limit 1`;
    const partners = await sql<{ full_name: string; phone: string | null; last_lat: number | null; last_lng: number | null; last_seen_at: string | null }>`
      select dp.full_name, dp.phone, dp.last_lat, dp.last_lng, dp.last_seen_at::text as last_seen_at
      from delivery_assignments da join delivery_partners dp on dp.id = da.partner_id
      where da.order_id = ${order.id}`;
    const snapshot = typeof order.address_snapshot === "string"
      ? (JSON.parse(order.address_snapshot) as AddressSnapshot)
      : (order.address_snapshot as AddressSnapshot);
    return {
      publicId: order.public_id,
      status: order.status,
      address: snapshot,
      subtotalPaise: num(order.subtotal_paise),
      discountPaise: num(order.discount_paise),
      deliveryPaise: num(order.delivery_fee_paise),
      taxPaise: num(order.tax_paise),
      payablePaise: num(order.payable_paise),
      couponCode: order.coupon_code,
      paymentMethod: order.payment_method,
      payment: payments[0]
        ? { provider: payments[0].provider, method: payments[0].method, status: payments[0].status, amountPaise: num(payments[0].amount_paise) }
        : null,
      otp: order.status === "out_for_delivery" ? order.delivery_otp : null,
      cancelReason: order.cancel_reason,
      createdAt: order.created_at,
      items: items.map((item) => ({
        productId: item.product_id == null ? null : num(item.product_id),
        name: item.name,
        brand: item.brand,
        unit: item.unit,
        qty: num(item.qty),
        pricePaise: num(item.price_paise),
        mrpPaise: num(item.mrp_paise),
      })),
      history: history.map((row) => ({ status: row.status, note: row.note ?? "", createdAt: row.created_at })),
      partner: partners[0]
        ? {
            name: partners[0].full_name,
            phone: partners[0].phone ?? "",
            lat: partners[0].last_lat == null ? null : num(partners[0].last_lat),
            lng: partners[0].last_lng == null ? null : num(partners[0].last_lng),
            seenAt: partners[0].last_seen_at,
          }
        : null,
    };
  });

export const cancelOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    parse(z.object({ publicId: z.string().trim().min(4), reason: z.string().trim().min(3).max(180) }), input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const orders = await sql<{ id: number; status: string; store_id: number; payment_method: string }>`
      select id, status, store_id, payment_method from orders
      where public_id = ${data.publicId} and user_id = ${context.userId}`;
    const order = orders[0];
    if (!order) throw new Error("Order not found.");
    if (order.status !== "pending" && order.status !== "confirmed") {
      throw new Error("This order is already with the store and can only be cancelled by them.");
    }
    await giveBack(sql, num(order.id), num(order.store_id));
    const next = order.payment_method === "online" ? "refund_initiated" : "cancelled";
    await sql`update orders set status = ${next}, cancel_reason = ${data.reason}, updated_at = now() where id = ${order.id}`;
    await sql`
      insert into order_status_history (order_id, status, note, actor_id)
      values (${order.id}, ${next}, ${data.reason}, ${context.userId})`;
    await sql`
      insert into inventory_movements (store_id, variant_id, delta, reason, actor_id)
      select ${order.store_id}, variant_id, qty, ${"cancel " + data.publicId}, ${context.userId}
      from order_items where order_id = ${order.id} and variant_id is not null`;
    if (next === "refund_initiated") {
      const payments = await sql<{ id: number; amount_paise: number }>`
        select id, amount_paise from payments where order_id = ${order.id} order by id desc limit 1`;
      if (payments[0]) {
        await sql`
          insert into refunds (order_id, payment_id, amount_paise, status, reason)
          values (${order.id}, ${payments[0].id}, ${payments[0].amount_paise}, 'initiated', ${data.reason})`;
      }
    }
    await notify(sql, context.userId, "Order cancelled", `${data.publicId} was cancelled.`, `/orders/${data.publicId}`);
    return { status: next };
  });

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number; title: string; body: string; href: string | null; read: boolean; created_at: string }>`
      select id, title, body, href, read, created_at::text as created_at
      from notifications where user_id = ${context.userId} order by id desc limit 40`;
    return rows.map((row) => ({
      id: num(row.id),
      title: row.title,
      body: row.body,
      href: row.href ?? "",
      read: row.read === true,
      createdAt: row.created_at,
    }));
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`update notifications set read = true where user_id = ${context.userId} and read = false`;
    return { ok: true as const };
  });

export const createTicket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    parse(
      z.object({
        subject: z.string().trim().min(3).max(120),
        body: z.string().trim().min(8).max(1000),
        orderPublicId: z.string().trim().max(20).optional().default(""),
      }),
      input,
    ),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into support_tickets (user_id, subject, body, order_public_id)
      values (${context.userId}, ${data.subject}, ${data.body}, ${data.orderPublicId || null})`;
    return { ok: true as const };
  });

export const listTickets = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number; subject: string; body: string; status: string; created_at: string }>`
      select id, subject, body, status, created_at::text as created_at
      from support_tickets where user_id = ${context.userId} order by id desc limit 20`;
    return rows.map((row) => ({
      id: num(row.id),
      subject: row.subject,
      body: row.body,
      status: row.status,
      createdAt: row.created_at,
    }));
  });

export const createReview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    parse(
      z.object({
        publicId: z.string().trim().min(4),
        productId: z.number().int().positive(),
        rating: z.number().int().min(1).max(5),
        body: z.string().trim().max(500).optional().default(""),
      }),
      input,
    ),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const orders = await sql<{ id: number; status: string }>`
      select id, status from orders where public_id = ${data.publicId} and user_id = ${context.userId}`;
    const order = orders[0];
    if (!order || order.status !== "delivered") throw new Error("You can rate a product after it is delivered.");
    const items = await sql<{ id: number }>`select id from order_items where order_id = ${order.id} and product_id = ${data.productId}`;
    if (!items[0]) throw new Error("That product was not in this order.");
    await sql`
      insert into reviews (user_id, order_id, product_id, rating, body)
      values (${context.userId}, ${order.id}, ${data.productId}, ${data.rating}, ${data.body})
      on conflict (user_id, order_id, product_id) do update set rating = excluded.rating, body = excluded.body`;
    return { ok: true as const };
  });

export const pullCart = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ variant_id: number; qty: number }>`
      select ci.variant_id, ci.qty from cart_items ci
      join carts c on c.id = ci.cart_id where c.user_id = ${context.userId}`;
    return rows.map((row) => ({ variantId: num(row.variant_id), qty: num(row.qty) }));
  });

export const syncCart = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => parse(z.array(Line).max(40), input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const carts = await sql<{ id: number }>`
      insert into carts (user_id) values (${context.userId})
      on conflict (user_id) do update set updated_at = now() returning id`;
    const cartId = num(carts[0].id);
    await sql`delete from cart_items where cart_id = ${cartId}`;
    for (const line of data) {
      await sql`insert into cart_items (cart_id, variant_id, qty) values (${cartId}, ${line.variantId}, ${line.qty})`;
    }
    return { ok: true as const };
  });
