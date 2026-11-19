import { T as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-chart-BsBn3nCx.js
var import_jsx_runtime = require_jsx_runtime();
function DeskChart({ items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-56 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
				data: items,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "name",
						tick: {
							fontSize: 11,
							fill: "#5e584f"
						},
						interval: 0,
						height: 48
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						allowDecimals: false,
						width: 32,
						tick: {
							fontSize: 11,
							fill: "#5e584f"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						dataKey: "count",
						fill: "var(--color-brand)",
						radius: 6
					})
				]
			})
		})
	});
}
//#endregion
export { DeskChart };
