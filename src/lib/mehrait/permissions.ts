import { STAFF_ROLES } from "./types";

export function isStaff(roles: string[]) {
  return roles.some((role) => (STAFF_ROLES as readonly string[]).includes(role));
}

export function can(roles: string[], allowed: string[]) {
  if (roles.includes("super_admin")) return true;
  return roles.some((role) => allowed.includes(role));
}

export function assertRole(roles: string[], allowed: string[]) {
  if (!can(roles, allowed)) throw new Error("You do not have access to that action.");
}

export const DESK_SECTIONS: { id: string; label: string; roles: string[] }[] = [
  { id: "overview", label: "Overview", roles: [...STAFF_ROLES] },
  { id: "products", label: "Products", roles: ["admin", "inventory_manager"] },
  { id: "categories", label: "Categories", roles: ["admin"] },
  { id: "inventory", label: "Inventory", roles: ["admin", "store_manager", "inventory_manager"] },
  { id: "orders", label: "Orders", roles: ["admin", "store_manager", "order_manager", "delivery_manager"] },
  { id: "customers", label: "Customers", roles: ["admin", "order_manager"] },
  { id: "marketing", label: "Marketing", roles: ["admin"] },
  { id: "stores", label: "Stores", roles: ["admin", "store_manager"] },
  { id: "delivery", label: "Delivery", roles: ["admin", "delivery_manager"] },
  { id: "settings", label: "Settings", roles: ["admin"] },
];
