import { n as inr, r as quoteCart } from "./pricing-DaB8c9_f.mjs";
import { T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as useCart, n as Shell, r as SkeletonRows, t as EmptyState, x as usePlace } from "./shell-D2L_H36Z.mjs";
import { a as useCatalog, i as stockAt } from "./use-catalog-s9v4_ydO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart-C6PCRPY5.js
var import_jsx_runtime = require_jsx_runtime();
function CartPage() {
	const { catalog, loading } = useCatalog();
	const lines = useCart((state) => state.lines);
	const setQty = useCart((state) => state.setQty);
	const couponCode = useCart((state) => state.coupon);
	const setCoupon = useCart((state) => state.setCoupon);
	const place = usePlace();
	const store = catalog?.stores.find((item) => item.id === place.storeId) ?? catalog?.stores[0];
	const resolved = !catalog ? [] : lines.flatMap((line) => {
		for (const product of catalog.products) {
			const variant = product.variants.find((item) => item.id === line.variantId);
			if (!variant) continue;
			return [{
				variantId: variant.id,
				productId: product.id,
				name: product.name,
				brand: product.brand,
				sku: variant.sku,
				unit: variant.unit,
				qty: line.qty,
				mrpPaise: variant.mrpPaise,
				pricePaise: variant.pricePaise,
				taxBps: variant.taxBps,
				stock: stockAt(product, variant.id, place.storeId)
			}];
		}
		return [];
	});
	const coupon = catalog?.coupons.find((item) => item.code === couponCode.trim().toUpperCase()) ?? null;
	const quote = store ? quoteCart({
		lines: resolved,
		coupon: couponCode ? coupon : null,
		deliveryFeePaise: store.deliveryFeePaise,
		freeAbovePaise: store.freeAbovePaise
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold tracking-tight",
			children: "Cart"
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonRows, {})
		}) : null,
		!loading && resolved.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Your cart is empty",
				body: "Add milk, fruit or whatever is missing at home.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "inline-flex h-11 items-center rounded-full bg-brand px-4 font-semibold",
					children: "Browse the store"
				})
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-3",
			children: resolved.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between gap-3 rounded-3xl border border-line bg-cream p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: line.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							line.unit,
							" · ",
							inr(line.pricePaise)
						]
					}),
					line.qty > line.stock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-semibold text-danger",
						children: [
							"Only ",
							line.stock,
							" in stock here"
						]
					}) : null
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-10 items-center rounded-full bg-brand",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid h-10 w-9 place-items-center font-bold",
							onClick: () => setQty(line.variantId, line.qty - 1),
							"aria-label": "Decrease",
							children: "−"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-5 text-center text-sm font-bold tabular-nums",
							children: line.qty
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid h-10 w-9 place-items-center font-bold",
							onClick: () => setQty(line.variantId, Math.min(line.stock, line.qty + 1)),
							"aria-label": "Increase",
							children: "+"
						})
					]
				})]
			}, line.variantId))
		}),
		quote && resolved.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4 rounded-3xl border border-line bg-cream p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "text-sm font-semibold",
					htmlFor: "coupon",
					children: "Coupon"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "coupon",
					value: couponCode,
					onChange: (event) => setCoupon(event.target.value),
					placeholder: "MEHRA50",
					className: "mt-2 h-11 w-full rounded-full border border-line bg-paper px-4 uppercase"
				}),
				couponCode && !coupon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-danger",
					children: "That code is not active."
				}) : null,
				quote.couponError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-danger",
					children: quote.couponError
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-4 space-y-1 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Item total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "tabular-nums",
								children: inr(quote.subtotalPaise)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Discount" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "tabular-nums",
								children: ["− ", inr(quote.discountPaise)]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Delivery" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "tabular-nums",
								children: quote.deliveryPaise === 0 ? "Free" : inr(quote.deliveryPaise)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "GST included" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "tabular-nums",
								children: inr(quote.taxPaise)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between pt-2 text-base font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "To pay" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "tabular-nums",
								children: inr(quote.payablePaise)
							})]
						})
					]
				}),
				!place.serviceable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-danger",
					children: "Choose a serviceable address before checkout."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/checkout",
					className: "mt-4 flex h-12 items-center justify-center rounded-full bg-ink font-semibold text-cream",
					children: "Checkout"
				})
			]
		}) : null
	] });
}
//#endregion
export { CartPage as component };
