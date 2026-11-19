import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Shell, t as EmptyState, x as usePlace } from "./shell-D2L_H36Z.mjs";
import { a as useCatalog, r as rootCategory } from "./use-catalog-s9v4_ydO.mjs";
import { t as ProductCard } from "./product-card-DFVPpEak.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-Dd5i5uSD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RECENT = "mehrait-recent";
function SearchPage() {
	const { catalog, loading, error } = useCatalog();
	const storeId = usePlace((state) => state.storeId);
	const [q, setQ] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [onlyDeals, setOnlyDeals] = (0, import_react.useState)(false);
	const [sort, setSort] = (0, import_react.useState)("relevance");
	const [recent, setRecent] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(RECENT);
			if (raw) setRecent(JSON.parse(raw));
		} catch {}
	}, []);
	function remember(term) {
		const next = [term, ...recent.filter((item) => item !== term)].slice(0, 6);
		setRecent(next);
		localStorage.setItem(RECENT, JSON.stringify(next));
	}
	const results = (0, import_react.useMemo)(() => {
		if (!catalog) return [];
		const term = q.trim().toLowerCase();
		let list = catalog.products.filter((product) => {
			const cat = catalog.categories.find((item) => item.id === product.categoryId);
			const root = rootCategory(catalog.categories, product.categoryId);
			const hay = `${product.name} ${product.brand} ${cat?.name ?? ""} ${root?.name ?? ""}`.toLowerCase();
			if (term && !hay.includes(term)) return false;
			if (category !== "all" && root?.slug !== category) return false;
			if (onlyDeals && product.variants[0] && product.variants[0].pricePaise >= product.variants[0].mrpPaise) return false;
			return true;
		});
		if (sort === "price-asc") list = [...list].sort((a, b) => a.variants[0].pricePaise - b.variants[0].pricePaise);
		if (sort === "price-desc") list = [...list].sort((a, b) => b.variants[0].pricePaise - a.variants[0].pricePaise);
		if (sort === "discount") list = [...list].sort((a, b) => b.variants[0].mrpPaise - b.variants[0].pricePaise - (a.variants[0].mrpPaise - a.variants[0].pricePaise));
		return list;
	}, [
		catalog,
		q,
		category,
		onlyDeals,
		sort
	]);
	const suggestions = catalog && q.trim().length > 0 ? catalog.products.filter((product) => product.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 5) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold tracking-tight",
			children: "Search"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			autoFocus: true,
			value: q,
			onChange: (event) => setQ(event.target.value),
			onBlur: () => {
				if (q.trim()) remember(q.trim());
			},
			placeholder: "Try milk, atta, banana",
			className: "mt-3 h-12 w-full rounded-full border border-line bg-cream px-4"
		}),
		suggestions.length > 0 && q.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 overflow-hidden rounded-2xl border border-line bg-cream",
			children: suggestions.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "block w-full px-4 py-3 text-left text-sm",
				onClick: () => {
					setQ(product.name);
					remember(product.name);
				},
				children: [
					product.name,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted",
						children: ["· ", product.brand]
					})
				]
			}) }, product.id))
		}) : null,
		!q && recent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: "Recent"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: recent.map((term) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setQ(term),
					className: "rounded-full border border-line bg-cream px-3 py-1 text-sm",
					children: term
				}, term))
			})]
		}) : null,
		!q && catalog ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: "Popular"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: catalog.settings.popular.map((term) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setQ(term),
					className: "rounded-full bg-brand px-3 py-1 text-sm font-semibold",
					children: term
				}, term))
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: category,
					onChange: (event) => setCategory(event.target.value),
					className: "h-10 rounded-full border border-line bg-cream px-3 text-sm",
					"aria-label": "Category",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "all",
						children: "All categories"
					}), catalog?.categories.filter((item) => item.parentId == null).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: item.slug,
						children: item.name
					}, item.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: sort,
					onChange: (event) => setSort(event.target.value),
					className: "h-10 rounded-full border border-line bg-cream px-3 text-sm",
					"aria-label": "Sort",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "relevance",
							children: "Relevance"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "price-asc",
							children: "Price: low to high"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "price-desc",
							children: "Price: high to low"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "discount",
							children: "Discount"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setOnlyDeals((value) => !value),
					className: `h-10 rounded-full px-3 text-sm font-semibold ${onlyDeals ? "bg-ink text-cream" : "border border-line bg-cream"}`,
					children: "On offer"
				})
			]
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-sm text-muted",
			children: "Loading the catalogue…"
		}) : null,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-sm text-danger",
			children: error
		}) : null,
		catalog && q.trim() && results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No matches",
				body: "Try a shorter word, or browse a category."
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-2 gap-3 md:grid-cols-4",
			children: (q.trim() ? results : []).map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
				product,
				slug: rootCategory(catalog.categories, product.categoryId)?.slug ?? "snacks",
				storeId
			}, product.id))
		})
	] });
}
//#endregion
export { SearchPage as component };
