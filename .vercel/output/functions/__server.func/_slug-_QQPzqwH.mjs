import { o as __toESM } from "./_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { i as Route$3 } from "./_ssr/router-CZrSzEs0.mjs";
import { n as Shell, r as SkeletonRows, t as EmptyState, x as usePlace } from "./_ssr/shell-D2L_H36Z.mjs";
import { a as useCatalog, n as productsIn, r as rootCategory } from "./_ssr/use-catalog-s9v4_ydO.mjs";
import { t as ProductCard } from "./_ssr/product-card-DFVPpEak.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-_QQPzqwH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CategoryPage() {
	const { slug } = Route$3.useParams();
	const { catalog, error, loading } = useCatalog();
	const storeId = usePlace((state) => state.storeId);
	const [child, setChild] = (0, import_react.useState)(null);
	const category = catalog?.categories.find((item) => item.slug === slug);
	const children = catalog?.categories.filter((item) => item.parentId === category?.id) ?? [];
	const products = catalog ? productsIn(catalog, child ?? slug) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: loading || !catalog ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonRows, {}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: error
	}) : !category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Category not found",
		body: "That aisle is not on the shelf.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/categories",
			className: "font-semibold",
			children: "All categories"
		})
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: rootCategory(catalog.categories, category.id)?.name
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold tracking-tight",
			children: category.name
		}),
		category.blurb ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: category.blurb
		}) : null,
		children.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rail mt-4 flex gap-2 overflow-x-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setChild(null),
				className: `h-9 shrink-0 rounded-full px-3 text-sm font-semibold ${child == null ? "bg-ink text-cream" : "border border-line bg-cream"}`,
				children: "All"
			}), children.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setChild(item.slug),
				className: `h-9 shrink-0 rounded-full px-3 text-sm font-semibold ${child === item.slug ? "bg-ink text-cream" : "border border-line bg-cream"}`,
				children: item.name
			}, item.id))]
		}) : null,
		products.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Nothing in this aisle",
				body: "Try another category."
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-2 gap-3 md:grid-cols-4",
			children: products.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
				product,
				slug: rootCategory(catalog.categories, product.categoryId)?.slug ?? slug,
				storeId
			}, product.id))
		})
	] }) });
}
//#endregion
export { CategoryPage as component };
