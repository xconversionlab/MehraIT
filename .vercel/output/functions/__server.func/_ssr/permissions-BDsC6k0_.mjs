import { r as STAFF_ROLES } from "./types-CG6XJmV6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/permissions-BDsC6k0_.js
function isStaff(roles) {
	return roles.some((role) => STAFF_ROLES.includes(role));
}
function can(roles, allowed) {
	if (roles.includes("super_admin")) return true;
	return roles.some((role) => allowed.includes(role));
}
function assertRole(roles, allowed) {
	if (!can(roles, allowed)) throw new Error("You do not have access to that action.");
}
var DESK_SECTIONS = [
	{
		id: "overview",
		label: "Overview",
		roles: [...STAFF_ROLES]
	},
	{
		id: "products",
		label: "Products",
		roles: ["admin", "inventory_manager"]
	},
	{
		id: "categories",
		label: "Categories",
		roles: ["admin"]
	},
	{
		id: "inventory",
		label: "Inventory",
		roles: [
			"admin",
			"store_manager",
			"inventory_manager"
		]
	},
	{
		id: "orders",
		label: "Orders",
		roles: [
			"admin",
			"store_manager",
			"order_manager",
			"delivery_manager"
		]
	},
	{
		id: "customers",
		label: "Customers",
		roles: ["admin", "order_manager"]
	},
	{
		id: "marketing",
		label: "Marketing",
		roles: ["admin"]
	},
	{
		id: "stores",
		label: "Stores",
		roles: ["admin", "store_manager"]
	},
	{
		id: "delivery",
		label: "Delivery",
		roles: ["admin", "delivery_manager"]
	},
	{
		id: "settings",
		label: "Settings",
		roles: ["admin"]
	}
];
//#endregion
export { isStaff as i, assertRole as n, can as r, DESK_SECTIONS as t };
