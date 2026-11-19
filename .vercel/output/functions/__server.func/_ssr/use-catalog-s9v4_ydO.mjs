import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-catalog-s9v4_ydO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var getCatalog = createServerFn({ method: "GET" }).handler(createSsrRpc("8ea8dd0f593604c8720f0e33bdffbe8adf6c0f4e46dc9b5695963cbf1e67a8cc"));
var listProductReviews = createServerFn({ method: "POST" }).validator((input) => {
	const id = Number(input);
	if (!Number.isInteger(id) || id <= 0) throw new Error("Unknown product.");
	return id;
}).handler(createSsrRpc("941f1c0e1b30a56d8a6064c1f8d2b9c67b1ccdba1b3b21ca6814837bf279bcea"));
var cache = null;
function useCatalog() {
	const [data, setData] = (0, import_react.useState)(cache);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (cache) {
			setData(cache);
			return;
		}
		let live = true;
		getCatalog().then((catalog) => {
			cache = catalog;
			if (live) setData(catalog);
		}).catch((reason) => {
			if (live) setError(reason instanceof Error ? reason.message : "The store could not load.");
		});
		return () => {
			live = false;
		};
	}, []);
	return {
		catalog: data,
		error,
		loading: !data && !error,
		reload: () => {
			cache = null;
			setData(null);
			setError(null);
			getCatalog().then((catalog) => {
				cache = catalog;
				setData(catalog);
			}).catch((reason) => setError(reason instanceof Error ? reason.message : "The store could not load."));
		}
	};
}
function rootCategory(categories, categoryId) {
	let current = categories.find((category) => category.id === categoryId);
	let guard = 0;
	while (current?.parentId && guard < 6) {
		current = categories.find((category) => category.id === current?.parentId);
		guard += 1;
	}
	return current;
}
function productsIn(catalog, slug) {
	const category = catalog.categories.find((item) => item.slug === slug);
	if (!category) return [];
	const ids = /* @__PURE__ */ new Set([category.id]);
	for (const item of catalog.categories) if (item.parentId === category.id) ids.add(item.id);
	return catalog.products.filter((product) => ids.has(product.categoryId));
}
function stockAt(product, variantId, storeId) {
	const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0];
	if (!variant || storeId == null) return 0;
	return variant.stock.find((cell) => cell.storeId === storeId)?.qty ?? 0;
}
//#endregion
export { useCatalog as a, stockAt as i, productsIn as n, rootCategory as r, listProductReviews as t };
