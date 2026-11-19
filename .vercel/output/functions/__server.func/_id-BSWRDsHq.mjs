import { o as __toESM } from "./_runtime.mjs";
import { n as inr } from "./_ssr/pricing-DaB8c9_f.mjs";
import { i as STATUS_LABEL, t as ORDER_FLOW } from "./_ssr/types-CG6XJmV6.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { r as Route$2 } from "./_ssr/router-CZrSzEs0.mjs";
import { n as useCurrentUserState } from "./_ssr/use-current-user-B7Cbrtsy.mjs";
import { t as RedirectToSignIn } from "./_ssr/gates-Dco3ZlwP.mjs";
import { i as cancelOrder, n as Shell, o as createReview, u as getOrder } from "./_ssr/shell-D2L_H36Z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-BSWRDsHq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OrderPage() {
	const { id } = Route$2.useParams();
	const { user, isPending } = useCurrentUserState();
	const [order, setOrder] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [reason, setReason] = (0, import_react.useState)("Changed my mind");
	const [rating, setRating] = (0, import_react.useState)(5);
	const [review, setReview] = (0, import_react.useState)("");
	function load() {
		getOrder({ data: id }).then(setOrder).catch((err) => setError(err instanceof Error ? err.message : "Order not found."));
	}
	(0, import_react.useEffect)(() => {
		if (user) load();
	}, [user, id]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Checking your session…"
	}) });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const address = order?.address ?? {};
	const flowIndex = order ? ORDER_FLOW.indexOf(order.status) : -1;
	const terminal = order?.status === "cancelled" || order?.status === "refund_initiated" || order?.status === "refunded";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/account",
			className: "text-sm font-semibold",
			children: "Account"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-2 text-2xl font-extrabold tracking-tight",
			children: id
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-danger",
			children: error
		}) : null,
		!order && !error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "Loading order…"
		}) : null,
		order ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-cream p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: STATUS_LABEL[order.status] ?? order.status
					}),
					terminal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: order.cancelReason
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-3 space-y-2",
						children: ORDER_FLOW.map((status, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${index <= flowIndex ? "bg-brand text-ink" : "bg-line text-muted"}`,
								children: index + 1
							}), STATUS_LABEL[status]]
						}, status))
					}),
					order.otp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 rounded-2xl bg-brand p-3 text-sm font-semibold",
						children: [
							"Delivery code ",
							order.otp,
							". Share it when the partner arrives."
						]
					}) : null,
					order.partner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: order.partner.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: order.partner.phone || "Phone shared at pickup"
							}),
							order.partner.lat != null && order.partner.lng != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "mt-1 inline-block font-semibold",
								href: `https://www.google.com/maps/dir/?api=1&destination=${order.partner.lat},${order.partner.lng}`,
								target: "_blank",
								rel: "noreferrer",
								children: "Last shared pin"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: "Live GPS appears when the partner shares a fix. Automatic dispatch is not connected."
							})
						]
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-cream p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Delivering to"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1",
						children: String(address.line1 ?? "")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted",
						children: [
							String(address.area ?? ""),
							", ",
							String(address.city ?? ""),
							" ",
							String(address.pincode ?? "")
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-1",
						children: order.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								item.name,
								" × ",
								item.qty
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: inr(item.pricePaise * item.qty)
							})]
						}, item.name))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 flex justify-between font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Paid" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: inr(order.payablePaise)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted",
						children: [
							order.payment?.provider ?? order.paymentMethod,
							" · ",
							order.payment?.status ?? "recorded",
							" · GST included ",
							inr(order.taxPaise)
						]
					}),
					order.status === "pending" || order.status === "confirmed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 space-y-2",
						onSubmit: (event) => {
							event.preventDefault();
							cancelOrder({ data: {
								publicId: order.publicId,
								reason
							} }).then(() => {
								toast.success("Order cancelled");
								load();
							}).catch((err) => setError(err instanceof Error ? err.message : "Could not cancel."));
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: reason,
							onChange: (event) => setReason(event.target.value),
							className: "h-11 w-full rounded-full border border-line px-4"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "h-11 rounded-full border border-line px-4 font-semibold",
							children: "Cancel order"
						})]
					}) : null,
					order.status === "delivered" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 space-y-2",
						onSubmit: (event) => {
							event.preventDefault();
							const productId = order.items.find((item) => item.productId)?.productId;
							if (!productId) return;
							createReview({ data: {
								publicId: order.publicId,
								productId,
								rating,
								body: review
							} }).then(() => toast.success("Thanks for the rating")).catch((err) => setError(err instanceof Error ? err.message : "Could not save the rating."));
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: "Rate this order"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: 1,
								max: 5,
								value: rating,
								onChange: (event) => setRating(Number(event.target.value)),
								className: "h-11 w-24 rounded-full border border-line px-4",
								"aria-label": "Rating"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: review,
								onChange: (event) => setReview(event.target.value),
								placeholder: "Optional note",
								className: "min-h-20 w-full rounded-2xl border border-line p-3"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "h-11 rounded-full bg-brand px-4 font-bold",
								children: "Submit rating"
							})
						]
					}) : null
				]
			})]
		}) : null
	] });
}
//#endregion
export { OrderPage as component };
