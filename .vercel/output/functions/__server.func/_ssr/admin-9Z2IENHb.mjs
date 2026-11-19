import { o as __toESM } from "../_runtime.mjs";
import { n as inr } from "./pricing-DaB8c9_f.mjs";
import { i as STATUS_LABEL, n as ROLE_LABEL, r as STAFF_ROLES } from "./types-CG6XJmV6.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useCurrentUserState } from "./use-current-user-B7Cbrtsy.mjs";
import { t as RedirectToSignIn } from "./gates-Dco3ZlwP.mjs";
import { t as authMiddleware } from "./middleware-BBXSmM46.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { r as can, t as DESK_SECTIONS } from "./permissions-BDsC6k0_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-9Z2IENHb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function parse(schema, input) {
	const result = schema.safeParse(input);
	if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Check that form and try again.");
	return result.data;
}
var getDesk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("ab1670d151169dde9092591b7338795bd884a02356fcbe5a000a599c7fa80991"));
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
var saveProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(ProductInput, input)).handler(createSsrRpc("c2fb1452a3bd68e952837e1f1dc96123bc8f11ffec6fe8e3991c319f84a44b8f"));
var archiveProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(number().int().positive(), input)).handler(createSsrRpc("21ad400640be17de3ea3ad4ba38bd3e580a0e07adf8cbb7472dda7de416bb0d3"));
var CategoryInput = object({
	id: number().int().positive().nullable(),
	parentId: number().int().positive().nullable(),
	name: string().trim().min(2).max(60),
	slug: string().trim().regex(/^[a-z0-9-]+$/).max(48),
	blurb: string().trim().max(140).optional().default(""),
	sort: number().int().min(0).max(999),
	visible: boolean()
});
var saveCategory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(CategoryInput, input)).handler(createSsrRpc("11d953476f4e92aebb38e9cec07cbff99fd5e23db55df2e60cf9320c703adfb9"));
var StockInput = object({
	storeId: number().int().positive(),
	variantId: number().int().positive(),
	qty: number().int().min(0).max(1e5),
	reason: string().trim().min(3).max(140)
});
var setStock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(StockInput, input)).handler(createSsrRpc("bf60c207099e17261d115bdaba0ab03329a2792a983b16bfbb93abe7b1902659"));
var setOrderStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	publicId: string().trim().min(4),
	status: string().trim(),
	note: string().trim().max(180).optional().default("")
}), input)).handler(createSsrRpc("ba2348f7d4cab481218c77440cc48d1527ebdfac754ef0fd1295e8553bebd83b"));
var assignPartner = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	publicId: string().min(4),
	partnerId: number().int().positive()
}), input)).handler(createSsrRpc("089b0b5c2c4ff8cd8f6833a007afa34a84a28ecdd010b973bff365c9a5f2a72d"));
var getDeskOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(string().min(4), input)).handler(createSsrRpc("397cdcff0cee8a8df946be13e9a9703468606260e9b5a04657a863572292ecf8"));
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
var saveBanner = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(BannerInput, input)).handler(createSsrRpc("8dc1e23923f6ecc205dd5760e78605d8431ae8763a6d3b15017d71fcefc2d8c5"));
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
var saveCoupon = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(CouponInput, input)).handler(createSsrRpc("030275d3d7c7850051f500d9634998ac5d708518779870f7719791590dc9bcfb"));
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
var saveStore = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(StoreInput, input)).handler(createSsrRpc("e291acf70b556f59f19095a59f716207cf4534fcaf29b508d470a223b8440408"));
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
var saveArea = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(AreaInput, input)).handler(createSsrRpc("2301b8c3b4513aff22ba9c5dd84aa4817c232423d7d0a14a66bc679f828c9621"));
var saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(array(object({
	key: string().trim().min(2).max(40),
	value: string().max(240)
})).max(20), input)).handler(createSsrRpc("8ab02745c1e5cb062b3982d227159f47cc6bbbbfe9ab648d1d1c33cfcafb9bdd"));
var setUserRoles = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	userId: string().min(1),
	roles: array(_enum(STAFF_ROLES)).max(6)
}), input)).handler(createSsrRpc("d5e7365b63984662c425a9ff84a5a706ab0184f597077ae408b470882d1a3581"));
var setTicketStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	id: number().int().positive(),
	status: _enum(["open", "closed"])
}), input)).handler(createSsrRpc("90e651e0755c257cf711440642725250b48cb7bb529f8f4d0bbca9e62b3afda6"));
var NEXT = {
	pending: ["confirmed", "cancelled"],
	confirmed: ["preparing", "cancelled"],
	preparing: ["packed", "cancelled"],
	packed: ["ready_for_pickup", "cancelled"],
	ready_for_pickup: ["cancelled"],
	assigned: ["picked_up", "cancelled"],
	picked_up: ["out_for_delivery"],
	out_for_delivery: ["delivered"],
	cancelled: ["refund_initiated"],
	refund_initiated: ["refunded"]
};
var ACTION = {
	confirmed: "Confirm",
	preparing: "Start preparing",
	packed: "Mark packed",
	ready_for_pickup: "Ready for pickup",
	picked_up: "Picked up",
	out_for_delivery: "Out for delivery",
	delivered: "Delivered",
	cancelled: "Cancel",
	refund_initiated: "Start refund",
	refunded: "Mark refunded"
};
var field = "h-11 w-full rounded-full border border-line bg-paper px-4 text-sm";
function Desk({ Chart }) {
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [section, setSection] = (0, import_react.useState)("overview");
	function load() {
		getDesk().then((desk) => {
			setData(desk);
			setError("");
		}).catch((reason) => setError(reason instanceof Error ? reason.message : "The desk could not load."));
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const sections = data ? DESK_SECTIONS.filter((item) => can(data.roles, item.roles)) : [];
	const active = sections.some((item) => item.id === section) ? section : sections[0]?.id ?? "overview";
	if (!data && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-6 text-sm text-muted",
		children: "Loading the desk…"
	});
	if (error && !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-xl font-extrabold",
			children: "Store desk"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-danger",
			children: error
		})]
	});
	if (!data) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "md:grid md:grid-cols-[220px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "flex gap-2 overflow-x-auto border-b border-line p-3 md:block md:border-r md:border-b-0 md:p-4",
			children: sections.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setSection(item.id),
				className: cn("h-10 shrink-0 rounded-full px-3 text-sm font-semibold md:mb-1 md:flex md:w-full", active === item.id ? "bg-brand text-ink" : "text-muted"),
				children: item.label
			}, item.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4 md:p-6",
			children: [
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-danger",
					children: error
				}) : null,
				active === "overview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, {
					data,
					Chart
				}) : null,
				active === "products" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Products, {
					data,
					reload: load
				}) : null,
				active === "categories" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Categories, {
					data,
					reload: load
				}) : null,
				active === "inventory" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inventory, {
					data,
					reload: load
				}) : null,
				active === "orders" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Orders, {
					data,
					reload: load
				}) : null,
				active === "customers" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Customers, {
					data,
					reload: load
				}) : null,
				active === "marketing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marketing, {
					data,
					reload: load
				}) : null,
				active === "stores" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stores, {
					data,
					reload: load
				}) : null,
				active === "delivery" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Partners, { data }) : null,
				active === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
					data,
					reload: load
				}) : null
			]
		})]
	});
}
function Overview({ data, Chart }) {
	const counts = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const category of data.categories.filter((item) => item.parentId == null && !item.archived)) {
			const ids = /* @__PURE__ */ new Set([category.id, ...data.categories.filter((item) => item.parentId === category.id).map((item) => item.id)]);
			map.set(category.name.split(",")[0].split("&")[0].trim(), data.products.filter((product) => ids.has(product.categoryId) && !product.archived).length);
		}
		return [...map.entries()].map(([name, count]) => ({
			name,
			count
		}));
	}, [data]);
	const statusCount = (status) => data.metrics.byStatus.find((row) => row.status === status)?.n ?? 0;
	const cards = [
		["Revenue", inr(data.metrics.revenuePaise)],
		["Orders", String(data.orders.length)],
		["Customers", String(data.metrics.customers)],
		["Active products", String(data.metrics.products)],
		["Low stock", String(data.metrics.lowStock)],
		["Out of stock", String(data.metrics.outOfStock)],
		["Pending", String(statusCount("pending"))],
		["Delivered", String(statusCount("delivered"))],
		["Cancelled", String(statusCount("cancelled") + statusCount("refund_initiated") + statusCount("refunded"))]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold",
			children: "Overview"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-2 gap-3 md:grid-cols-3",
			children: cards.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-line bg-cream p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-wide text-muted uppercase",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xl font-extrabold tabular-nums",
					children: value
				})]
			}, label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4 rounded-3xl border border-line bg-cream p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold",
				children: "Catalogue by aisle"
			}), Chart ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chart, { items: counts }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Loading chart…"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Recent orders"
				}),
				data.orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "No orders yet. They show up after a customer checks out."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 divide-y divide-line text-sm",
					children: data.orders.slice(0, 8).map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							order.publicId,
							" · ",
							order.name
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: [
								STATUS_LABEL[order.status] ?? order.status,
								" · ",
								inr(order.payablePaise)
							]
						})]
					}, order.publicId))
				})
			]
		})
	] });
}
function Products({ data, reload }) {
	const blank = {
		id: null,
		categoryId: data.categories[0]?.id ?? 1,
		brand: "Mehra",
		name: "",
		description: "",
		featured: false,
		bestseller: false,
		active: true,
		variantId: null,
		pack: "1 pc",
		sku: "",
		mrp: "",
		price: "",
		unit: "1 pc",
		weight: "0",
		tax: "0",
		opening: "12"
	};
	const [form, setForm] = (0, import_react.useState)(blank);
	const [image, setImage] = (0, import_react.useState)(null);
	function edit(id) {
		const product = data.products.find((item) => item.id === id);
		const variant = product?.variants[0];
		if (!product || !variant) return;
		setForm({
			id: product.id,
			categoryId: product.categoryId,
			brand: product.brand,
			name: product.name,
			description: product.description,
			featured: product.featured,
			bestseller: product.bestseller,
			active: product.active,
			variantId: variant.id,
			pack: variant.name,
			sku: variant.sku,
			mrp: String(variant.mrpPaise / 100),
			price: String(variant.pricePaise / 100),
			unit: variant.unit,
			weight: String(variant.weightG),
			tax: String(variant.taxBps),
			opening: "12"
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold",
			children: "Products"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-2 rounded-3xl border border-line bg-cream p-4 md:grid-cols-2",
			onSubmit: (event) => {
				event.preventDefault();
				saveProduct({ data: {
					id: form.id,
					categoryId: form.categoryId,
					brand: form.brand,
					name: form.name,
					description: form.description,
					featured: form.featured,
					bestseller: form.bestseller,
					active: form.active,
					imageDataUrl: image,
					variant: {
						id: form.variantId,
						name: form.pack,
						sku: form.sku,
						barcode: form.sku,
						mrpPaise: Math.round(Number(form.mrp) * 100),
						pricePaise: Math.round(Number(form.price) * 100),
						unit: form.unit,
						weightG: Number(form.weight) || 0,
						taxBps: Number(form.tax) || 0,
						openingQty: Number(form.opening) || 0
					}
				} }).then(() => {
					toast.success("Product saved");
					setForm(blank);
					setImage(null);
					reload();
				}).catch((reason) => toast.error(reason instanceof Error ? reason.message : "Could not save."));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "Name",
					value: form.name,
					onChange: (event) => setForm({
						...form,
						name: event.target.value
					}),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "Brand",
					value: form.brand,
					onChange: (event) => setForm({
						...form,
						brand: event.target.value
					}),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: field,
					value: form.categoryId,
					onChange: (event) => setForm({
						...form,
						categoryId: Number(event.target.value)
					}),
					"aria-label": "Category",
					children: data.categories.filter((item) => !item.archived).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: item.id,
						children: item.name
					}, item.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "SKU",
					value: form.sku,
					onChange: (event) => setForm({
						...form,
						sku: event.target.value
					}),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "Pack",
					value: form.pack,
					onChange: (event) => setForm({
						...form,
						pack: event.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "Unit label",
					value: form.unit,
					onChange: (event) => setForm({
						...form,
						unit: event.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "MRP rupees",
					value: form.mrp,
					onChange: (event) => setForm({
						...form,
						mrp: event.target.value
					}),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "Price rupees",
					value: form.price,
					onChange: (event) => setForm({
						...form,
						price: event.target.value
					}),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "rounded-3xl border border-line bg-paper p-3 text-sm md:col-span-2",
					placeholder: "Description",
					value: form.description,
					onChange: (event) => setForm({
						...form,
						description: event.target.value
					}),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: form.featured,
						onChange: (event) => setForm({
							...form,
							featured: event.target.checked
						})
					}), " Featured"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: form.bestseller,
						onChange: (event) => setForm({
							...form,
							bestseller: event.target.checked
						})
					}), " Bestseller"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm md:col-span-2",
					children: ["Image", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: "image/*",
						className: "mt-1 block text-sm",
						onChange: (event) => {
							const file = event.target.files?.[0];
							if (!file) return;
							if (file.size > 14e4) {
								toast.error("Use an image under 140 KB.");
								return;
							}
							const reader = new FileReader();
							reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : null);
							reader.readAsDataURL(file);
						}
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "h-11 rounded-full bg-brand font-bold md:col-span-2",
					type: "submit",
					children: form.id ? "Update product" : "Create product"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 divide-y divide-line text-sm",
			children: data.products.filter((product) => !product.archived).map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between gap-2 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					product.brand,
					" ",
					product.name,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-muted",
						children: product.variants.map((variant) => variant.sku).join(", ")
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "font-semibold",
						onClick: () => edit(product.id),
						children: "Edit"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "font-semibold text-danger",
						onClick: () => archiveProduct({ data: product.id }).then(() => {
							toast.success("Archived");
							reload();
						}),
						children: "Archive"
					})]
				})]
			}, product.id))
		})
	] });
}
function Categories({ data, reload }) {
	const [name, setName] = (0, import_react.useState)("");
	const [slug, setSlug] = (0, import_react.useState)("");
	const [parentId, setParentId] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold",
			children: "Categories"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-2 md:grid-cols-3",
			onSubmit: (event) => {
				event.preventDefault();
				saveCategory({ data: {
					id: null,
					parentId,
					name,
					slug,
					blurb: "",
					sort: data.categories.length + 1,
					visible: true
				} }).then(() => {
					toast.success("Category saved");
					setName("");
					setSlug("");
					reload();
				}).catch((reason) => toast.error(reason instanceof Error ? reason.message : "Could not save."));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "Name",
					value: name,
					onChange: (event) => setName(event.target.value),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "slug-like-this",
					value: slug,
					onChange: (event) => setSlug(event.target.value),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: field,
					value: parentId ?? "",
					onChange: (event) => setParentId(event.target.value ? Number(event.target.value) : null),
					"aria-label": "Parent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Top level"
					}), data.categories.filter((item) => item.parentId == null).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: item.id,
						children: item.name
					}, item.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "h-11 rounded-full bg-brand font-bold",
					type: "submit",
					children: "Add category"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-1 text-sm",
			children: data.categories.filter((item) => !item.archived).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex justify-between border-b border-line py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [item.parentId ? "— " : "", item.name] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "font-semibold",
					onClick: () => saveCategory({ data: {
						id: item.id,
						parentId: item.parentId,
						name: item.name,
						slug: item.slug,
						blurb: item.blurb,
						sort: item.sort,
						visible: !item.visible
					} }).then(reload),
					children: item.visible ? "Hide" : "Show"
				})]
			}, item.id))
		})
	] });
}
function Inventory({ data, reload }) {
	const variants = data.products.flatMap((product) => product.variants.map((variant) => ({
		...variant,
		product: product.name
	})));
	const [storeId, setStoreId] = (0, import_react.useState)(data.stores[0]?.id ?? 1);
	const [variantId, setVariantId] = (0, import_react.useState)(variants[0]?.id ?? 1);
	const [qty, setQty] = (0, import_react.useState)("12");
	const [reason, setReason] = (0, import_react.useState)("Cycle count");
	const rows = data.inventory.filter((row) => row.qty <= row.lowAt);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold",
			children: "Inventory"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-2 md:grid-cols-2",
			onSubmit: (event) => {
				event.preventDefault();
				setStock({ data: {
					storeId,
					variantId,
					qty: Number(qty),
					reason
				} }).then(() => {
					toast.success("Stock updated");
					reload();
				}).catch((err) => toast.error(err instanceof Error ? err.message : "Could not update."));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: field,
					value: storeId,
					onChange: (event) => setStoreId(Number(event.target.value)),
					"aria-label": "Store",
					children: data.stores.map((store) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: store.id,
						children: store.name
					}, store.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: field,
					value: variantId,
					onChange: (event) => setVariantId(Number(event.target.value)),
					"aria-label": "Variant",
					children: variants.map((variant) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: variant.id,
						children: [
							variant.product,
							" · ",
							variant.sku
						]
					}, variant.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					value: qty,
					onChange: (event) => setQty(event.target.value),
					inputMode: "numeric",
					"aria-label": "Quantity"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					value: reason,
					onChange: (event) => setReason(event.target.value),
					"aria-label": "Reason"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "h-11 rounded-full bg-brand font-bold",
					type: "submit",
					children: "Set stock"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-6 font-semibold",
			children: "Low and out of stock"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-2 text-sm",
			children: [rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-muted",
				children: "All counted lines are above their threshold."
			}) : null, rows.map((row) => {
				const variant = variants.find((item) => item.id === row.variantId);
				const store = data.stores.find((item) => item.id === row.storeId);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between border-b border-line py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						variant?.product,
						" · ",
						store?.code
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums font-semibold",
						children: row.qty
					})]
				}, row.id);
			})]
		})
	] });
}
function Orders({ data, reload }) {
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [partnerId, setPartnerId] = (0, import_react.useState)(data.partners[0]?.id ?? 0);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const orders = data.orders.filter((order) => (filter === "all" || order.status === filter) && `${order.publicId} ${order.name}`.toLowerCase().includes(query.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold",
			children: "Orders"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: field,
				placeholder: "Search id or name",
				value: query,
				onChange: (event) => setQuery(event.target.value)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				className: field,
				value: filter,
				onChange: (event) => setFilter(event.target.value),
				"aria-label": "Status",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "all",
					children: "All"
				}), Object.keys(STATUS_LABEL).map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: status,
					children: STATUS_LABEL[status]
				}, status))]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 divide-y divide-line text-sm",
			children: orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "flex w-full justify-between py-2 text-left",
				onClick: () => getDeskOrder({ data: order.publicId }).then(setSelected).catch((err) => toast.error(err instanceof Error ? err.message : "Could not open.")),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					order.publicId,
					" · ",
					order.name
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					STATUS_LABEL[order.status] ?? order.status,
					" · ",
					inr(order.payablePaise)
				] })]
			}) }, order.publicId))
		}),
		selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4 rounded-3xl border border-line bg-cream p-4 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-extrabold",
					children: selected.publicId
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					STATUS_LABEL[selected.status],
					" · ",
					selected.paymentMethod,
					" · ",
					selected.payment?.status
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1",
					children: [
						String(selected.address.line1 ?? ""),
						", ",
						String(selected.address.area ?? ""),
						" ",
						String(selected.address.pincode ?? "")
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2",
					children: selected.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						item.name,
						" × ",
						item.qty
					] }, item.name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-bold tabular-nums",
					children: inr(selected.payablePaise)
				}),
				selected.otp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1",
					children: ["Delivery code ", selected.otp]
				}) : null,
				selected.refund ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Refund ",
					selected.refund.status,
					" · ",
					inr(selected.refund.amountPaise)
				] }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: (NEXT[selected.status] ?? []).map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-10 rounded-full bg-brand px-3 font-semibold",
						onClick: () => setOrderStatus({ data: {
							publicId: selected.publicId,
							status,
							note: ""
						} }).then(() => {
							toast.success("Updated");
							reload();
							return getDeskOrder({ data: selected.publicId });
						}).then(setSelected),
						children: ACTION[status] ?? status
					}, status))
				}),
				selected.status === "ready_for_pickup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: field,
						value: partnerId,
						onChange: (event) => setPartnerId(Number(event.target.value)),
						"aria-label": "Partner",
						children: data.partners.filter((partner) => partner.active).map((partner) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: partner.id,
							children: [partner.name, partner.available ? " · available" : ""]
						}, partner.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-11 shrink-0 rounded-full bg-ink px-4 font-semibold text-cream",
						onClick: () => assignPartner({ data: {
							publicId: selected.publicId,
							partnerId
						} }).then(() => {
							toast.success("Assigned");
							reload();
							return getDeskOrder({ data: selected.publicId });
						}).then(setSelected),
						children: "Assign"
					})]
				}) : null
			]
		}) : null
	] });
}
function Customers({ data, reload }) {
	const superAdmin = data.roles.includes("super_admin");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "text-2xl font-extrabold",
		children: "Customers"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-4 space-y-3 text-sm",
		children: data.customers.map((customer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "rounded-3xl border border-line bg-cream p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: customer.name || "Customer"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted",
					children: [
						customer.email,
						" · ",
						customer.phone || "No mobile",
						" · ",
						customer.orders,
						" orders"
					]
				}),
				superAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: STAFF_ROLES.map((role) => {
						const on = customer.roles.includes(role);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: cn("rounded-full px-2 py-1 text-xs font-semibold", on ? "bg-brand" : "border border-line"),
							onClick: () => {
								const roles = on ? customer.roles.filter((item) => item !== role) : [...customer.roles, role];
								setUserRoles({ data: {
									userId: customer.userId,
									roles: roles.filter((item) => STAFF_ROLES.includes(item))
								} }).then(() => {
									toast.success("Roles updated");
									reload();
								}).catch((err) => toast.error(err instanceof Error ? err.message : "Could not update roles."));
							},
							children: ROLE_LABEL[role]
						}, role);
					})
				}) : null
			]
		}, customer.userId))
	})] });
}
function Marketing({ data, reload }) {
	const [title, setTitle] = (0, import_react.useState)("");
	const [subtitle, setSubtitle] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-extrabold",
				children: "Marketing"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2 md:grid-cols-2",
				onSubmit: (event) => {
					event.preventDefault();
					saveBanner({ data: {
						id: null,
						title,
						subtitle,
						tone: "brand",
						href: "/",
						sort: data.banners.length + 1,
						active: true
					} }).then(() => {
						toast.success("Banner added");
						reload();
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: field,
						placeholder: "Banner title",
						value: title,
						onChange: (event) => setTitle(event.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: field,
						placeholder: "Subtitle",
						value: subtitle,
						onChange: (event) => setSubtitle(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "h-11 rounded-full bg-brand font-bold",
						type: "submit",
						children: "Add banner"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "text-sm",
				children: data.banners.map((banner) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between border-b border-line py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: banner.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "font-semibold",
						onClick: () => saveBanner({ data: {
							...banner,
							active: !banner.active
						} }).then(reload),
						children: banner.active ? "Hide" : "Show"
					})]
				}, banner.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2 md:grid-cols-2",
				onSubmit: (event) => {
					event.preventDefault();
					saveCoupon({ data: {
						id: null,
						code,
						description,
						kind: "flat",
						amount: 5e3,
						maxDiscountPaise: 5e3,
						minSubtotalPaise: 19900,
						active: true
					} }).then(() => {
						toast.success("Coupon added");
						reload();
					}).catch((err) => toast.error(err instanceof Error ? err.message : "Could not save."));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: field,
						placeholder: "CODE",
						value: code,
						onChange: (event) => setCode(event.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: field,
						placeholder: "Description",
						value: description,
						onChange: (event) => setDescription(event.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "h-11 rounded-full bg-ink font-semibold text-cream",
						type: "submit",
						children: "Add Rs 50 coupon"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "text-sm",
				children: data.coupons.map((coupon) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "border-b border-line py-2",
					children: [
						coupon.code,
						" · ",
						coupon.description
					]
				}, coupon.id))
			})
		]
	});
}
function Stores({ data, reload }) {
	const [area, setArea] = (0, import_react.useState)({
		name: "",
		city: "Bengaluru",
		pincode: "",
		lat: "12.97",
		lng: "77.64",
		storeId: data.stores[0]?.id ?? 1
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold",
			children: "Stores and serviceability"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-3 text-sm",
			children: data.stores.map((store) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-3xl border border-line bg-cream p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: store.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted",
						children: [
							store.address,
							", ",
							store.city,
							" ",
							store.pincode
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Radius ",
						store.radiusKm,
						" km · ",
						store.opens,
						"–",
						store.closes,
						" · fee ",
						inr(store.deliveryFeePaise),
						" · free over ",
						inr(store.freeAbovePaise)
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-2 font-semibold",
						onClick: () => saveStore({ data: {
							...store,
							active: !store.active
						} }).then(reload),
						children: store.active ? "Pause store" : "Reopen store"
					})
				]
			}, store.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-6 font-semibold",
			children: "Areas"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 text-sm",
			children: data.areas.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "border-b border-line py-2",
				children: [
					item.name,
					" · ",
					item.city,
					" · ",
					item.pincode
				]
			}, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-2 md:grid-cols-3",
			onSubmit: (event) => {
				event.preventDefault();
				saveArea({ data: {
					id: null,
					name: area.name,
					city: area.city,
					pincode: area.pincode,
					lat: Number(area.lat),
					lng: Number(area.lng),
					storeId: area.storeId,
					active: true
				} }).then(() => {
					toast.success("Area added");
					reload();
				}).catch((err) => toast.error(err instanceof Error ? err.message : "Could not add the area."));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "Area",
					value: area.name,
					onChange: (event) => setArea({
						...area,
						name: event.target.value
					}),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "City",
					value: area.city,
					onChange: (event) => setArea({
						...area,
						city: event.target.value
					}),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "Pincode",
					value: area.pincode,
					onChange: (event) => setArea({
						...area,
						pincode: event.target.value
					}),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "Lat",
					value: area.lat,
					onChange: (event) => setArea({
						...area,
						lat: event.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: field,
					placeholder: "Lng",
					value: area.lng,
					onChange: (event) => setArea({
						...area,
						lng: event.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: field,
					value: area.storeId,
					onChange: (event) => setArea({
						...area,
						storeId: Number(event.target.value)
					}),
					"aria-label": "Store",
					children: data.stores.map((store) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: store.id,
						children: store.name
					}, store.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "h-11 rounded-full bg-brand font-bold",
					type: "submit",
					children: "Add pincode"
				})
			]
		})
	] });
}
function Partners({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold",
			children: "Delivery partners"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Assignment is manual. Live GPS is whatever the partner last shared from their phone. Automatic dispatch is not connected."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-2 text-sm",
			children: data.partners.map((partner) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex justify-between rounded-2xl border border-line px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					partner.name,
					" · ",
					partner.vehicle
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [partner.available ? "Available" : "Offline", partner.active ? "" : " · inactive"] })]
			}, partner.id))
		})
	] });
}
function Settings({ data, reload }) {
	const [rows, setRows] = (0, import_react.useState)(data.settings);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold",
			children: "Settings"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 space-y-2",
			onSubmit: (event) => {
				event.preventDefault();
				saveSettings({ data: rows }).then(() => {
					toast.success("Saved");
					reload();
				}).catch((err) => toast.error(err instanceof Error ? err.message : "Could not save."));
			},
			children: [rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm font-semibold",
				children: [row.key, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: `${field} mt-1 font-normal`,
					value: row.value,
					onChange: (event) => setRows(rows.map((item, i) => i === index ? {
						...item,
						value: event.target.value
					} : item))
				})]
			}, row.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "h-11 rounded-full bg-brand px-5 font-bold",
				type: "submit",
				children: "Save settings"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 rounded-3xl border border-line bg-cream p-4 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Integrations"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2",
					children: [
						"Payments: Razorpay sandbox is ",
						data.razorpayConfigured ? "configured" : "not configured",
						". Cash on delivery is the live tender. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the server to capture real sandbox payments. No charge is simulated."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2",
					children: "Maps: service pins are MehraIT areas. Turn-by-turn opens Google Maps with the saved coordinates. Map tiles are not proxied."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2",
					children: "Notifications: in-app alerts are stored per customer. Web push is not configured."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2",
					children: "Tracking: partners can publish a GPS fix. Automatic dispatch is not enabled."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold",
				children: "Support tickets"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-2 space-y-2 text-sm",
				children: [data.tickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-muted",
					children: "No tickets."
				}) : null, data.tickets.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-2xl border border-line p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-semibold",
							children: [
								ticket.subject,
								" · ",
								ticket.name
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: ticket.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-1 font-semibold",
							onClick: () => setTicketStatus({ data: {
								id: ticket.id,
								status: ticket.status === "open" ? "closed" : "open"
							} }).then(reload),
							children: ticket.status === "open" ? "Close" : "Reopen"
						})
					]
				}, ticket.id))]
			})]
		}),
		data.audits.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold",
				children: "Audit"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 text-sm text-muted",
				children: data.audits.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					row.action,
					" · ",
					row.entity,
					" ",
					row.entityId
				] }, index))
			})]
		}) : null
	] });
}
function AdminPage() {
	const { user, isPending } = useCurrentUserState();
	const [Chart, setChart] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		import("./desk-chart-BsBn3nCx.mjs").then((mod) => setChart(() => mod.DeskChart));
	}, []);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-6 text-sm text-muted",
		children: "Opening the store desk…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between border-b border-line px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "flex items-center gap-2 font-extrabold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/brand/icon-192.png",
					alt: "",
					className: "h-10 w-10 rounded-xl"
				}), "Store desk"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/account",
				className: "text-sm font-semibold",
				children: "Account"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Desk, { Chart })]
	});
}
//#endregion
export { AdminPage as component };
