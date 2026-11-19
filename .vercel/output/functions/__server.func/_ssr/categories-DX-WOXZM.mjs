import { T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Shell, r as SkeletonRows } from "./shell-D2L_H36Z.mjs";
import { a as useCatalog } from "./use-catalog-s9v4_ydO.mjs";
import { t as CategoryGlyph } from "./icons-DGeKNi1_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/categories-DX-WOXZM.js
var import_jsx_runtime = require_jsx_runtime();
function CategoriesPage() {
	const { catalog, loading, error } = useCatalog();
	const tops = catalog?.categories.filter((category) => category.parentId == null) ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold tracking-tight",
			children: "Categories"
		}),
		loading || !catalog ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonRows, {})
		}) : null,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-danger",
			children: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid gap-3",
			children: tops.map((category) => {
				const kids = catalog?.categories.filter((item) => item.parentId === category.id) ?? [];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-3xl border border-line bg-cream p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/c/$slug",
						params: { slug: category.slug },
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-12 w-12 place-items-center rounded-2xl bg-brand",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
								slug: category.slug,
								className: "size-6"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-semibold",
							children: category.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted",
							children: category.blurb
						})] })]
					}), kids.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: kids.map((kid) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/c/$slug",
							params: { slug: kid.slug },
							className: "rounded-full border border-line px-3 py-1 text-sm",
							children: kid.name
						}, kid.id))
					}) : null]
				}, category.id);
			})
		})
	] });
}
//#endregion
export { CategoriesPage as component };
