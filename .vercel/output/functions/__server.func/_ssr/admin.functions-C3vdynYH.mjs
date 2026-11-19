import { r as STAFF_ROLES } from "./types-CG6XJmV6.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-DPwruuDW.mjs";
import { t as authMiddleware } from "./middleware-BBXSmM46.mjs";
import { i as isStaff, n as assertRole } from "./permissions-BDsC6k0_.mjs";
import { n as createServerRpc, r as num } from "./num-B6cM7uhK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-C3vdynYH.js
async function ensure(sql, userId) {
	const user = (await sql`select name, email from "user" where id = ${userId}`)[0];
	if (!user) throw new Error("Sign in again to open the store desk.");
	await sql`
    insert into profiles (user_id, full_name, email) values (${userId}, ${user.name}, ${user.email})
    on conflict (user_id) do update set email = excluded.email`;
	await sql`
    insert into user_roles (user_id, role)
    select ${userId}, 'super_admin'
    where not exists (select 1 from user_roles where role = 'super_admin')
    on conflict do nothing`;
	const list = (await sql`select role from user_roles where user_id = ${userId}`).map((row) => row.role);
	if (!isStaff(list)) throw new Error("The store desk is only for MehraIT staff.");
	return list;
}
async function audit(sql, actor, action, entity, entityId, detail) {
	await sql`
    insert into audit_logs (actor_id, action, entity, entity_id, detail)
    values (${actor}, ${action}, ${entity}, ${entityId}, ${JSON.stringify(detail)}::jsonb)`;
}
async function notify(sql, userId, title, body, href) {
	await sql`insert into notifications (user_id, title, body, href) values (${userId}, ${title}, ${body}, ${href})`;
}
function parse(schema, input) {
	const result = schema.safeParse(input);
	if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Check that form and try again.");
	return result.data;
}
var getDesk_createServerFn_handler = createServerRpc({
	id: "ab1670d151169dde9092591b7338795bd884a02356fcbe5a000a599c7fa80991",
	name: "getDesk",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => getDesk.__executeServer(opts));
var getDesk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getDesk_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const roles = await ensure(sql, context.userId);
	const products = await sql`select id, category_id, brand, name, description, featured, bestseller, active, archived
       from products order by id desc`;
	const variants = await sql`select id, product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps, active
       from product_variants order by id`;
	const stock = await sql`
      select id, store_id, variant_id, qty, low_at from inventory`;
	const categories = await sql`select id, parent_id, slug, name, blurb, sort, visible, archived from categories order by sort, id`;
	const orders = await sql`select o.id, o.public_id, o.status, o.payable_paise, o.payment_method, o.created_at::text as created_at,
              o.user_id, o.store_id, p.full_name
       from orders o left join profiles p on p.user_id = o.user_id
       order by o.id desc limit 60`;
	const counts = await sql`select status, count(*) as n from orders group by status`;
	const revenue = await sql`
      select coalesce(sum(payable_paise), 0) as n from orders where status = 'delivered'`;
	const low = await sql`select count(*) as n from inventory where qty > 0 and qty <= low_at`;
	const oos = await sql`select count(*) as n from inventory where qty = 0`;
	const customers = await sql`select p.user_id, p.full_name, p.email, p.phone,
              (select count(*) from orders o where o.user_id = p.user_id) as orders
       from profiles p order by p.created_at desc limit 80`;
	const roleRows = await sql`select user_id, role from user_roles`;
	const banners = await sql`
      select id, title, subtitle, tone, href, sort, active from banners order by sort, id`;
	const coupons = await sql`select id, code, description, kind, amount, max_discount_paise, min_subtotal_paise, active
       from coupons where archived = false order by id`;
	const stores = await sql`select id, name, code, address, city, pincode, lat, lng, radius_km, opens, closes,
              delivery_fee_paise, free_above_paise, active from stores order by id`;
	const areas = await sql`select a.id, a.name, a.city, a.pincode, a.lat, a.lng, a.active, ssa.store_id
       from service_areas a
       left join store_service_areas ssa on ssa.area_id = a.id
       order by a.city, a.name`;
	const partners = await sql`select id, full_name, phone, vehicle, is_available, active, user_id from delivery_partners order by id`;
	const tickets = await sql`
      select t.id, t.subject, t.body, t.status, t.created_at::text as created_at, p.full_name
      from support_tickets t left join profiles p on p.user_id = t.user_id
      order by t.id desc limit 40`;
	const settings = await sql`select key, value from app_settings order by key`;
	const audits = roles.includes("super_admin") || roles.includes("admin") ? await sql`
          select action, entity, entity_id, created_at::text as created_at from audit_logs order by id desc limit 12` : [];
	const byUser = /* @__PURE__ */ new Map();
	for (const row of roleRows) {
		const list = byUser.get(row.user_id) ?? [];
		list.push(row.role);
		byUser.set(row.user_id, list);
	}
	return {
		roles,
		razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
		metrics: {
			revenuePaise: num(revenue[0]?.n),
			lowStock: num(low[0]?.n),
			outOfStock: num(oos[0]?.n),
			customers: customers.length,
			products: products.filter((p) => p.active === true && p.archived !== true).length,
			byStatus: counts.map((row) => ({
				status: row.status,
				n: num(row.n)
			}))
		},
		categories: categories.map((row) => ({
			id: num(row.id),
			parentId: row.parent_id == null ? null : num(row.parent_id),
			slug: row.slug,
			name: row.name,
			blurb: row.blurb,
			sort: num(row.sort),
			visible: row.visible === true,
			archived: row.archived === true
		})),
		products: products.map((row) => ({
			id: num(row.id),
			categoryId: num(row.category_id),
			brand: row.brand,
			name: row.name,
			description: row.description,
			featured: row.featured === true,
			bestseller: row.bestseller === true,
			active: row.active === true,
			archived: row.archived === true,
			variants: variants.filter((variant) => num(variant.product_id) === num(row.id)).map((variant) => ({
				id: num(variant.id),
				name: variant.name,
				sku: variant.sku,
				barcode: variant.barcode ?? "",
				mrpPaise: num(variant.mrp_paise),
				pricePaise: num(variant.price_paise),
				unit: variant.unit,
				weightG: num(variant.weight_g),
				taxBps: num(variant.tax_bps),
				active: variant.active === true
			}))
		})),
		inventory: stock.map((row) => ({
			id: num(row.id),
			storeId: num(row.store_id),
			variantId: num(row.variant_id),
			qty: num(row.qty),
			lowAt: num(row.low_at)
		})),
		orders: orders.map((row) => ({
			id: num(row.id),
			publicId: row.public_id,
			status: row.status,
			payablePaise: num(row.payable_paise),
			paymentMethod: row.payment_method,
			createdAt: row.created_at,
			userId: row.user_id,
			storeId: num(row.store_id),
			name: row.full_name ?? "Customer"
		})),
		customers: customers.map((row) => ({
			userId: row.user_id,
			name: row.full_name ?? "",
			email: row.email ?? "",
			phone: row.phone ?? "",
			orders: num(row.orders),
			roles: byUser.get(row.user_id) ?? []
		})),
		banners: banners.map((row) => ({
			id: num(row.id),
			title: row.title,
			subtitle: row.subtitle,
			tone: row.tone,
			href: row.href,
			sort: num(row.sort),
			active: row.active === true
		})),
		coupons: coupons.map((row) => ({
			id: num(row.id),
			code: row.code,
			description: row.description,
			kind: row.kind,
			amount: num(row.amount),
			maxDiscountPaise: num(row.max_discount_paise),
			minSubtotalPaise: num(row.min_subtotal_paise),
			active: row.active === true
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
			active: row.active === true
		})),
		areas: areas.map((row) => ({
			id: num(row.id),
			name: row.name,
			city: row.city,
			pincode: row.pincode,
			lat: num(row.lat),
			lng: num(row.lng),
			active: row.active === true,
			storeId: row.store_id == null ? null : num(row.store_id)
		})),
		partners: partners.map((row) => ({
			id: num(row.id),
			name: row.full_name,
			phone: row.phone ?? "",
			vehicle: row.vehicle,
			available: row.is_available === true,
			active: row.active === true,
			userId: row.user_id
		})),
		tickets: tickets.map((row) => ({
			id: num(row.id),
			subject: row.subject,
			body: row.body,
			status: row.status,
			createdAt: row.created_at,
			name: row.full_name ?? "Customer"
		})),
		settings: settings.map((row) => ({
			key: row.key,
			value: row.value
		})),
		audits: audits.map((row) => ({
			action: row.action,
			entity: row.entity,
			entityId: row.entity_id ?? "",
			createdAt: row.created_at
		}))
	};
});
var ProductInput = object({
	id: number().int().positive().nullable(),
	categoryId: number().int().positive(),
	brand: string().trim().min(1).max(60),
	name: string().trim().min(2).max(120),
	description: string().trim().min(4).max(500),
	featured: boolean(),
	bestseller: boolean(),
	active: boolean(),
	imageDataUrl: string().max(18e4).nullable().optional(),
	variant: object({
		id: number().int().positive().nullable(),
		name: string().trim().min(1).max(40),
		sku: string().trim().min(2).max(40),
		barcode: string().trim().max(48).optional().default(""),
		mrpPaise: number().int().positive(),
		pricePaise: number().int().positive(),
		unit: string().trim().min(1).max(40),
		weightG: number().int().min(0).max(5e4),
		taxBps: number().int().min(0).max(2800),
		openingQty: number().int().min(0).max(5e3).optional()
	})
});
var saveProduct_createServerFn_handler = createServerRpc({
	id: "c2fb1452a3bd68e952837e1f1dc96123bc8f11ffec6fe8e3991c319f84a44b8f",
	name: "saveProduct",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => saveProduct.__executeServer(opts));
var saveProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(ProductInput, input)).handler(saveProduct_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const roles = await ensure(sql, context.userId);
	assertRole(roles, ["admin", "inventory_manager"]);
	if (data.variant.pricePaise > data.variant.mrpPaise) throw new Error("Selling price cannot exceed MRP.");
	if (data.imageDataUrl && !data.imageDataUrl.startsWith("data:image/")) throw new Error("Upload a PNG, JPG or WebP.");
	let productId = data.id;
	if (productId) {
		if (!(await sql`
        update products set category_id = ${data.categoryId}, brand = ${data.brand}, name = ${data.name},
          description = ${data.description}, featured = ${data.featured}, bestseller = ${data.bestseller},
          active = ${data.active}, archived = false
        where id = ${productId} returning id`)[0]) throw new Error("Product not found.");
	} else {
		const inserted = await sql`
        insert into products (category_id, brand, name, description, featured, bestseller, active)
        values (${data.categoryId}, ${data.brand}, ${data.name}, ${data.description}, ${data.featured},
                ${data.bestseller}, ${data.active}) returning id`;
		productId = num(inserted[0].id);
	}
	const variant = data.variant;
	if (variant.id) await sql`
        update product_variants set name = ${variant.name}, sku = ${variant.sku}, barcode = ${variant.barcode || variant.sku},
          mrp_paise = ${variant.mrpPaise}, price_paise = ${variant.pricePaise}, unit = ${variant.unit},
          weight_g = ${variant.weightG}, tax_bps = ${variant.taxBps}
        where id = ${variant.id} and product_id = ${productId}`;
	else {
		const created = await sql`
        insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps)
        values (${productId}, ${variant.name}, ${variant.sku}, ${variant.barcode || variant.sku}, ${variant.mrpPaise},
                ${variant.pricePaise}, ${variant.unit}, ${variant.weightG}, ${variant.taxBps}) returning id`;
		const variantId = num(created[0].id);
		const stores = await sql`select id from stores`;
		for (const store of stores) await sql`
          insert into inventory (store_id, variant_id, qty, low_at)
          values (${store.id}, ${variantId}, ${variant.openingQty ?? 12}, 8)
          on conflict (store_id, variant_id) do nothing`;
	}
	if (data.imageDataUrl && productId) {
		await sql`delete from product_images where product_id = ${productId}`;
		await sql`insert into product_images (product_id, url, sort) values (${productId}, ${data.imageDataUrl}, 0)`;
	}
	await audit(sql, context.userId, "save_product", "product", String(productId), { name: data.name });
	return { id: productId };
});
var archiveProduct_createServerFn_handler = createServerRpc({
	id: "21ad400640be17de3ea3ad4ba38bd3e580a0e07adf8cbb7472dda7de416bb0d3",
	name: "archiveProduct",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => archiveProduct.__executeServer(opts));
var archiveProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(number().int().positive(), input)).handler(archiveProduct_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const roles = await ensure(sql, context.userId);
	assertRole(roles, ["admin", "inventory_manager"]);
	await sql`update products set archived = true, active = false where id = ${data}`;
	await audit(sql, context.userId, "archive_product", "product", String(data), {});
	return { ok: true };
});
var CategoryInput = object({
	id: number().int().positive().nullable(),
	parentId: number().int().positive().nullable(),
	name: string().trim().min(2).max(60),
	slug: string().trim().regex(/^[a-z0-9-]+$/).max(48),
	blurb: string().trim().max(140).optional().default(""),
	sort: number().int().min(0).max(999),
	visible: boolean()
});
var saveCategory_createServerFn_handler = createServerRpc({
	id: "11d953476f4e92aebb38e9cec07cbff99fd5e23db55df2e60cf9320c703adfb9",
	name: "saveCategory",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => saveCategory.__executeServer(opts));
var saveCategory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(CategoryInput, input)).handler(saveCategory_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const roles = await ensure(sql, context.userId);
	assertRole(roles, ["admin"]);
	if (data.id) {
		await sql`
        update categories set parent_id = ${data.parentId}, name = ${data.name}, slug = ${data.slug},
          blurb = ${data.blurb}, sort = ${data.sort}, visible = ${data.visible}, image_key = ${data.slug}
        where id = ${data.id}`;
		return { id: data.id };
	}
	const inserted = await sql`
      insert into categories (parent_id, name, slug, blurb, sort, visible, image_key)
      values (${data.parentId}, ${data.name}, ${data.slug}, ${data.blurb}, ${data.sort}, ${data.visible}, ${data.slug})
      returning id`;
	await audit(sql, context.userId, "save_category", "category", String(inserted[0].id), { slug: data.slug });
	return { id: num(inserted[0].id) };
});
var StockInput = object({
	storeId: number().int().positive(),
	variantId: number().int().positive(),
	qty: number().int().min(0).max(1e5),
	reason: string().trim().min(3).max(140)
});
var setStock_createServerFn_handler = createServerRpc({
	id: "bf60c207099e17261d115bdaba0ab03329a2792a983b16bfbb93abe7b1902659",
	name: "setStock",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => setStock.__executeServer(opts));
var setStock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(StockInput, input)).handler(setStock_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const roles = await ensure(sql, context.userId);
	assertRole(roles, [
		"admin",
		"store_manager",
		"inventory_manager"
	]);
	const current = await sql`
      select qty from inventory where store_id = ${data.storeId} and variant_id = ${data.variantId}`;
	const before = num(current[0]?.qty);
	if (!current[0]) await sql`
        insert into inventory (store_id, variant_id, qty, low_at)
        values (${data.storeId}, ${data.variantId}, ${data.qty}, 8)`;
	else await sql`
        update inventory set qty = ${data.qty}, updated_at = now()
        where store_id = ${data.storeId} and variant_id = ${data.variantId}`;
	await sql`
      insert into inventory_movements (store_id, variant_id, delta, reason, actor_id)
      values (${data.storeId}, ${data.variantId}, ${data.qty - before}, ${data.reason}, ${context.userId})`;
	await audit(sql, context.userId, "set_stock", "variant", String(data.variantId), data);
	return { ok: true };
});
var ADMIN_NEXT = {
	pending: ["confirmed", "cancelled"],
	confirmed: ["preparing", "cancelled"],
	preparing: ["packed", "cancelled"],
	packed: ["ready_for_pickup", "cancelled"],
	ready_for_pickup: ["cancelled"],
	assigned: ["picked_up", "cancelled"],
	picked_up: ["out_for_delivery"],
	out_for_delivery: ["delivered"],
	cancelled: ["refund_initiated"],
	refund_initiated: ["refunded"],
	delivered: []
};
async function restore(sql, orderId, storeId, actor, publicId) {
	const items = await sql`
    select variant_id, qty from order_items where order_id = ${orderId}`;
	for (const item of items) {
		if (item.variant_id == null) continue;
		await sql`
      update inventory set qty = qty + ${item.qty}, updated_at = now()
      where store_id = ${storeId} and variant_id = ${item.variant_id}`;
		await sql`
      insert into inventory_movements (store_id, variant_id, delta, reason, actor_id)
      values (${storeId}, ${item.variant_id}, ${item.qty}, ${"cancel " + publicId}, ${actor})`;
	}
}
var setOrderStatus_createServerFn_handler = createServerRpc({
	id: "ba2348f7d4cab481218c77440cc48d1527ebdfac754ef0fd1295e8553bebd83b",
	name: "setOrderStatus",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => setOrderStatus.__executeServer(opts));
var setOrderStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	publicId: string().trim().min(4),
	status: string().trim(),
	note: string().trim().max(180).optional().default("")
}), input)).handler(setOrderStatus_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const roles = await ensure(sql, context.userId);
	assertRole(roles, [
		"admin",
		"store_manager",
		"order_manager",
		"delivery_manager"
	]);
	const order = (await sql`
      select id, status, store_id, user_id, payment_method from orders where public_id = ${data.publicId}`)[0];
	if (!order) throw new Error("Order not found.");
	if (!(ADMIN_NEXT[order.status] ?? []).includes(data.status)) throw new Error("That status change is not allowed from here.");
	if (data.status === "cancelled") {
		if ([
			"picked_up",
			"out_for_delivery",
			"delivered"
		].includes(order.status)) throw new Error("This order is already out for delivery.");
		await restore(sql, num(order.id), num(order.store_id), context.userId, data.publicId);
	}
	let otp = null;
	if (data.status === "out_for_delivery") {
		otp = String(Math.floor(1e3 + Math.random() * 9e3));
		await sql`update orders set delivery_otp = ${otp} where id = ${order.id}`;
		await sql`
        update delivery_assignments set status = 'out_for_delivery' where order_id = ${order.id}`;
	}
	if (data.status === "picked_up") await sql`update delivery_assignments set status = 'picked_up', picked_at = now() where order_id = ${order.id}`;
	if (data.status === "delivered") await sql`
        update delivery_assignments set status = 'delivered', delivered_at = now() where order_id = ${order.id}`;
	const next = data.status === "cancelled" && order.payment_method === "online" ? "refund_initiated" : data.status;
	await sql`update orders set status = ${next}, updated_at = now(), cancel_reason = ${data.note || null} where id = ${order.id}`;
	await sql`
      insert into order_status_history (order_id, status, note, actor_id)
      values (${order.id}, ${next}, ${data.note || next}, ${context.userId})`;
	if (next === "refund_initiated" || next === "refunded") {
		const payments = await sql`
        select id, amount_paise from payments where order_id = ${order.id} order by id desc limit 1`;
		if (payments[0] && next === "refund_initiated") await sql`
          insert into refunds (order_id, payment_id, amount_paise, status, reason)
          values (${order.id}, ${payments[0].id}, ${payments[0].amount_paise}, 'initiated', ${data.note || "Refund"})`;
		if (next === "refunded") {
			await sql`update refunds set status = 'refunded' where order_id = ${order.id}`;
			await sql`update payments set status = 'refunded' where order_id = ${order.id}`;
		}
	}
	await notify(sql, order.user_id, "Order update", `${data.publicId} is now ${next.replaceAll("_", " ")}.`, `/orders/${data.publicId}`);
	await audit(sql, context.userId, "order_status", "order", data.publicId, { status: next });
	return {
		status: next,
		otp
	};
});
var assignPartner_createServerFn_handler = createServerRpc({
	id: "089b0b5c2c4ff8cd8f6833a007afa34a84a28ecdd010b973bff365c9a5f2a72d",
	name: "assignPartner",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => assignPartner.__executeServer(opts));
var assignPartner = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	publicId: string().min(4),
	partnerId: number().int().positive()
}), input)).handler(assignPartner_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const roles = await ensure(sql, context.userId);
	assertRole(roles, [
		"admin",
		"delivery_manager",
		"order_manager"
	]);
	const order = (await sql`
      select id, status, user_id from orders where public_id = ${data.publicId}`)[0];
	if (!order) throw new Error("Order not found.");
	if (order.status !== "ready_for_pickup") throw new Error("Mark the order ready for pickup before assigning.");
	const partners = await sql`
      select id, user_id, full_name from delivery_partners where id = ${data.partnerId} and active = true`;
	if (!partners[0]) throw new Error("That partner is not active.");
	const payoutRow = await sql`select value from app_settings where key = 'payout_paise'`;
	const payout = num(payoutRow[0]?.value || 2500);
	await sql`
      insert into delivery_assignments (order_id, partner_id, status, payout_paise)
      values (${order.id}, ${data.partnerId}, 'assigned', ${payout})
      on conflict (order_id) do update set partner_id = excluded.partner_id, status = 'assigned', assigned_at = now()`;
	await sql`
      insert into delivery_status_history (assignment_id, status, note)
      values (${(await sql`select id from delivery_assignments where order_id = ${order.id}`)[0].id}, 'assigned', ${partners[0].full_name})`;
	await sql`update orders set status = 'assigned', updated_at = now() where id = ${order.id}`;
	await sql`
      insert into order_status_history (order_id, status, note, actor_id)
      values (${order.id}, 'assigned', ${"Assigned to " + partners[0].full_name}, ${context.userId})`;
	await notify(sql, order.user_id, "Partner assigned", `${data.publicId} has a delivery partner.`, `/orders/${data.publicId}`);
	if (partners[0].user_id) await notify(sql, partners[0].user_id, "New delivery", `Pick up ${data.publicId}.`, "/rider");
	await audit(sql, context.userId, "assign", "order", data.publicId, { partnerId: data.partnerId });
	return { ok: true };
});
var getDeskOrder_createServerFn_handler = createServerRpc({
	id: "397cdcff0cee8a8df946be13e9a9703468606260e9b5a04657a863572292ecf8",
	name: "getDeskOrder",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => getDeskOrder.__executeServer(opts));
var getDeskOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(string().min(4), input)).handler(getDeskOrder_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensure(sql, context.userId);
	const order = (await sql`select id, public_id, status, address_snapshot, subtotal_paise, discount_paise, delivery_fee_paise,
              payable_paise, payment_method, coupon_code, delivery_otp, cancel_reason
       from orders where public_id = ${data}`)[0];
	if (!order) throw new Error("Order not found.");
	const items = await sql`
      select name, qty, price_paise, unit from order_items where order_id = ${order.id}`;
	const history = await sql`
      select status, note, created_at::text as created_at from order_status_history where order_id = ${order.id} order by id`;
	const payments = await sql`
      select status, provider, amount_paise from payments where order_id = ${order.id} order by id desc limit 1`;
	const refunds = await sql`
      select status, amount_paise from refunds where order_id = ${order.id} order by id desc limit 1`;
	const snapshot = typeof order.address_snapshot === "string" ? JSON.parse(order.address_snapshot) : order.address_snapshot;
	return {
		publicId: order.public_id,
		status: order.status,
		address: snapshot,
		subtotalPaise: num(order.subtotal_paise),
		discountPaise: num(order.discount_paise),
		deliveryPaise: num(order.delivery_fee_paise),
		payablePaise: num(order.payable_paise),
		paymentMethod: order.payment_method,
		couponCode: order.coupon_code,
		otp: order.delivery_otp,
		cancelReason: order.cancel_reason,
		items: items.map((item) => ({
			name: item.name,
			qty: num(item.qty),
			pricePaise: num(item.price_paise),
			unit: item.unit
		})),
		history: history.map((row) => ({
			status: row.status,
			note: row.note ?? "",
			createdAt: row.created_at
		})),
		payment: payments[0] ? {
			status: payments[0].status,
			provider: payments[0].provider,
			amountPaise: num(payments[0].amount_paise)
		} : null,
		refund: refunds[0] ? {
			status: refunds[0].status,
			amountPaise: num(refunds[0].amount_paise)
		} : null
	};
});
var BannerInput = object({
	id: number().int().positive().nullable(),
	title: string().trim().min(2).max(60),
	subtitle: string().trim().max(140),
	tone: _enum([
		"brand",
		"ink",
		"cream"
	]),
	href: string().trim().max(80),
	sort: number().int().min(0).max(99),
	active: boolean()
});
var saveBanner_createServerFn_handler = createServerRpc({
	id: "8dc1e23923f6ecc205dd5760e78605d8431ae8763a6d3b15017d71fcefc2d8c5",
	name: "saveBanner",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => saveBanner.__executeServer(opts));
var saveBanner = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(BannerInput, input)).handler(saveBanner_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const roles = await ensure(sql, context.userId);
	assertRole(roles, ["admin"]);
	if (data.id) {
		await sql`
        update banners set title = ${data.title}, subtitle = ${data.subtitle}, tone = ${data.tone},
          href = ${data.href}, sort = ${data.sort}, active = ${data.active} where id = ${data.id}`;
		return { id: data.id };
	}
	const inserted = await sql`
      insert into banners (title, subtitle, tone, href, sort, active)
      values (${data.title}, ${data.subtitle}, ${data.tone}, ${data.href}, ${data.sort}, ${data.active})
      returning id`;
	return { id: num(inserted[0].id) };
});
var CouponInput = object({
	id: number().int().positive().nullable(),
	code: string().trim().min(3).max(20),
	description: string().trim().min(3).max(140),
	kind: _enum(["flat", "percent"]),
	amount: number().int().positive(),
	maxDiscountPaise: number().int().min(0),
	minSubtotalPaise: number().int().min(0),
	active: boolean()
});
var saveCoupon_createServerFn_handler = createServerRpc({
	id: "030275d3d7c7850051f500d9634998ac5d708518779870f7719791590dc9bcfb",
	name: "saveCoupon",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => saveCoupon.__executeServer(opts));
var saveCoupon = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(CouponInput, input)).handler(saveCoupon_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const roles = await ensure(sql, context.userId);
	assertRole(roles, ["admin"]);
	const code = data.code.toUpperCase();
	if (data.id) {
		await sql`
        update coupons set code = ${code}, description = ${data.description}, kind = ${data.kind}, amount = ${data.amount},
          max_discount_paise = ${data.maxDiscountPaise}, min_subtotal_paise = ${data.minSubtotalPaise}, active = ${data.active}
        where id = ${data.id}`;
		return { id: data.id };
	}
	const inserted = await sql`
      insert into coupons (code, description, kind, amount, max_discount_paise, min_subtotal_paise, active)
      values (${code}, ${data.description}, ${data.kind}, ${data.amount}, ${data.maxDiscountPaise}, ${data.minSubtotalPaise}, ${data.active})
      returning id`;
	return { id: num(inserted[0].id) };
});
var StoreInput = object({
	id: number().int().positive().nullable(),
	name: string().trim().min(2).max(80),
	code: string().trim().min(2).max(20),
	address: string().trim().min(3).max(160),
	city: string().trim().min(2).max(40),
	pincode: string().regex(/^\d{6}$/),
	lat: number(),
	lng: number(),
	radiusKm: number().min(1).max(25),
	opens: string().trim().max(8),
	closes: string().trim().max(8),
	deliveryFeePaise: number().int().min(0),
	freeAbovePaise: number().int().min(0),
	active: boolean()
});
var saveStore_createServerFn_handler = createServerRpc({
	id: "e291acf70b556f59f19095a59f716207cf4534fcaf29b508d470a223b8440408",
	name: "saveStore",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => saveStore.__executeServer(opts));
var saveStore = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(StoreInput, input)).handler(saveStore_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const roles = await ensure(sql, context.userId);
	assertRole(roles, ["admin", "store_manager"]);
	if (data.id) {
		await sql`
        update stores set name = ${data.name}, code = ${data.code}, address = ${data.address}, city = ${data.city},
          pincode = ${data.pincode}, lat = ${data.lat}, lng = ${data.lng}, radius_km = ${data.radiusKm},
          opens = ${data.opens}, closes = ${data.closes}, delivery_fee_paise = ${data.deliveryFeePaise},
          free_above_paise = ${data.freeAbovePaise}, active = ${data.active}
        where id = ${data.id}`;
		return { id: data.id };
	}
	const inserted = await sql`
      insert into stores (name, code, address, city, pincode, lat, lng, radius_km, opens, closes, delivery_fee_paise, free_above_paise, active)
      values (${data.name}, ${data.code}, ${data.address}, ${data.city}, ${data.pincode}, ${data.lat}, ${data.lng},
              ${data.radiusKm}, ${data.opens}, ${data.closes}, ${data.deliveryFeePaise}, ${data.freeAbovePaise}, ${data.active})
      returning id`;
	return { id: num(inserted[0].id) };
});
var AreaInput = object({
	id: number().int().positive().nullable(),
	name: string().trim().min(2).max(60),
	city: string().trim().min(2).max(40),
	pincode: string().regex(/^\d{6}$/),
	lat: number(),
	lng: number(),
	storeId: number().int().positive(),
	active: boolean()
});
var saveArea_createServerFn_handler = createServerRpc({
	id: "2301b8c3b4513aff22ba9c5dd84aa4817c232423d7d0a14a66bc679f828c9621",
	name: "saveArea",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => saveArea.__executeServer(opts));
var saveArea = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(AreaInput, input)).handler(saveArea_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const roles = await ensure(sql, context.userId);
	assertRole(roles, ["admin", "store_manager"]);
	let id = data.id;
	if (id) await sql`
        update service_areas set name = ${data.name}, city = ${data.city}, pincode = ${data.pincode},
          lat = ${data.lat}, lng = ${data.lng}, active = ${data.active} where id = ${id}`;
	else {
		const inserted = await sql`
        insert into service_areas (name, city, pincode, lat, lng, active)
        values (${data.name}, ${data.city}, ${data.pincode}, ${data.lat}, ${data.lng}, ${data.active})
        returning id`;
		id = num(inserted[0].id);
	}
	await sql`delete from store_service_areas where area_id = ${id}`;
	await sql`insert into store_service_areas (store_id, area_id) values (${data.storeId}, ${id})`;
	return { id };
});
var saveSettings_createServerFn_handler = createServerRpc({
	id: "8ab02745c1e5cb062b3982d227159f47cc6bbbbfe9ab648d1d1c33cfcafb9bdd",
	name: "saveSettings",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => saveSettings.__executeServer(opts));
var saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(array(object({
	key: string().trim().min(2).max(40),
	value: string().max(240)
})).max(20), input)).handler(saveSettings_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const roles = await ensure(sql, context.userId);
	assertRole(roles, ["admin"]);
	for (const row of data) await sql`
        insert into app_settings (key, value) values (${row.key}, ${row.value})
        on conflict (key) do update set value = excluded.value`;
	await audit(sql, context.userId, "settings", "app_settings", "bulk", { keys: data.map((row) => row.key) });
	return { ok: true };
});
var setUserRoles_createServerFn_handler = createServerRpc({
	id: "d5e7365b63984662c425a9ff84a5a706ab0184f597077ae408b470882d1a3581",
	name: "setUserRoles",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => setUserRoles.__executeServer(opts));
var setUserRoles = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	userId: string().min(1),
	roles: array(_enum(STAFF_ROLES)).max(6)
}), input)).handler(setUserRoles_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!(await ensure(sql, context.userId)).includes("super_admin")) throw new Error("Only a super admin can change roles.");
	if (data.userId === context.userId && !data.roles.includes("super_admin")) {
		const others = await sql`
        select count(*) as n from user_roles where role = 'super_admin' and user_id <> ${context.userId}`;
		if (num(others[0]?.n) === 0) throw new Error("Keep at least one super admin.");
	}
	await sql`delete from user_roles where user_id = ${data.userId}`;
	for (const role of data.roles) await sql`insert into user_roles (user_id, role) values (${data.userId}, ${role}) on conflict do nothing`;
	if (data.roles.includes("delivery_manager") || data.roles.includes("super_admin")) {
		const profile = await sql`
        select full_name, phone from profiles where user_id = ${data.userId}`;
		await sql`
        insert into delivery_partners (user_id, full_name, phone)
        values (${data.userId}, ${profile[0]?.full_name || "Partner"}, ${profile[0]?.phone})
        on conflict (user_id) do nothing`;
	}
	await audit(sql, context.userId, "roles", "user", data.userId, { roles: data.roles });
	return { ok: true };
});
var setTicketStatus_createServerFn_handler = createServerRpc({
	id: "90e651e0755c257cf711440642725250b48cb7bb529f8f4d0bbca9e62b3afda6",
	name: "setTicketStatus",
	filename: "src/lib/mehrait/admin.functions.ts"
}, (opts) => setTicketStatus.__executeServer(opts));
var setTicketStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	id: number().int().positive(),
	status: _enum(["open", "closed"])
}), input)).handler(setTicketStatus_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const roles = await ensure(sql, context.userId);
	assertRole(roles, ["admin", "order_manager"]);
	await sql`update support_tickets set status = ${data.status}, updated_at = now() where id = ${data.id}`;
	return { ok: true };
});
//#endregion
export { archiveProduct_createServerFn_handler, assignPartner_createServerFn_handler, getDeskOrder_createServerFn_handler, getDesk_createServerFn_handler, saveArea_createServerFn_handler, saveBanner_createServerFn_handler, saveCategory_createServerFn_handler, saveCoupon_createServerFn_handler, saveProduct_createServerFn_handler, saveSettings_createServerFn_handler, saveStore_createServerFn_handler, setOrderStatus_createServerFn_handler, setStock_createServerFn_handler, setTicketStatus_createServerFn_handler, setUserRoles_createServerFn_handler };
