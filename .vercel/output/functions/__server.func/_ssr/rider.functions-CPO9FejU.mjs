import { r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-DPwruuDW.mjs";
import { t as authMiddleware } from "./middleware-BBXSmM46.mjs";
import { n as createServerRpc, r as num } from "./num-B6cM7uhK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rider.functions-CPO9FejU.js
function parse(schema, input) {
	const result = schema.safeParse(input);
	if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Check that form and try again.");
	return result.data;
}
async function partnerFor(sql, userId) {
	return (await sql`select id, full_name, phone, vehicle, is_available, active
     from delivery_partners where user_id = ${userId}`)[0] ?? null;
}
var getRider_createServerFn_handler = createServerRpc({
	id: "4da5e3d648307120c310e0c6b2848479dc857da5267dfd9a55941b5e8c33d081",
	name: "getRider",
	filename: "src/lib/mehrait/rider.functions.ts"
}, (opts) => getRider.__executeServer(opts));
var getRider = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getRider_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const partner = await partnerFor(sql, context.userId);
	if (!partner || partner.active !== true) return {
		enrolled: false,
		canJoin: (await sql`select role from user_roles where user_id = ${context.userId}`).some((row) => row.role === "super_admin" || row.role === "delivery_manager" || row.role === "admin"),
		jobs: [],
		history: [],
		earningsPaise: 0,
		available: false,
		name: ""
	};
	const jobs = await sql`select o.public_id, o.status, o.payable_paise, o.address_snapshot, da.payout_paise,
              s.name as store_name, s.address as store_address, s.lat as store_lat, s.lng as store_lng
       from delivery_assignments da
       join orders o on o.id = da.order_id
       join stores s on s.id = o.store_id
       where da.partner_id = ${partner.id}
         and o.status in ('assigned', 'picked_up', 'out_for_delivery')
       order by da.id desc`;
	const history = await sql`
      select o.public_id, o.status, da.payout_paise, da.delivered_at::text as delivered_at
      from delivery_assignments da
      join orders o on o.id = da.order_id
      where da.partner_id = ${partner.id}
        and o.status in ('delivered', 'cancelled', 'refund_initiated', 'refunded')
      order by da.id desc limit 20`;
	const earned = await sql`
      select coalesce(sum(da.payout_paise), 0) as n
      from delivery_assignments da
      join orders o on o.id = da.order_id
      where da.partner_id = ${partner.id} and o.status = 'delivered'`;
	return {
		enrolled: true,
		canJoin: false,
		name: partner.full_name,
		available: partner.is_available === true,
		vehicle: partner.vehicle,
		phone: partner.phone ?? "",
		earningsPaise: num(earned[0]?.n),
		jobs: jobs.map((job) => {
			const address = typeof job.address_snapshot === "string" ? JSON.parse(job.address_snapshot) : job.address_snapshot;
			return {
				publicId: job.public_id,
				status: job.status,
				payablePaise: num(job.payable_paise),
				payoutPaise: num(job.payout_paise),
				storeName: job.store_name,
				storeAddress: job.store_address,
				storeLat: num(job.store_lat),
				storeLng: num(job.store_lng),
				address
			};
		}),
		history: history.map((row) => ({
			publicId: row.public_id,
			status: row.status,
			payoutPaise: num(row.payout_paise),
			deliveredAt: row.delivered_at
		}))
	};
});
var joinRoster_createServerFn_handler = createServerRpc({
	id: "42552b646610cd691b6f8d4491d712fa7f848f7aa1c08b563d239e0755e45434",
	name: "joinRoster",
	filename: "src/lib/mehrait/rider.functions.ts"
}, (opts) => joinRoster.__executeServer(opts));
var joinRoster = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(joinRoster_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	if (!(await sql`select role from user_roles where user_id = ${context.userId}`).some((row) => [
		"super_admin",
		"admin",
		"delivery_manager"
	].includes(row.role))) throw new Error("A delivery manager has to add you to the roster.");
	const profile = await sql`
      select full_name, phone from profiles where user_id = ${context.userId}`;
	await sql`
      insert into delivery_partners (user_id, full_name, phone, is_available)
      values (${context.userId}, ${profile[0]?.full_name || "Partner"}, ${profile[0]?.phone}, false)
      on conflict (user_id) do update set active = true`;
	return { ok: true };
});
var setAvailability_createServerFn_handler = createServerRpc({
	id: "1f9aedf9fe81035bb8b30fcc16c1e23dccd35c6bc52d8c747aa0db1ce048ac55",
	name: "setAvailability",
	filename: "src/lib/mehrait/rider.functions.ts"
}, (opts) => setAvailability.__executeServer(opts));
var setAvailability = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(boolean(), input)).handler(setAvailability_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const partner = await partnerFor(sql, context.userId);
	if (!partner) throw new Error("You are not on the rider roster.");
	await sql`update delivery_partners set is_available = ${data} where id = ${partner.id}`;
	return { ok: true };
});
var shareLocation_createServerFn_handler = createServerRpc({
	id: "a49b2ac0bc8917710ef42713b0a7e7e717b42d76000b27ae9e0d8278790eb483",
	name: "shareLocation",
	filename: "src/lib/mehrait/rider.functions.ts"
}, (opts) => shareLocation.__executeServer(opts));
var shareLocation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	lat: number(),
	lng: number()
}), input)).handler(shareLocation_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const partner = await partnerFor(sql, context.userId);
	if (!partner) throw new Error("You are not on the rider roster.");
	await sql`
      update delivery_partners set last_lat = ${data.lat}, last_lng = ${data.lng}, last_seen_at = now()
      where id = ${partner.id}`;
	return { ok: true };
});
var riderAdvance_createServerFn_handler = createServerRpc({
	id: "604a35795045a1119525adf0ca9ad055602a3a6e6ce60b1ca10b6a7394340a93",
	name: "riderAdvance",
	filename: "src/lib/mehrait/rider.functions.ts"
}, (opts) => riderAdvance.__executeServer(opts));
var riderAdvance = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	publicId: string().trim().min(4),
	action: _enum([
		"pickup",
		"out",
		"deliver"
	]),
	otp: string().trim().optional().default("")
}), input)).handler(riderAdvance_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const partner = await partnerFor(sql, context.userId);
	if (!partner) throw new Error("You are not on the rider roster.");
	const order = (await sql`select o.id as order_id, o.status, o.user_id, o.delivery_otp, da.id as assignment_id
       from orders o
       join delivery_assignments da on da.order_id = o.id
       where o.public_id = ${data.publicId} and da.partner_id = ${partner.id}`)[0];
	if (!order) throw new Error("That delivery is not assigned to you.");
	let next = order.status;
	if (data.action === "pickup") {
		if (order.status !== "assigned") throw new Error("Pick up is only available after assignment.");
		next = "picked_up";
		await sql`update delivery_assignments set status = 'picked_up', picked_at = now() where id = ${order.assignment_id}`;
	} else if (data.action === "out") {
		if (order.status !== "picked_up") throw new Error("Confirm pickup before leaving the store.");
		next = "out_for_delivery";
		await sql`update orders set delivery_otp = ${String(Math.floor(1e3 + Math.random() * 9e3))} where id = ${order.order_id}`;
		await sql`update delivery_assignments set status = 'out_for_delivery' where id = ${order.assignment_id}`;
	} else {
		if (order.status !== "out_for_delivery") throw new Error("Start the drop before completing it.");
		if (!order.delivery_otp || data.otp.trim() !== order.delivery_otp) throw new Error("That delivery code does not match.");
		next = "delivered";
		await sql`
        update delivery_assignments set status = 'delivered', delivered_at = now()
        where id = ${order.assignment_id}`;
	}
	await sql`update orders set status = ${next}, updated_at = now() where id = ${order.order_id}`;
	await sql`
      insert into order_status_history (order_id, status, note, actor_id)
      values (${order.order_id}, ${next}, ${"Rider update"}, ${context.userId})`;
	await sql`
      insert into delivery_status_history (assignment_id, status, note)
      values (${order.assignment_id}, ${next}, ${data.action})`;
	await sql`
      insert into notifications (user_id, title, body, href)
      values (${order.user_id}, 'Delivery update', ${data.publicId + " is " + next.replaceAll("_", " ") + "."}, ${"/orders/" + data.publicId})`;
	return { status: next };
});
//#endregion
export { getRider_createServerFn_handler, joinRoster_createServerFn_handler, riderAdvance_createServerFn_handler, setAvailability_createServerFn_handler, shareLocation_createServerFn_handler };
