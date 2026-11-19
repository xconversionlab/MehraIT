import { T as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Cable, S as Coffee, T as Apple, _ as Flower2, a as SprayCan, b as Croissant, d as Package, f as Milk, h as Lamp, l as Pencil, n as Wheat, o as ShoppingBasket, u as PawPrint, v as Droplets, w as Baby, x as CookingPot, y as CupSoda } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/icons-DGeKNi1_.js
var import_jsx_runtime = require_jsx_runtime();
var ICONS = {
	"fruits-vegetables": Apple,
	dairy: Milk,
	staples: Wheat,
	snacks: ShoppingBasket,
	beverages: CupSoda,
	tea: Coffee,
	packaged: Package,
	bakery: Croissant,
	personal: Droplets,
	baby: Baby,
	household: Lamp,
	cleaning: SprayCan,
	pet: PawPrint,
	kitchen: CookingPot,
	electronics: Cable,
	beauty: Flower2,
	stationery: Pencil
};
function CategoryGlyph({ slug, className }) {
	const Icon = ICONS[slug] ?? ShoppingBasket;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
		className,
		strokeWidth: 1.75,
		"aria-hidden": "true"
	});
}
//#endregion
export { CategoryGlyph as t };
