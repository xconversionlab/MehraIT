import { useEffect, useMemo, useState, type ComponentType } from "react";
import { toast } from "sonner";
import {
  archiveProduct,
  assignPartner,
  getDesk,
  getDeskOrder,
  saveArea,
  saveBanner,
  saveCategory,
  saveCoupon,
  saveProduct,
  saveSettings,
  saveStore,
  setOrderStatus,
  setStock,
  setTicketStatus,
  setUserRoles,
} from "@/lib/mehrait/admin.functions";
import { inr } from "@/lib/mehrait/pricing";
import { can, DESK_SECTIONS } from "@/lib/mehrait/permissions";
import { ROLE_LABEL, STAFF_ROLES, STATUS_LABEL } from "@/lib/mehrait/types";
import { cn } from "@/lib/utils";

type DeskData = Awaited<ReturnType<typeof getDesk>>;
type DeskOrder = Awaited<ReturnType<typeof getDeskOrder>>;

const NEXT: Record<string, string[]> = {
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
};

const ACTION: Record<string, string> = {
  confirmed: "Confirm",
  preparing: "Start preparing",
  packed: "Mark packed",
  ready_for_pickup: "Ready for pickup",
  picked_up: "Picked up",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancel",
  refund_initiated: "Start refund",
  refunded: "Mark refunded",
};

const field = "h-11 w-full rounded-full border border-line bg-paper px-4 text-sm";

