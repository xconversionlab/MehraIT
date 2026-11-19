import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { num } from "./num";

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Check that form and try again.");
  return result.data;
}

async function partnerFor(sql: Sql, userId: string) {
  const rows = await sql<{
    id: number;
    full_name: string;
    phone: string | null;
    vehicle: string;
    is_available: boolean;
    active: boolean;
  }>`select id, full_name, phone, vehicle, is_available, active
     from delivery_partners where user_id = ${userId}`;
  return rows[0] ?? null;
}

export const getRider = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const partner = await partnerFor(sql, context.userId);
    if (!partner || partner.active !== true) {
      const roles = await sql<{ role: string }>`select role from user_roles where user_id = ${context.userId}`;
      return {
        enrolled: false as const,
        canJoin: roles.some((row) => row.role === "super_admin" || row.role === "delivery_manager" || row.role === "admin"),
        jobs: [],
        history: [],
        earningsPaise: 0,
        available: false,
        name: "",
      };
    }
    const jobs = await sql<{
      public_id: string;
      status: string;
      payable_paise: number;
      address_snapshot: unknown;
      payout_paise: number;
      store_name: string;
      store_address: string;
      store_lat: number;
      store_lng: number;
    }>`select o.public_id, o.status, o.payable_paise, o.address_snapshot, da.payout_paise,
              s.name as store_name, s.address as store_address, s.lat as store_lat, s.lng as store_lng
       from delivery_assignments da
       join orders o on o.id = da.order_id
       join stores s on s.id = o.store_id
       where da.partner_id = ${partner.id}
         and o.status in ('assigned', 'picked_up', 'out_for_delivery')
       order by da.id desc`;
    const history = await sql<{ public_id: string; status: string; payout_paise: number; delivered_at: string | null }>`
      select o.public_id, o.status, da.payout_paise, da.delivered_at::text as delivered_at
      from delivery_assignments da
      join orders o on o.id = da.order_id
      where da.partner_id = ${partner.id}
        and o.status in ('delivered', 'cancelled', 'refund_initiated', 'refunded')
      order by da.id desc limit 20`;
    const earned = await sql<{ n: number }>`
      select coalesce(sum(da.payout_paise), 0) as n
      from delivery_assignments da
      join orders o on o.id = da.order_id
      where da.partner_id = ${partner.id} and o.status = 'delivered'`;
    return {
      enrolled: true as const,
      canJoin: false,
      name: partner.full_name,
      available: partner.is_available === true,
      vehicle: partner.vehicle,
      phone: partner.phone ?? "",
      earningsPaise: num(earned[0]?.n),
      jobs: jobs.map((job) => {
        const address = typeof job.address_snapshot === "string"
          ? (JSON.parse(job.address_snapshot) as Record<string, unknown>)
          : (job.address_snapshot as Record<string, unknown>);
        return {
          publicId: job.public_id,
          status: job.status,
          payablePaise: num(job.payable_paise),
          payoutPaise: num(job.payout_paise),
          storeName: job.store_name,
          storeAddress: job.store_address,
          storeLat: num(job.store_lat),
          storeLng: num(job.store_lng),
          address,
        };
      }),
      history: history.map((row) => ({
        publicId: row.public_id,
        status: row.status,
        payoutPaise: num(row.payout_paise),
        deliveredAt: row.delivered_at,
      })),
    };
  });

export const joinRoster = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const roles = await sql<{ role: string }>`select role from user_roles where user_id = ${context.userId}`;
    const allowed = roles.some((row) =>
      ["super_admin", "admin", "delivery_manager"].includes(row.role),
    );
    if (!allowed) throw new Error("A delivery manager has to add you to the roster.");
    const profile = await sql<{ full_name: string | null; phone: string | null }>`
      select full_name, phone from profiles where user_id = ${context.userId}`;
    await sql`
      insert into delivery_partners (user_id, full_name, phone, is_available)
      values (${context.userId}, ${profile[0]?.full_name || "Partner"}, ${profile[0]?.phone}, false)
      on conflict (user_id) do update set active = true`;
    return { ok: true as const };
  });

export const setAvailability = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => parse(z.boolean(), input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const partner = await partnerFor(sql, context.userId);
    if (!partner) throw new Error("You are not on the rider roster.");
    await sql`update delivery_partners set is_available = ${data} where id = ${partner.id}`;
    return { ok: true as const };
  });

export const shareLocation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => parse(z.object({ lat: z.number(), lng: z.number() }), input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const partner = await partnerFor(sql, context.userId);
    if (!partner) throw new Error("You are not on the rider roster.");
    await sql`
      update delivery_partners set last_lat = ${data.lat}, last_lng = ${data.lng}, last_seen_at = now()
      where id = ${partner.id}`;
    return { ok: true as const };
  });

export const riderAdvance = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    parse(
      z.object({
        publicId: z.string().trim().min(4),
        action: z.enum(["pickup", "out", "deliver"]),
        otp: z.string().trim().optional().default(""),
      }),
      input,
    ),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const partner = await partnerFor(sql, context.userId);
    if (!partner) throw new Error("You are not on the rider roster.");
    const rows = await sql<{
      order_id: number;
      status: string;
      user_id: string;
      delivery_otp: string | null;
      assignment_id: number;
    }>`select o.id as order_id, o.status, o.user_id, o.delivery_otp, da.id as assignment_id
       from orders o
       join delivery_assignments da on da.order_id = o.id
       where o.public_id = ${data.publicId} and da.partner_id = ${partner.id}`;
    const order = rows[0];
    if (!order) throw new Error("That delivery is not assigned to you.");
    let next = order.status;
    if (data.action === "pickup") {
      if (order.status !== "assigned") throw new Error("Pick up is only available after assignment.");
      next = "picked_up";
      await sql`update delivery_assignments set status = 'picked_up', picked_at = now() where id = ${order.assignment_id}`;
    } else if (data.action === "out") {
      if (order.status !== "picked_up") throw new Error("Confirm pickup before leaving the store.");
      next = "out_for_delivery";
      const otp = String(Math.floor(1000 + Math.random() * 9000));
      await sql`update orders set delivery_otp = ${otp} where id = ${order.order_id}`;
      await sql`update delivery_assignments set status = 'out_for_delivery' where id = ${order.assignment_id}`;
    } else {
      if (order.status !== "out_for_delivery") throw new Error("Start the drop before completing it.");
      if (!order.delivery_otp || data.otp.trim() !== order.delivery_otp) {
        throw new Error("That delivery code does not match.");
      }
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
