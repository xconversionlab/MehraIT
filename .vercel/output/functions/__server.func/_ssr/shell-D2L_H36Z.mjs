import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime, m as useRouterState, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { c as Search, g as House, m as LayoutGrid, r as UserRound, s as ShoppingBag } from "../_libs/lucide-react.mjs";
import { t as useCurrentUser } from "./use-current-user-B7Cbrtsy.mjs";
import { t as authMiddleware } from "./middleware-BBXSmM46.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-D2L_H36Z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function parse(schema, input) {
	const result = schema.safeParse(input);
	if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Check that form and try again.");
	return result.data;
}
var phone = string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number.");
var getMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("d455ff65e403380b120115f7a9e43526d041dfe0e9526a2817631f06977b8264"));
var updateProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	fullName: string().trim().min(2).max(80),
	phone
}), input)).handler(createSsrRpc("456d046ac6888366780c1b9811c7d99cbf7dc4a9d028c648d517e0fa4494b5bd"));
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
var listAddresses = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4a4eab4c58aa9af6e0595b2c816f123619d1726dc16402894af7ed2a0122151d"));
var saveAddress = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(AddressInput, input)).handler(createSsrRpc("aa46bc9f9c800b7a4db3861c27a8cd4e62af14b1dbe2167d6c97de6bb61d240a"));
var deleteAddress = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(number().int().positive(), input)).handler(createSsrRpc("390cd81c01fbe492ba432e85be4e9da2400267121c3d8c6e61afae802ce62548"));
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
var placeOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(PlaceInput, input)).handler(createSsrRpc("f834079e357c30ac4bb680bac6e4d3d7c7620f9ea4bc2be1fd1f60b051f32760"));
var startOnlinePayment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return parse(PlaceInput, {
		...typeof input === "object" && input ? input : {},
		paymentMethod: "online"
	});
}).handler(createSsrRpc("3bcbc3e81f7a6e22db875159c75767aad99ddd5d31cabc33cad511ce915b4137"));
var confirmOnlinePayment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	publicId: string().trim().min(4),
	gatewayOrderId: string().trim().min(4),
	gatewayPaymentId: string().trim().min(4),
	signature: string().trim().min(8)
}), input)).handler(createSsrRpc("4c383c24f6c024dcb2a6d27420bedac401e3e920aa8df91239d5f09b30066efe"));
var listOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("36c11b1176a9684a93f9a51efa0cbd9e339703a153b63ec75c97b8f8e46a5d1e"));
var getOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(string().trim().min(4).max(20), input)).handler(createSsrRpc("ff5ad80bfabed4f0bf584b4ed5fb6b6bf48036623e8fbc12e0bf4a279789a951"));
var cancelOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	publicId: string().trim().min(4),
	reason: string().trim().min(3).max(180)
}), input)).handler(createSsrRpc("bdd62f634cbfd1d9a5dfc4db33f25e381906d2aab236646cf7ba2ab15ca11ec1"));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4a940c1ec5b24eb81c0f8fc032b0b9e668892a008e7eece25339bc044591d0e6"));
var markNotificationsRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("800b799bc4bb3b3d7e0179f4b65c8fdb272b368a8f078c1955a6df9118412b3d"));
var createTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	subject: string().trim().min(3).max(120),
	body: string().trim().min(8).max(1e3),
	orderPublicId: string().trim().max(20).optional().default("")
}), input)).handler(createSsrRpc("f3b667f67dbed0a6d5fd1ff5870695b3b17ec01e7f4d3fd88fada50d70d52b6d"));
var listTickets = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("7d838e49b4f32843195c50823915772b5963a7c3195eaa255f86ab02b124f4dc"));
var createReview = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	publicId: string().trim().min(4),
	productId: number().int().positive(),
	rating: number().int().min(1).max(5),
	body: string().trim().max(500).optional().default("")
}), input)).handler(createSsrRpc("9ca57d2423110d6778c5f7a5583f6a249523d292254d9dbba3510b082fecb91f"));
var pullCart = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("184cbcd381bc53821a012076a235c0b3f9b2aa1609f469728332f2b011537815"));
var syncCart = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(array(Line).max(40), input)).handler(createSsrRpc("fa94fc20237b3fa56acb3fd1dc05fdd0175b0bbedfb675f8b388e0d6d3d3db98"));
var useCart = create()(persist((set) => ({
	lines: [],
	coupon: "",
	introSeen: false,
	add: (variantId, qty = 1) => set((state) => {
		return { lines: state.lines.find((line) => line.variantId === variantId) ? state.lines.map((line) => line.variantId === variantId ? {
			...line,
			qty: Math.min(20, line.qty + qty)
		} : line) : [...state.lines, {
			variantId,
			qty
		}] };
	}),
	setQty: (variantId, qty) => set((state) => ({ lines: qty <= 0 ? state.lines.filter((line) => line.variantId !== variantId) : state.lines.map((line) => line.variantId === variantId ? {
		...line,
		qty
	} : line) })),
	setCoupon: (coupon) => set({ coupon: coupon.toUpperCase() }),
	setLines: (lines) => set({ lines }),
	clear: () => set({
		lines: [],
		coupon: ""
	}),
	dismissIntro: () => set({ introSeen: true })
}), {
	name: "mehrait-cart",
	skipHydration: true
}));
var usePlace = create()(persist((set) => ({
	areaId: 1,
	storeId: 1,
	label: "Indiranagar",
	city: "Bengaluru",
	pincode: "560038",
	serviceable: true,
	lat: 12.9784,
	lng: 77.6408,
	setPlace: (place) => set(place)
}), {
	name: "mehrait-place",
	skipHydration: true
}));
var NAV = [
	{
		to: "/",
		label: "Home",
		icon: House,
		exact: true
	},
	{
		to: "/categories",
		label: "Categories",
		icon: LayoutGrid,
		exact: false
	},
	{
		to: "/search",
		label: "Search",
		icon: Search,
		exact: false
	},
	{
		to: "/cart",
		label: "Cart",
		icon: ShoppingBag,
		exact: false
	},
	{
		to: "/account",
		label: "Account",
		icon: UserRound,
		exact: false
	}
];
function Shell({ children }) {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const lines = useCart((state) => state.lines);
	const setLines = useCart((state) => state.setLines);
	const user = useCurrentUser();
	const pulled = (0, import_react.useRef)(false);
	const count = lines.reduce((sum, line) => sum + line.qty, 0);
	(0, import_react.useEffect)(() => {
		Promise.all([useCart.persist.rehydrate(), usePlace.persist.rehydrate()]);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		if (lines.length === 0 && !pulled.current) {
			pulled.current = true;
			pullCart().then((rows) => {
				if (rows.length) setLines(rows);
			}).catch(() => void 0);
			return;
		}
		const timer = window.setTimeout(() => {
			syncCart({ data: lines }).catch(() => void 0);
		}, 500);
		return () => window.clearTimeout(timer);
	}, [
		lines,
		setLines,
		user
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-24 md:pb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center gap-3 px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/brand/icon-192.png",
								alt: "",
								className: "h-11 w-11 rounded-2xl object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-lg leading-none font-extrabold tracking-tight",
								children: ["MEHRA", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-0.5 rounded-md bg-brand px-1 py-0.5",
									children: "IT"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/search",
							className: "ml-auto hidden h-11 min-w-0 flex-1 items-center rounded-full border border-line bg-cream px-4 text-sm text-muted md:flex",
							children: "Search milk, atta, bananas"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/cart",
							className: "relative ml-auto grid h-11 w-11 place-items-center rounded-full border border-line bg-cream md:ml-0",
							"aria-label": "Cart",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-5" }), count > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-bold text-ink tabular-nums",
								children: count
							}) : null]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-6xl px-4 py-4",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream md:hidden",
				"aria-label": "Primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid grid-cols-5",
					children: NAV.map((item) => {
						const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-16 flex-col items-center justify-center gap-1 text-xs", active ? "font-semibold text-ink" : "text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("grid h-8 w-10 place-items-center rounded-full", active && "bg-brand"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
							}), item.label]
						}) }, item.to);
					})
				})
			})
		]
	});
}
function EmptyState({ title, body, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl border border-dashed border-line bg-cream px-6 py-12 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-2 max-w-sm text-sm text-muted",
				children: body
			}),
			action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: action
			}) : null
		]
	});
}
function SkeletonRows() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 md:grid-cols-4",
		children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-56 animate-pulse rounded-3xl bg-line/70" }, index))
	});
}
//#endregion
export { saveAddress as _, confirmOnlinePayment as a, useCart as b, deleteAddress as c, listAddresses as d, listNotifications as f, placeOrder as g, markNotificationsRead as h, cancelOrder as i, getMe as l, listTickets as m, Shell as n, createReview as o, listOrders as p, SkeletonRows as r, createTicket as s, EmptyState as t, getOrder as u, startOnlinePayment as v, usePlace as x, updateProfile as y };