export function Desk({ Chart }: { Chart: ComponentType<{ items: { name: string; count: number }[] }> | null }) {
  const [data, setData] = useState<DeskData | null>(null);
  const [error, setError] = useState("");
  const [section, setSection] = useState("overview");

  function load() {
    getDesk()
      .then((desk) => {
        setData(desk);
        setError("");
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "The desk could not load."));
  }
  useEffect(() => { load(); }, []);

  const sections = data ? DESK_SECTIONS.filter((item) => can(data.roles, item.roles)) : [];
  const active = sections.some((item) => item.id === section) ? section : sections[0]?.id ?? "overview";

  if (!data && !error) return <p className="p-6 text-sm text-muted">Loading the desk…</p>;
  if (error && !data) return <div className="p-6"><h1 className="text-xl font-extrabold">Store desk</h1><p className="mt-2 text-sm text-danger">{error}</p></div>;
  if (!data) return null;

  return (
    <div className="md:grid md:grid-cols-[220px_1fr]">
      <nav className="flex gap-2 overflow-x-auto border-b border-line p-3 md:block md:border-r md:border-b-0 md:p-4">
        {sections.map((item) => (
          <button key={item.id} type="button" onClick={() => setSection(item.id)} className={cn("h-10 shrink-0 rounded-full px-3 text-sm font-semibold md:mb-1 md:flex md:w-full", active === item.id ? "bg-brand text-ink" : "text-muted")}>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 md:p-6">
        {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
        {active === "overview" ? <Overview data={data} Chart={Chart} /> : null}
        {active === "products" ? <Products data={data} reload={load} /> : null}
        {active === "categories" ? <Categories data={data} reload={load} /> : null}
        {active === "inventory" ? <Inventory data={data} reload={load} /> : null}
        {active === "orders" ? <Orders data={data} reload={load} /> : null}
        {active === "customers" ? <Customers data={data} reload={load} /> : null}
        {active === "marketing" ? <Marketing data={data} reload={load} /> : null}
        {active === "stores" ? <Stores data={data} reload={load} /> : null}
        {active === "delivery" ? <Partners data={data} /> : null}
        {active === "settings" ? <Settings data={data} reload={load} /> : null}
      </div>
    </div>
  );
}

function Overview({ data, Chart }: { data: DeskData; Chart: ComponentType<{ items: { name: string; count: number }[] }> | null }) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const category of data.categories.filter((item) => item.parentId == null && !item.archived)) {
      const ids = new Set([category.id, ...data.categories.filter((item) => item.parentId === category.id).map((item) => item.id)]);
      map.set(category.name.split(",")[0].split("&")[0].trim(), data.products.filter((product) => ids.has(product.categoryId) && !product.archived).length);
    }
    return [...map.entries()].map(([name, count]) => ({ name, count }));
  }, [data]);
  const statusCount = (status: string) => data.metrics.byStatus.find((row) => row.status === status)?.n ?? 0;
  const cards = [
    ["Revenue", inr(data.metrics.revenuePaise)],
    ["Orders", String(data.orders.length)],
    ["Customers", String(data.metrics.customers)],
    ["Active products", String(data.metrics.products)],
    ["Low stock", String(data.metrics.lowStock)],
    ["Out of stock", String(data.metrics.outOfStock)],
    ["Pending", String(statusCount("pending"))],
    ["Delivered", String(statusCount("delivered"))],
    ["Cancelled", String(statusCount("cancelled") + statusCount("refund_initiated") + statusCount("refunded"))],
  ];
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Overview</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-line bg-cream p-4">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <section className="mt-4 rounded-3xl border border-line bg-cream p-4">
        <h2 className="font-semibold">Catalogue by aisle</h2>
        {Chart ? <Chart items={counts} /> : <p className="mt-3 text-sm text-muted">Loading chart…</p>}
      </section>
      <section className="mt-4">
        <h2 className="font-semibold">Recent orders</h2>
        {data.orders.length === 0 ? <p className="mt-2 text-sm text-muted">No orders yet. They show up after a customer checks out.</p> : null}
        <ul className="mt-2 divide-y divide-line text-sm">
          {data.orders.slice(0, 8).map((order) => (
            <li key={order.publicId} className="flex justify-between py-2">
              <span>{order.publicId} · {order.name}</span>
              <span className="tabular-nums">{STATUS_LABEL[order.status] ?? order.status} · {inr(order.payablePaise)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Products({ data, reload }: { data: DeskData; reload: () => void }) {
  const blank = { id: null as number | null, categoryId: data.categories[0]?.id ?? 1, brand: "Mehra", name: "", description: "", featured: false, bestseller: false, active: true, variantId: null as number | null, pack: "1 pc", sku: "", mrp: "", price: "", unit: "1 pc", weight: "0", tax: "0", opening: "12" };
  const [form, setForm] = useState(blank);
  const [image, setImage] = useState<string | null>(null);
  function edit(id: number) {
    const product = data.products.find((item) => item.id === id);
    const variant = product?.variants[0];
    if (!product || !variant) return;
    setForm({
      id: product.id, categoryId: product.categoryId, brand: product.brand, name: product.name, description: product.description,
      featured: product.featured, bestseller: product.bestseller, active: product.active, variantId: variant.id, pack: variant.name,
      sku: variant.sku, mrp: String(variant.mrpPaise / 100), price: String(variant.pricePaise / 100), unit: variant.unit,
      weight: String(variant.weightG), tax: String(variant.taxBps), opening: "12",
    });
  }
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Products</h1>
      <form className="mt-4 grid gap-2 rounded-3xl border border-line bg-cream p-4 md:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        saveProduct({
          data: {
            id: form.id, categoryId: form.categoryId, brand: form.brand, name: form.name, description: form.description,
            featured: form.featured, bestseller: form.bestseller, active: form.active, imageDataUrl: image,
            variant: {
              id: form.variantId, name: form.pack, sku: form.sku, barcode: form.sku,
              mrpPaise: Math.round(Number(form.mrp) * 100), pricePaise: Math.round(Number(form.price) * 100),
              unit: form.unit, weightG: Number(form.weight) || 0, taxBps: Number(form.tax) || 0, openingQty: Number(form.opening) || 0,
            },
          },
        }).then(() => { toast.success("Product saved"); setForm(blank); setImage(null); reload(); }).catch((reason: unknown) => toast.error(reason instanceof Error ? reason.message : "Could not save."));
      }}>
        <input className={field} placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <input className={field} placeholder="Brand" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} required />
        <select className={field} value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: Number(event.target.value) })} aria-label="Category">
          {data.categories.filter((item) => !item.archived).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <input className={field} placeholder="SKU" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} required />
        <input className={field} placeholder="Pack" value={form.pack} onChange={(event) => setForm({ ...form, pack: event.target.value })} />
        <input className={field} placeholder="Unit label" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
        <input className={field} placeholder="MRP rupees" value={form.mrp} onChange={(event) => setForm({ ...form, mrp: event.target.value })} required />
        <input className={field} placeholder="Price rupees" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
        <textarea className="rounded-3xl border border-line bg-paper p-3 text-sm md:col-span-2" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Featured</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.bestseller} onChange={(event) => setForm({ ...form, bestseller: event.target.checked })} /> Bestseller</label>
        <label className="text-sm md:col-span-2">Image
          <input type="file" accept="image/*" className="mt-1 block text-sm" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.size > 140000) { toast.error("Use an image under 140 KB."); return; }
            const reader = new FileReader();
            reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : null);
            reader.readAsDataURL(file);
          }} />
        </label>
        <button className="h-11 rounded-full bg-brand font-bold md:col-span-2" type="submit">{form.id ? "Update product" : "Create product"}</button>
      </form>
      <ul className="mt-4 divide-y divide-line text-sm">
        {data.products.filter((product) => !product.archived).map((product) => (
          <li key={product.id} className="flex items-center justify-between gap-2 py-2">
            <span>{product.brand} {product.name}<span className="block text-muted">{product.variants.map((variant) => variant.sku).join(", ")}</span></span>
            <span className="flex gap-2">
              <button type="button" className="font-semibold" onClick={() => edit(product.id)}>Edit</button>
              <button type="button" className="font-semibold text-danger" onClick={() => archiveProduct({ data: product.id }).then(() => { toast.success("Archived"); reload(); })}>Archive</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Categories({ data, reload }: { data: DeskData; reload: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Categories</h1>
      <form className="mt-4 grid gap-2 md:grid-cols-3" onSubmit={(event) => {
        event.preventDefault();
        saveCategory({ data: { id: null, parentId, name, slug, blurb: "", sort: data.categories.length + 1, visible: true } })
          .then(() => { toast.success("Category saved"); setName(""); setSlug(""); reload(); })
          .catch((reason: unknown) => toast.error(reason instanceof Error ? reason.message : "Could not save."));
      }}>
        <input className={field} placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} required />
        <input className={field} placeholder="slug-like-this" value={slug} onChange={(event) => setSlug(event.target.value)} required />
        <select className={field} value={parentId ?? ""} onChange={(event) => setParentId(event.target.value ? Number(event.target.value) : null)} aria-label="Parent">
          <option value="">Top level</option>
          {data.categories.filter((item) => item.parentId == null).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <button className="h-11 rounded-full bg-brand font-bold" type="submit">Add category</button>
      </form>
      <ul className="mt-4 space-y-1 text-sm">
        {data.categories.filter((item) => !item.archived).map((item) => (
          <li key={item.id} className="flex justify-between border-b border-line py-2">
            <span>{item.parentId ? "— " : ""}{item.name}</span>
            <button type="button" className="font-semibold" onClick={() => saveCategory({ data: { id: item.id, parentId: item.parentId, name: item.name, slug: item.slug, blurb: item.blurb, sort: item.sort, visible: !item.visible } }).then(reload)}>
              {item.visible ? "Hide" : "Show"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Inventory({ data, reload }: { data: DeskData; reload: () => void }) {
  const variants = data.products.flatMap((product) => product.variants.map((variant) => ({ ...variant, product: product.name })));
  const [storeId, setStoreId] = useState(data.stores[0]?.id ?? 1);
  const [variantId, setVariantId] = useState(variants[0]?.id ?? 1);
  const [qty, setQty] = useState("12");
  const [reason, setReason] = useState("Cycle count");
  const rows = data.inventory.filter((row) => row.qty <= row.lowAt);
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Inventory</h1>
      <form className="mt-4 grid gap-2 md:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        setStock({ data: { storeId, variantId, qty: Number(qty), reason } }).then(() => { toast.success("Stock updated"); reload(); }).catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Could not update."));
      }}>
        <select className={field} value={storeId} onChange={(event) => setStoreId(Number(event.target.value))} aria-label="Store">
          {data.stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
        </select>
        <select className={field} value={variantId} onChange={(event) => setVariantId(Number(event.target.value))} aria-label="Variant">
          {variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.product} · {variant.sku}</option>)}
        </select>
        <input className={field} value={qty} onChange={(event) => setQty(event.target.value)} inputMode="numeric" aria-label="Quantity" />
        <input className={field} value={reason} onChange={(event) => setReason(event.target.value)} aria-label="Reason" />
        <button className="h-11 rounded-full bg-brand font-bold" type="submit">Set stock</button>
      </form>
      <h2 className="mt-6 font-semibold">Low and out of stock</h2>
      <ul className="mt-2 text-sm">
        {rows.length === 0 ? <li className="text-muted">All counted lines are above their threshold.</li> : null}
        {rows.map((row) => {
          const variant = variants.find((item) => item.id === row.variantId);
          const store = data.stores.find((item) => item.id === row.storeId);
          return <li key={row.id} className="flex justify-between border-b border-line py-2"><span>{variant?.product} · {store?.code}</span><span className="tabular-nums font-semibold">{row.qty}</span></li>;
        })}
      </ul>
    </div>
  );
}

function Orders({ data, reload }: { data: DeskData; reload: () => void }) {
  const [selected, setSelected] = useState<DeskOrder | null>(null);
  const [partnerId, setPartnerId] = useState(data.partners[0]?.id ?? 0);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const orders = data.orders.filter((order) => (filter === "all" || order.status === filter) && (`${order.publicId} ${order.name}`.toLowerCase().includes(query.toLowerCase())));
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Orders</h1>
      <div className="mt-3 flex gap-2">
        <input className={field} placeholder="Search id or name" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className={field} value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Status">
          <option value="all">All</option>
          {Object.keys(STATUS_LABEL).map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}
        </select>
      </div>
      <ul className="mt-3 divide-y divide-line text-sm">
        {orders.map((order) => (
          <li key={order.publicId}>
            <button type="button" className="flex w-full justify-between py-2 text-left" onClick={() => getDeskOrder({ data: order.publicId }).then(setSelected).catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Could not open."))}>
              <span>{order.publicId} · {order.name}</span>
              <span>{STATUS_LABEL[order.status] ?? order.status} · {inr(order.payablePaise)}</span>
            </button>
          </li>
        ))}
      </ul>
      {selected ? (
        <section className="mt-4 rounded-3xl border border-line bg-cream p-4 text-sm">
          <h2 className="text-lg font-extrabold">{selected.publicId}</h2>
          <p>{STATUS_LABEL[selected.status]} · {selected.paymentMethod} · {selected.payment?.status}</p>
          <p className="mt-1">{String(selected.address.line1 ?? "")}, {String(selected.address.area ?? "")} {String(selected.address.pincode ?? "")}</p>
          <ul className="mt-2">{selected.items.map((item) => <li key={item.name}>{item.name} × {item.qty}</li>)}</ul>
          <p className="mt-2 font-bold tabular-nums">{inr(selected.payablePaise)}</p>
          {selected.otp ? <p className="mt-1">Delivery code {selected.otp}</p> : null}
          {selected.refund ? <p>Refund {selected.refund.status} · {inr(selected.refund.amountPaise)}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {(NEXT[selected.status] ?? []).map((status) => (
              <button key={status} type="button" className="h-10 rounded-full bg-brand px-3 font-semibold" onClick={() => setOrderStatus({ data: { publicId: selected.publicId, status, note: "" } }).then(() => { toast.success("Updated"); reload(); return getDeskOrder({ data: selected.publicId }); }).then(setSelected)}>
                {ACTION[status] ?? status}
              </button>
            ))}
          </div>
          {selected.status === "ready_for_pickup" ? (
            <div className="mt-3 flex gap-2">
              <select className={field} value={partnerId} onChange={(event) => setPartnerId(Number(event.target.value))} aria-label="Partner">
                {data.partners.filter((partner) => partner.active).map((partner) => <option key={partner.id} value={partner.id}>{partner.name}{partner.available ? " · available" : ""}</option>)}
              </select>
              <button type="button" className="h-11 shrink-0 rounded-full bg-ink px-4 font-semibold text-cream" onClick={() => assignPartner({ data: { publicId: selected.publicId, partnerId } }).then(() => { toast.success("Assigned"); reload(); return getDeskOrder({ data: selected.publicId }); }).then(setSelected)}>
                Assign
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function Customers({ data, reload }: { data: DeskData; reload: () => void }) {
  const superAdmin = data.roles.includes("super_admin");
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Customers</h1>
      <ul className="mt-4 space-y-3 text-sm">
        {data.customers.map((customer) => (
          <li key={customer.userId} className="rounded-3xl border border-line bg-cream p-4">
            <p className="font-semibold">{customer.name || "Customer"}</p>
            <p className="text-muted">{customer.email} · {customer.phone || "No mobile"} · {customer.orders} orders</p>
            {superAdmin ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {STAFF_ROLES.map((role) => {
                  const on = customer.roles.includes(role);
                  return (
                    <button key={role} type="button" className={cn("rounded-full px-2 py-1 text-xs font-semibold", on ? "bg-brand" : "border border-line")} onClick={() => {
                      const roles = on ? customer.roles.filter((item) => item !== role) : [...customer.roles, role];
                      setUserRoles({ data: { userId: customer.userId, roles: roles.filter((item): item is (typeof STAFF_ROLES)[number] => (STAFF_ROLES as readonly string[]).includes(item)) } })
                        .then(() => { toast.success("Roles updated"); reload(); })
                        .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Could not update roles."));
                    }}>{ROLE_LABEL[role]}</button>
                  );
                })}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Marketing({ data, reload }: { data: DeskData; reload: () => void }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Marketing</h1>
      <form className="grid gap-2 md:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        saveBanner({ data: { id: null, title, subtitle, tone: "brand", href: "/", sort: data.banners.length + 1, active: true } }).then(() => { toast.success("Banner added"); reload(); });
      }}>
        <input className={field} placeholder="Banner title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <input className={field} placeholder="Subtitle" value={subtitle} onChange={(event) => setSubtitle(event.target.value)} />
        <button className="h-11 rounded-full bg-brand font-bold" type="submit">Add banner</button>
      </form>
      <ul className="text-sm">
        {data.banners.map((banner) => (
          <li key={banner.id} className="flex justify-between border-b border-line py-2">
            <span>{banner.title}</span>
            <button type="button" className="font-semibold" onClick={() => saveBanner({ data: { ...banner, active: !banner.active } }).then(reload)}>{banner.active ? "Hide" : "Show"}</button>
          </li>
        ))}
      </ul>
      <form className="grid gap-2 md:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        saveCoupon({ data: { id: null, code, description, kind: "flat", amount: 5000, maxDiscountPaise: 5000, minSubtotalPaise: 19900, active: true } })
          .then(() => { toast.success("Coupon added"); reload(); })
          .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Could not save."));
      }}>
        <input className={field} placeholder="CODE" value={code} onChange={(event) => setCode(event.target.value)} required />
        <input className={field} placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} required />
        <button className="h-11 rounded-full bg-ink font-semibold text-cream" type="submit">Add Rs 50 coupon</button>
      </form>
      <ul className="text-sm">
        {data.coupons.map((coupon) => <li key={coupon.id} className="border-b border-line py-2">{coupon.code} · {coupon.description}</li>)}
      </ul>
    </div>
  );
}

function Stores({ data, reload }: { data: DeskData; reload: () => void }) {
  const [area, setArea] = useState({ name: "", city: "Bengaluru", pincode: "", lat: "12.97", lng: "77.64", storeId: data.stores[0]?.id ?? 1 });
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Stores and serviceability</h1>
      <ul className="mt-4 space-y-3 text-sm">
        {data.stores.map((store) => (
          <li key={store.id} className="rounded-3xl border border-line bg-cream p-4">
            <p className="font-semibold">{store.name}</p>
            <p className="text-muted">{store.address}, {store.city} {store.pincode}</p>
            <p>Radius {store.radiusKm} km · {store.opens}–{store.closes} · fee {inr(store.deliveryFeePaise)} · free over {inr(store.freeAbovePaise)}</p>
            <button type="button" className="mt-2 font-semibold" onClick={() => saveStore({ data: { ...store, active: !store.active } }).then(reload)}>{store.active ? "Pause store" : "Reopen store"}</button>
          </li>
        ))}
      </ul>
      <h2 className="mt-6 font-semibold">Areas</h2>
      <ul className="mt-2 text-sm">
        {data.areas.map((item) => <li key={item.id} className="border-b border-line py-2">{item.name} · {item.city} · {item.pincode}</li>)}
      </ul>
      <form className="mt-4 grid gap-2 md:grid-cols-3" onSubmit={(event) => {
        event.preventDefault();
        saveArea({ data: { id: null, name: area.name, city: area.city, pincode: area.pincode, lat: Number(area.lat), lng: Number(area.lng), storeId: area.storeId, active: true } })
          .then(() => { toast.success("Area added"); reload(); })
          .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Could not add the area."));
      }}>
        <input className={field} placeholder="Area" value={area.name} onChange={(event) => setArea({ ...area, name: event.target.value })} required />
        <input className={field} placeholder="City" value={area.city} onChange={(event) => setArea({ ...area, city: event.target.value })} required />
        <input className={field} placeholder="Pincode" value={area.pincode} onChange={(event) => setArea({ ...area, pincode: event.target.value })} required />
        <input className={field} placeholder="Lat" value={area.lat} onChange={(event) => setArea({ ...area, lat: event.target.value })} />
        <input className={field} placeholder="Lng" value={area.lng} onChange={(event) => setArea({ ...area, lng: event.target.value })} />
        <select className={field} value={area.storeId} onChange={(event) => setArea({ ...area, storeId: Number(event.target.value) })} aria-label="Store">
          {data.stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
        </select>
        <button className="h-11 rounded-full bg-brand font-bold" type="submit">Add pincode</button>
      </form>
    </div>
  );
}

function Partners({ data }: { data: DeskData }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Delivery partners</h1>
      <p className="mt-1 text-sm text-muted">Assignment is manual. Live GPS is whatever the partner last shared from their phone. Automatic dispatch is not connected.</p>
      <ul className="mt-4 space-y-2 text-sm">
        {data.partners.map((partner) => (
          <li key={partner.id} className="flex justify-between rounded-2xl border border-line px-3 py-3">
            <span>{partner.name} · {partner.vehicle}</span>
            <span>{partner.available ? "Available" : "Offline"}{partner.active ? "" : " · inactive"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Settings({ data, reload }: { data: DeskData; reload: () => void }) {
  const [rows, setRows] = useState(data.settings);
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Settings</h1>
      <form className="mt-4 space-y-2" onSubmit={(event) => {
        event.preventDefault();
        saveSettings({ data: rows }).then(() => { toast.success("Saved"); reload(); }).catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Could not save."));
      }}>
        {rows.map((row, index) => (
          <label key={row.key} className="block text-sm font-semibold">{row.key}
            <input className={`${field} mt-1 font-normal`} value={row.value} onChange={(event) => setRows(rows.map((item, i) => i === index ? { ...item, value: event.target.value } : item))} />
          </label>
        ))}
        <button className="h-11 rounded-full bg-brand px-5 font-bold" type="submit">Save settings</button>
      </form>
      <section className="mt-6 rounded-3xl border border-line bg-cream p-4 text-sm">
        <h2 className="font-semibold">Integrations</h2>
        <p className="mt-2">Payments: Razorpay sandbox is {data.razorpayConfigured ? "configured" : "not configured"}. Cash on delivery is the live tender. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the server to capture real sandbox payments. No charge is simulated.</p>
        <p className="mt-2">Maps: service pins are MehraIT areas. Turn-by-turn opens Google Maps with the saved coordinates. Map tiles are not proxied.</p>
        <p className="mt-2">Notifications: in-app alerts are stored per customer. Web push is not configured.</p>
        <p className="mt-2">Tracking: partners can publish a GPS fix. Automatic dispatch is not enabled.</p>
      </section>
      <section className="mt-4">
        <h2 className="font-semibold">Support tickets</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {data.tickets.length === 0 ? <li className="text-muted">No tickets.</li> : null}
          {data.tickets.map((ticket) => (
            <li key={ticket.id} className="rounded-2xl border border-line p-3">
              <p className="font-semibold">{ticket.subject} · {ticket.name}</p>
              <p className="text-muted">{ticket.body}</p>
              <button type="button" className="mt-1 font-semibold" onClick={() => setTicketStatus({ data: { id: ticket.id, status: ticket.status === "open" ? "closed" : "open" } }).then(reload)}>{ticket.status === "open" ? "Close" : "Reopen"}</button>
            </li>
          ))}
        </ul>
      </section>
      {data.audits.length > 0 ? (
        <section className="mt-4">
          <h2 className="font-semibold">Audit</h2>
          <ul className="mt-2 text-sm text-muted">
            {data.audits.map((row, index) => <li key={index}>{row.action} · {row.entity} {row.entityId}</li>)}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
