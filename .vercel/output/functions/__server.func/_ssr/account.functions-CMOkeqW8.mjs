import { r as quoteCart } from "./pricing-DaB8c9_f.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-DPwruuDW.mjs";
import { t as authMiddleware } from "./middleware-BBXSmM46.mjs";
import { n as createServerRpc, r as num } from "./num-B6cM7uhK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account.functions-CMOkeqW8.js
function parse(schema, input) {
	const result = schema.safeParse(input);
	if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Check that form and try again.");
	return result.data;
}
var phone = string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number.");
async function bootstrap(sql, userId) {
	const user = (await sql`select name, email from "user" where id = ${userId}`)[0];
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
async function notify(sql, userId, title, body, href) {
	await sql`insert into notifications (user_id, title, body, href) values (${userId}, ${title}, ${body}, ${href})`;
}
async function giveBack(sql, orderId, storeId) {
	const items = await sql`
    select variant_id, qty from order_items where order_id = ${orderId}`;
	for (const item of items) {
		if (item.variant_id == null) continue;
		await sql`
      update inventory set qty = qty + ${item.qty}, updated_at = now()
      where store_id = ${storeId} and variant_id = ${item.variant_id}`;
	}
}
var getMe_createServerFn_handler = createServerRpc({
	id: "d455ff65e403380b120115f7a9e43526d041dfe0e9526a2817631f06977b8264",
	name: "getMe",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => getMe.__executeServer(opts));
var getMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMe_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await bootstrap(sql, context.userId);
	const profiles = await sql`
      select full_name, phone, email from profiles where user_id = ${context.userId}`;
	const roles = await sql`select role from user_roles where user_id = ${context.userId}`;
	const partners = await sql`
      select id, is_available from delivery_partners where user_id = ${context.userId} and active = true`;
	const profile = profiles[0];
	return {
		name: profile?.full_name ?? "",
		email: profile?.email ?? "",
		phone: profile?.phone ?? "",
		roles: roles.map((row) => row.role),
		partnerId: partners[0] ? num(partners[0].id) : null,
		available: partners[0] ? partners[0].is_available === true : false
	};
});
var updateProfile_createServerFn_handler = createServerRpc({
	id: "456d046ac6888366780c1b9811c7d99cbf7dc4a9d028c648d517e0fa4494b5bd",
	name: "updateProfile",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => updateProfile.__executeServer(opts));
var updateProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	fullName: string().trim().min(2).max(80),
	phone
}), input)).handler(updateProfile_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await bootstrap(sql, context.userId);
	await sql`update profiles set full_name = ${data.fullName}, phone = ${data.phone} where user_id = ${context.userId}`;
	await sql`update delivery_partners set full_name = ${data.fullName}, phone = ${data.phone} where user_id = ${context.userId}`;
	return { ok: true };
});
var AddressInput = object({
	id: number().int().positive().nullable().optional(),
	label: _enum([
		"Home",
		"Work",
		"Other"
	]),
	line1: string().trim().min(3).max(160),
	line2: string().trim().max(160).optional().default(""),
	area: string().trim().min(2).max(80),
	city: string().trim().min(2).max(80),
	pincode: string().trim().regex(/^\d{6}$/, "Enter a 6-digit pincode."),
	contactName: string().trim().min(2).max(80),
	contactPhone: phone,
	isDefault: boolean().optional().default(false)
});
var listAddresses_createServerFn_handler = createServerRpc({
	id: "4a4eab4c58aa9af6e0595b2c816f123619d1726dc16402894af7ed2a0122151d",
	name: "listAddresses",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => listAddresses.__executeServer(opts));
var listAddresses = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listAddresses_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`select id, label, line1, line2, area, city, pincode, lat, lng, contact_name, contact_phone, is_default
       from addresses where user_id = ${context.userId} order by is_default desc, id desc`).map((row) => ({
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
		isDefault: row.is_default === true
	}));
});
var saveAddress_createServerFn_handler = createServerRpc({
	id: "aa46bc9f9c800b7a4db3861c27a8cd4e62af14b1dbe2167d6c97de6bb61d240a",
	name: "saveAddress",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => saveAddress.__executeServer(opts));
var saveAddress = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(AddressInput, input)).handler(saveAddress_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const areas = await sql`
      select lat, lng from service_areas where pincode = ${data.pincode} and active = true limit 1`;
	const lat = areas[0] ? num(areas[0].lat) : null;
	const lng = areas[0] ? num(areas[0].lng) : null;
	let id = data.id ?? null;
	if (id) {
		if (!(await sql`
        update addresses set label = ${data.label}, line1 = ${data.line1}, line2 = ${data.line2},
          area = ${data.area}, city = ${data.city}, pincode = ${data.pincode}, lat = ${lat}, lng = ${lng},
          contact_name = ${data.contactName}, contact_phone = ${data.contactPhone}
        where id = ${id} and user_id = ${context.userId} returning id`)[0]) throw new Error("Address not found.");
	} else {
		const inserted = await sql`
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
var deleteAddress_createServerFn_handler = createServerRpc({
	id: "390cd81c01fbe492ba432e85be4e9da2400267121c3d8c6e61afae802ce62548",
	name: "deleteAddress",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => deleteAddress.__executeServer(opts));
var deleteAddress = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(number().int().positive(), input)).handler(deleteAddress_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`delete from addresses where id = ${data} and user_id = ${context.userId}`;
	return { ok: true };
});
var Line = object({
	variantId: number().int().positive(),
	qty: number().int().min(1).max(20)
});
var PlaceInput = object({
	storeId: number().int().positive(),
	addressId: number().int().positive(),
	lines: array(Line).min(1).max(40),
	couponCode: string().trim().max(32).optional().default(""),
	paymentMethod: _enum(["cod", "online"])
});
function makePublicId() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let id = "MH";
	for (let i = 0; i < 8; i += 1) id += alphabet[Math.floor(Math.random() * 32)];
	return id;
}
async function buildOrder(sql, userId, data) {
	const address = (await sql`select label, line1, line2, area, city, pincode, lat, lng, contact_name, contact_phone
     from addresses where id = ${data.addressId} and user_id = ${userId}`)[0];
	if (!address) throw new Error("Choose a saved address.");
	if (!(await sql`
    select a.id from service_areas a
    join store_service_areas ssa on ssa.area_id = a.id
    where a.pincode = ${address.pincode} and a.active = true and ssa.store_id = ${data.storeId} limit 1`)[0]) throw new Error("That address is outside this store's delivery area.");
	const store = (await sql`
    select delivery_fee_paise, free_above_paise, name from stores where id = ${data.storeId} and active = true`)[0];
	if (!store) throw new Error("That store is not taking orders.");
	const resolved = [];
	for (const line of data.lines) {
		const row = (await sql`select v.id, v.product_id, v.sku, v.unit, v.mrp_paise, v.price_paise, v.tax_bps, p.name, p.brand
       from product_variants v join products p on p.id = v.product_id
       where v.id = ${line.variantId} and v.active = true and p.active = true and p.archived = false`)[0];
		if (!row) throw new Error("A product in your cart is no longer available.");
		const stock = await sql`
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
			taxBps: num(row.tax_bps)
		});
	}
	let coupon = null;
	let couponId = null;
	const code = data.couponCode.trim().toUpperCase();
	if (code) {
		const rows = await sql`select id, code, description, kind, amount, max_discount_paise, min_subtotal_paise
       from coupons where code = ${code} and active = true and archived = false`;
		if (!rows[0]) throw new Error("That coupon is not valid.");
		if ((await sql`
      select id from coupon_redemptions where coupon_id = ${rows[0].id} and user_id = ${userId}`)[0]) throw new Error("You have already used this coupon.");
		couponId = num(rows[0].id);
		coupon = {
			code: rows[0].code,
			description: rows[0].description,
			kind: rows[0].kind === "percent" ? "percent" : "flat",
			amount: num(rows[0].amount),
			maxDiscountPaise: num(rows[0].max_discount_paise),
			minSubtotalPaise: num(rows[0].min_subtotal_paise)
		};
	}
	const priced = quoteCart({
		lines: resolved,
		coupon,
		deliveryFeePaise: num(store.delivery_fee_paise),
		freeAbovePaise: num(store.free_above_paise)
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
		storeName: store.name
	};
	const publicId = makePublicId();
	const inserted = await sql`
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
			if (!(await sql`
        update inventory set qty = qty - ${line.qty}, updated_at = now()
        where store_id = ${data.storeId} and variant_id = ${line.variantId} and qty >= ${line.qty}
        returning qty`)[0]) throw new Error(`${line.name} just sold out.`);
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
		if (couponId) await sql`insert into coupon_redemptions (coupon_id, user_id, order_id) values (${couponId}, ${userId}, ${orderId})`;
	} catch (error) {
		await giveBack(sql, orderId, data.storeId);
		await sql`delete from orders where id = ${orderId}`;
		throw error;
	}
	return {
		publicId,
		orderId,
		payablePaise: priced.payablePaise
	};
}
var placeOrder_createServerFn_handler = createServerRpc({
	id: "f834079e357c30ac4bb680bac6e4d3d7c7620f9ea4bc2be1fd1f60b051f32760",
	name: "placeOrder",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => placeOrder.__executeServer(opts));
var placeOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(PlaceInput, input)).handler(placeOrder_createServerFn_handler, async ({ context, data }) => {
	if (data.paymentMethod !== "cod") throw new Error("Use Pay online for Razorpay. Cash on delivery is the live tender.");
	const sql = await getSql();
	const order = await buildOrder(sql, context.userId, data);
	await sql`
      insert into payments (order_id, provider, method, amount_paise, status)
      values (${order.orderId}, 'cod', 'cod', ${order.payablePaise}, 'cod')`;
	await notify(sql, context.userId, "Order placed", `${order.publicId} is pending with the store.`, `/orders/${order.publicId}`);
	return {
		publicId: order.publicId,
		payablePaise: order.payablePaise
	};
});
var startOnlinePayment_createServerFn_handler = createServerRpc({
	id: "3bcbc3e81f7a6e22db875159c75767aad99ddd5d31cabc33cad511ce915b4137",
	name: "startOnlinePayment",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => startOnlinePayment.__executeServer(opts));
var startOnlinePayment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return parse(PlaceInput, {
		...typeof input === "object" && input ? input : {},
		paymentMethod: "online"
	});
}).handler(startOnlinePayment_createServerFn_handler, async ({ context, data }) => {
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
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				amount: order.payablePaise,
				currency: "INR",
				receipt: order.publicId,
				payment_capture: 1
			})
		});
		const body = await response.json();
		if (!response.ok || !body.id) throw new Error(body.error?.description || "Razorpay did not create an order.");
		await sql`
        insert into payments (order_id, provider, method, amount_paise, status, gateway_order_id)
        values (${order.orderId}, 'razorpay', 'online', ${order.payablePaise}, 'created', ${body.id})`;
		return {
			keyId: key,
			gatewayOrderId: body.id,
			publicId: order.publicId,
			amount: order.payablePaise
		};
	} catch (error) {
		await giveBack(sql, order.orderId, data.storeId);
		await sql`delete from orders where id = ${order.orderId}`;
		throw error;
	}
});
var confirmOnlinePayment_createServerFn_handler = createServerRpc({
	id: "4c383c24f6c024dcb2a6d27420bedac401e3e920aa8df91239d5f09b30066efe",
	name: "confirmOnlinePayment",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => confirmOnlinePayment.__executeServer(opts));
var confirmOnlinePayment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	publicId: string().trim().min(4),
	gatewayOrderId: string().trim().min(4),
	gatewayPaymentId: string().trim().min(4),
	signature: string().trim().min(8)
}), input)).handler(confirmOnlinePayment_createServerFn_handler, async ({ context, data }) => {
	const secret = process.env.RAZORPAY_KEY_SECRET;
	const key = process.env.RAZORPAY_KEY_ID;
	if (!secret || !key) throw new Error("Online payment is not connected.");
	const { createHmac } = await import("node:crypto");
	if (createHmac("sha256", secret).update(`${data.gatewayOrderId}|${data.gatewayPaymentId}`).digest("hex") !== data.signature) throw new Error("Payment could not be verified.");
	const sql = await getSql();
	const order = (await sql`
      select id, status from orders where public_id = ${data.publicId} and user_id = ${context.userId}`)[0];
	if (!order) throw new Error("Order not found.");
	const response = await fetch(`https://api.razorpay.com/v1/payments/${data.gatewayPaymentId}`, { headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` } });
	const body = await response.json();
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
var listOrders_createServerFn_handler = createServerRpc({
	id: "36c11b1176a9684a93f9a51efa0cbd9e339703a153b63ec75c97b8f8e46a5d1e",
	name: "listOrders",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => listOrders.__executeServer(opts));
var listOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listOrders_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`select o.public_id, o.status, o.payable_paise, o.payment_method, o.created_at::text as created_at,
              (select count(*) from order_items i where i.order_id = o.id) as item_count
       from orders o where o.user_id = ${context.userId} order by o.id desc limit 40`).map((row) => ({
		publicId: row.public_id,
		status: row.status,
		payablePaise: num(row.payable_paise),
		createdAt: row.created_at,
		itemCount: num(row.item_count),
		paymentMethod: row.payment_method
	}));
});
var getOrder_createServerFn_handler = createServerRpc({
	id: "ff5ad80bfabed4f0bf584b4ed5fb6b6bf48036623e8fbc12e0bf4a279789a951",
	name: "getOrder",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => getOrder.__executeServer(opts));
var getOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(string().trim().min(4).max(20), input)).handler(getOrder_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const order = (await sql`select id, public_id, status, address_snapshot, subtotal_paise, discount_paise, delivery_fee_paise,
              tax_paise, payable_paise, coupon_code, payment_method, delivery_otp, cancel_reason, created_at::text as created_at
       from orders where public_id = ${data} and user_id = ${context.userId}`)[0];
	if (!order) throw new Error("Order not found.");
	const items = await sql`select product_id, name, brand, unit, qty, price_paise, mrp_paise from order_items where order_id = ${order.id}`;
	const history = await sql`
      select status, note, created_at::text as created_at from order_status_history where order_id = ${order.id} order by id`;
	const payments = await sql`
      select provider, method, status, amount_paise from payments where order_id = ${order.id} order by id desc limit 1`;
	const partners = await sql`
      select dp.full_name, dp.phone, dp.last_lat, dp.last_lng, dp.last_seen_at::text as last_seen_at
      from delivery_assignments da join delivery_partners dp on dp.id = da.partner_id
      where da.order_id = ${order.id}`;
	const snapshot = typeof order.address_snapshot === "string" ? JSON.parse(order.address_snapshot) : order.address_snapshot;
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
		payment: payments[0] ? {
			provider: payments[0].provider,
			method: payments[0].method,
			status: payments[0].status,
			amountPaise: num(payments[0].amount_paise)
		} : null,
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
			mrpPaise: num(item.mrp_paise)
		})),
		history: history.map((row) => ({
			status: row.status,
			note: row.note ?? "",
			createdAt: row.created_at
		})),
		partner: partners[0] ? {
			name: partners[0].full_name,
			phone: partners[0].phone ?? "",
			lat: partners[0].last_lat == null ? null : num(partners[0].last_lat),
			lng: partners[0].last_lng == null ? null : num(partners[0].last_lng),
			seenAt: partners[0].last_seen_at
		} : null
	};
});
var cancelOrder_createServerFn_handler = createServerRpc({
	id: "bdd62f634cbfd1d9a5dfc4db33f25e381906d2aab236646cf7ba2ab15ca11ec1",
	name: "cancelOrder",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => cancelOrder.__executeServer(opts));
var cancelOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	publicId: string().trim().min(4),
	reason: string().trim().min(3).max(180)
}), input)).handler(cancelOrder_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const order = (await sql`
      select id, status, store_id, payment_method from orders
      where public_id = ${data.publicId} and user_id = ${context.userId}`)[0];
	if (!order) throw new Error("Order not found.");
	if (order.status !== "pending" && order.status !== "confirmed") throw new Error("This order is already with the store and can only be cancelled by them.");
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
		const payments = await sql`
        select id, amount_paise from payments where order_id = ${order.id} order by id desc limit 1`;
		if (payments[0]) await sql`
          insert into refunds (order_id, payment_id, amount_paise, status, reason)
          values (${order.id}, ${payments[0].id}, ${payments[0].amount_paise}, 'initiated', ${data.reason})`;
	}
	await notify(sql, context.userId, "Order cancelled", `${data.publicId} was cancelled.`, `/orders/${data.publicId}`);
	return { status: next };
});
var listNotifications_createServerFn_handler = createServerRpc({
	id: "4a940c1ec5b24eb81c0f8fc032b0b9e668892a008e7eece25339bc044591d0e6",
	name: "listNotifications",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => listNotifications.__executeServer(opts));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listNotifications_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select id, title, body, href, read, created_at::text as created_at
      from notifications where user_id = ${context.userId} order by id desc limit 40`).map((row) => ({
		id: num(row.id),
		title: row.title,
		body: row.body,
		href: row.href ?? "",
		read: row.read === true,
		createdAt: row.created_at
	}));
});
var markNotificationsRead_createServerFn_handler = createServerRpc({
	id: "800b799bc4bb3b3d7e0179f4b65c8fdb272b368a8f078c1955a6df9118412b3d",
	name: "markNotificationsRead",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => markNotificationsRead.__executeServer(opts));
var markNotificationsRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(markNotificationsRead_createServerFn_handler, async ({ context }) => {
	await (await getSql())`update notifications set read = true where user_id = ${context.userId} and read = false`;
	return { ok: true };
});
var createTicket_createServerFn_handler = createServerRpc({
	id: "f3b667f67dbed0a6d5fd1ff5870695b3b17ec01e7f4d3fd88fada50d70d52b6d",
	name: "createTicket",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => createTicket.__executeServer(opts));
var createTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	subject: string().trim().min(3).max(120),
	body: string().trim().min(8).max(1e3),
	orderPublicId: string().trim().max(20).optional().default("")
}), input)).handler(createTicket_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
      insert into support_tickets (user_id, subject, body, order_public_id)
      values (${context.userId}, ${data.subject}, ${data.body}, ${data.orderPublicId || null})`;
	return { ok: true };
});
var listTickets_createServerFn_handler = createServerRpc({
	id: "7d838e49b4f32843195c50823915772b5963a7c3195eaa255f86ab02b124f4dc",
	name: "listTickets",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => listTickets.__executeServer(opts));
var listTickets = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listTickets_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select id, subject, body, status, created_at::text as created_at
      from support_tickets where user_id = ${context.userId} order by id desc limit 20`).map((row) => ({
		id: num(row.id),
		subject: row.subject,
		body: row.body,
		status: row.status,
		createdAt: row.created_at
	}));
});
var createReview_createServerFn_handler = createServerRpc({
	id: "9ca57d2423110d6778c5f7a5583f6a249523d292254d9dbba3510b082fecb91f",
	name: "createReview",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => createReview.__executeServer(opts));
var createReview = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	publicId: string().trim().min(4),
	productId: number().int().positive(),
	rating: number().int().min(1).max(5),
	body: string().trim().max(500).optional().default("")
}), input)).handler(createReview_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const order = (await sql`
      select id, status from orders where public_id = ${data.publicId} and user_id = ${context.userId}`)[0];
	if (!order || order.status !== "delivered") throw new Error("You can rate a product after it is delivered.");
	if (!(await sql`select id from order_items where order_id = ${order.id} and product_id = ${data.productId}`)[0]) throw new Error("That product was not in this order.");
	await sql`
      insert into reviews (user_id, order_id, product_id, rating, body)
      values (${context.userId}, ${order.id}, ${data.productId}, ${data.rating}, ${data.body})
      on conflict (user_id, order_id, product_id) do update set rating = excluded.rating, body = excluded.body`;
	return { ok: true };
});
var pullCart_createServerFn_handler = createServerRpc({
	id: "184cbcd381bc53821a012076a235c0b3f9b2aa1609f469728332f2b011537815",
	name: "pullCart",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => pullCart.__executeServer(opts));
var pullCart = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(pullCart_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select ci.variant_id, ci.qty from cart_items ci
      join carts c on c.id = ci.cart_id where c.user_id = ${context.userId}`).map((row) => ({
		variantId: num(row.variant_id),
		qty: num(row.qty)
	}));
});
var syncCart_createServerFn_handler = createServerRpc({
	id: "fa94fc20237b3fa56acb3fd1dc05fdd0175b0bbedfb675f8b388e0d6d3d3db98",
	name: "syncCart",
	filename: "src/lib/mehrait/account.functions.ts"
}, (opts) => syncCart.__executeServer(opts));
var syncCart = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(array(Line).max(40), input)).handler(syncCart_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const carts = await sql`
      insert into carts (user_id) values (${context.userId})
      on conflict (user_id) do update set updated_at = now() returning id`;
	const cartId = num(carts[0].id);
	await sql`delete from cart_items where cart_id = ${cartId}`;
	for (const line of data) await sql`insert into cart_items (cart_id, variant_id, qty) values (${cartId}, ${line.variantId}, ${line.qty})`;
	return { ok: true };
});
//#endregion
export { cancelOrder_createServerFn_handler, confirmOnlinePayment_createServerFn_handler, createReview_createServerFn_handler, createTicket_createServerFn_handler, deleteAddress_createServerFn_handler, getMe_createServerFn_handler, getOrder_createServerFn_handler, listAddresses_createServerFn_handler, listNotifications_createServerFn_handler, listOrders_createServerFn_handler, listTickets_createServerFn_handler, markNotificationsRead_createServerFn_handler, placeOrder_createServerFn_handler, pullCart_createServerFn_handler, saveAddress_createServerFn_handler, startOnlinePayment_createServerFn_handler, syncCart_createServerFn_handler, updateProfile_createServerFn_handler };
