import { i as TSS_SERVER_FUNCTION } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/num-B6cM7uhK.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function num(v) {
	const x = typeof v === "number" ? v : Number(v);
	return Number.isFinite(x) ? x : 0;
}
function asBool(v) {
	return v === true || v === "t" || v === "true" || v === 1;
}
//#endregion
export { createServerRpc as n, num as r, asBool as t };
