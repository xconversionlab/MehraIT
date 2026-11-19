import { n as inr, t as discountPercent } from "./pricing-DaB8c9_f.mjs";
import { T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { b as useCart } from "./shell-D2L_H36Z.mjs";
import { i as stockAt } from "./use-catalog-s9v4_ydO.mjs";
import { t as CategoryGlyph } from "./icons-DGeKNi1_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/product-card-DFVPpEak.js
var import_jsx_runtime = require_jsx_runtime();
function ProductCard({ product, slug, storeId }) {
	const variant = product.variants[0];
	const lines = useCart((state) => state.lines);
	const add = useCart((state) => state.add);
	const setQty = useCart((state) => state.setQty);
	if (!variant) return null;
	const stock = stockAt(product, variant.id, storeId);
	const inCart = lines.find((line) => line.variantId === variant.id)?.qty ?? 0;
	const off = discountPercent(variant.mrpPaise, variant.pricePaise);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex w-40 shrink-0 snap-start flex-col rounded-3xl border border-line bg-cream p-2.5 sm:w-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/p/$id",
				params: { id: String(product.id) },
				className: "block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid aspect-square place-items-center overflow-hidden rounded-2xl bg-brand/40",
						children: product.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: product.imageUrl,
							alt: "",
							className: "h-full w-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
							slug,
							className: "size-10 text-ink"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs font-semibold tracking-wide text-muted uppercase",
						children: product.brand
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-ink",
						children: product.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: variant.unit
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-end justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold tabular-nums",
					children: inr(variant.pricePaise)
				}), off > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "line-through tabular-nums",
						children: inr(variant.mrpPaise)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-1 font-semibold text-ink",
						children: [off, "% off"]
					})]
				}) : null] }), stock <= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-semibold text-danger",
					children: "Out"
				}) : inCart > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-9 items-center rounded-full bg-brand text-ink",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid h-9 w-8 place-items-center font-bold",
							onClick: () => setQty(variant.id, inCart - 1),
							"aria-label": "Decrease quantity",
							children: "−"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-4 text-center text-sm font-bold tabular-nums",
							children: inCart
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid h-9 w-8 place-items-center font-bold disabled:opacity-40",
							disabled: inCart >= stock,
							onClick: () => setQty(variant.id, inCart + 1),
							"aria-label": "Increase quantity",
							children: "+"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: cn("h-9 rounded-full bg-brand px-3 text-sm font-bold text-ink active:scale-95"),
					onClick: () => {
						add(variant.id, 1);
						toast.success(`${product.name} added`);
					},
					children: "Add"
				})]
			}),
			stock > 0 && stock <= 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs font-medium text-ink",
				children: [
					"Only ",
					stock,
					" left"
				]
			}) : null
		]
	});
}
//#endregion
export { ProductCard as t };
