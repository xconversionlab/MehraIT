import { o as __toESM } from "./_runtime.mjs";
import { n as inr, t as discountPercent } from "./_ssr/pricing-DaB8c9_f.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Route$1 } from "./_ssr/router-CZrSzEs0.mjs";
import { b as useCart, n as Shell, r as SkeletonRows, x as usePlace } from "./_ssr/shell-D2L_H36Z.mjs";
import { a as useCatalog, i as stockAt, r as rootCategory, t as listProductReviews } from "./_ssr/use-catalog-s9v4_ydO.mjs";
import { t as CategoryGlyph } from "./_ssr/icons-DGeKNi1_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-DRU6iKIV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductPage() {
	const { id } = Route$1.useParams();
	const { catalog, loading, error } = useCatalog();
	const storeId = usePlace((state) => state.storeId);
	const add = useCart((state) => state.add);
	const product = catalog?.products.find((item) => item.id === Number(id));
	const [variantId, setVariantId] = (0, import_react.useState)(null);
	const [reviews, setReviews] = (0, import_react.useState)([]);
	const variant = product?.variants.find((item) => item.id === (variantId ?? product.variants[0]?.id));
	const slug = product && catalog ? rootCategory(catalog.categories, product.categoryId)?.slug ?? "snacks" : "snacks";
	const stock = product && variant ? stockAt(product, variant.id, storeId) : 0;
	(0, import_react.useEffect)(() => {
		if (!product) return;
		listProductReviews({ data: product.id }).then(setReviews).catch(() => setReviews([]));
	}, [product?.id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		loading || !catalog ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonRows, {}) : null,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-danger",
			children: error
		}) : null,
		catalog && !product ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["This product is not on the shelf. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "font-semibold",
			children: "Back home"
		})] }) : null,
		product && variant ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid aspect-square place-items-center rounded-3xl bg-brand/40",
				children: product.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: product.imageUrl,
					alt: "",
					className: "h-full w-full rounded-3xl object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
					slug,
					className: "size-16"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-wide text-muted uppercase",
					children: product.brand
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-3xl font-extrabold tracking-tight",
					children: product.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: product.description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: product.variants.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setVariantId(item.id),
						className: `h-10 rounded-full px-3 text-sm font-semibold ${item.id === variant.id ? "bg-ink text-cream" : "border border-line bg-cream"}`,
						children: item.name
					}, item.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-2xl font-extrabold tabular-nums",
					children: inr(variant.pricePaise)
				}),
				discountPercent(variant.mrpPaise, variant.pricePaise) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						"MRP ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "line-through tabular-nums",
							children: inr(variant.mrpPaise)
						}),
						" · ",
						discountPercent(variant.mrpPaise, variant.pricePaise),
						"% off · incl. GST"
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: ["Inclusive of GST · ", variant.sku]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm",
					children: stock > 0 ? `${stock} in stock at this store` : "Out of stock at this store"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: stock <= 0,
					onClick: () => {
						add(variant.id, 1);
						toast.success("Added to cart");
					},
					className: "mt-4 h-12 w-full rounded-full bg-brand font-bold text-ink disabled:opacity-40 md:w-auto md:px-8",
					children: stock > 0 ? "Add to cart" : "Out of stock"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Ratings"
					}), reviews.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "No ratings yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-2",
						children: reviews.map((review, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-2xl border border-line bg-cream p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-semibold",
								children: [
									review.name,
									" · ",
									review.rating,
									"/5"
								]
							}), review.body ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: review.body
							}) : null]
						}, index))
					})]
				})
			] })]
		}) : null
	] });
}
//#endregion
export { ProductPage as component };
