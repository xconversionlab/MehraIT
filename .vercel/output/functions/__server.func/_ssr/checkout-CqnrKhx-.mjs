import { o as __toESM } from "../_runtime.mjs";
import { n as inr, r as quoteCart } from "./pricing-DaB8c9_f.mjs";
import { C as useNavigate, Q as require_react, T as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useCurrentUserState } from "./use-current-user-B7Cbrtsy.mjs";
import { t as RedirectToSignIn } from "./gates-Dco3ZlwP.mjs";
import { _ as saveAddress, a as confirmOnlinePayment, b as useCart, d as listAddresses, g as placeOrder, n as Shell, v as startOnlinePayment, x as usePlace } from "./shell-D2L_H36Z.mjs";
import { a as useCatalog, i as stockAt } from "./use-catalog-s9v4_ydO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-CqnrKhx-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CheckoutPage() {
	const { user, isPending } = useCurrentUserState();
	const { catalog } = useCatalog();
	const navigate = useNavigate();
	const place = usePlace();
	const lines = useCart((state) => state.lines);
	const couponCode = useCart((state) => state.coupon);
	const clear = useCart((state) => state.clear);
	const [addresses, setAddresses] = (0, import_react.useState)([]);
	const [addressId, setAddressId] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [form, setForm] = (0, import_react.useState)({
		line1: "",
		label: "Home",
		contactName: "",
		contactPhone: ""
	});
	(0, import_react.useEffect)(() => {
		if (!user) return;
		listAddresses().then((rows) => {
			setAddresses(rows);
			const match = rows.find((row) => row.pincode === place.pincode) ?? rows.find((row) => row.isDefault) ?? rows[0];
			if (match) setAddressId(match.id);
		}).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load addresses."));
	}, [user, place.pincode]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Checking your session…"
	}) });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const store = catalog?.stores.find((item) => item.id === place.storeId);
	const resolved = !catalog ? [] : lines.flatMap((line) => {
		for (const product of catalog.products) {
			const variant = product.variants.find((item) => item.id === line.variantId);
			if (!variant) continue;
			return [{
				variantId: variant.id,
				productId: product.id,
				name: product.name,
				brand: product.brand,
				sku: variant.sku,
				unit: variant.unit,
				qty: line.qty,
				mrpPaise: variant.mrpPaise,
				pricePaise: variant.pricePaise,
				taxBps: variant.taxBps,
				stock: stockAt(product, variant.id, place.storeId)
			}];
		}
		return [];
	});
	const coupon = catalog?.coupons.find((item) => item.code === couponCode.trim().toUpperCase()) ?? null;
	const quote = store ? quoteCart({
		lines: resolved,
		coupon: couponCode ? coupon : null,
		deliveryFeePaise: store.deliveryFeePaise,
		freeAbovePaise: store.freeAbovePaise
	}) : null;
	const blocked = resolved.some((line) => line.qty > line.stock) || !place.serviceable || !store;
	async function addAddress() {
		if (!place.serviceable) {
			setError("Pick a serviceable area before saving an address.");
			return;
		}
		setBusy(true);
		setError("");
		try {
			const saved = await saveAddress({ data: {
				label: form.label,
				line1: form.line1,
				area: place.label,
				city: place.city,
				pincode: place.pincode,
				contactName: form.contactName || user?.displayName || "Customer",
				contactPhone: form.contactPhone,
				isDefault: addresses.length === 0
			} });
			const rows = await listAddresses();
			setAddresses(rows);
			setAddressId(saved.id ?? null);
			toast.success("Address saved");
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Could not save the address.");
		} finally {
			setBusy(false);
		}
	}
	async function payCod() {
		if (!store || !addressId || !quote) return;
		setBusy(true);
		setError("");
		try {
			const order = await placeOrder({ data: {
				storeId: store.id,
				addressId,
				lines: resolved.map((line) => ({
					variantId: line.variantId,
					qty: line.qty
				})),
				couponCode,
				paymentMethod: "cod"
			} });
			clear();
			toast.success("Order placed");
			await navigate({
				to: "/orders/$id",
				params: { id: order.publicId }
			});
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Checkout failed.");
		} finally {
			setBusy(false);
		}
	}
	async function payOnline() {
		if (!store || !addressId) return;
		setBusy(true);
		setError("");
		try {
			const started = await startOnlinePayment({ data: {
				storeId: store.id,
				addressId,
				lines: resolved.map((line) => ({
					variantId: line.variantId,
					qty: line.qty
				})),
				couponCode,
				paymentMethod: "online"
			} });
			await loadRazorpay();
			if (!window.Razorpay) throw new Error("Razorpay checkout did not load.");
			new window.Razorpay({
				key: started.keyId,
				amount: started.amount,
				currency: "INR",
				order_id: started.gatewayOrderId,
				name: "MehraIT",
				description: started.publicId,
				handler: async (response) => {
					try {
						await confirmOnlinePayment({ data: {
							publicId: started.publicId,
							gatewayOrderId: response.razorpay_order_id,
							gatewayPaymentId: response.razorpay_payment_id,
							signature: response.razorpay_signature
						} });
						clear();
						await navigate({
							to: "/orders/$id",
							params: { id: started.publicId }
						});
					} catch (reason) {
						setError(reason instanceof Error ? reason.message : "Payment could not be confirmed.");
					}
				}
			}).open();
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Online payment is unavailable.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold tracking-tight",
			children: "Checkout"
		}),
		!place.serviceable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-danger",
			children: "This location is outside the delivery area. Change it from the home screen."
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4 rounded-3xl border border-line bg-cream p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Address"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 space-y-2",
					children: addresses.map((address) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex cursor-pointer gap-3 rounded-2xl border border-line p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "radio",
							name: "address",
							checked: addressId === address.id,
							onChange: () => setAddressId(address.id)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block font-semibold",
								children: [
									address.label,
									" · ",
									address.area
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm text-muted",
								children: [
									address.line1,
									", ",
									address.city,
									" ",
									address.pincode
								]
							}),
							catalog && !catalog.areas.some((area) => area.pincode === address.pincode) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-xs font-semibold text-danger",
								children: "Outside delivery area"
							}) : null
						] })]
					}, address.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: ["New address in ", place.serviceable ? `${place.label}, ${place.pincode}` : "a serviceable area"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: form.label,
							onChange: (event) => setForm({
								...form,
								label: event.target.value
							}),
							className: "h-11 rounded-full border border-line bg-paper px-3",
							"aria-label": "Label",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Home" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Work" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Other" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: form.line1,
							onChange: (event) => setForm({
								...form,
								line1: event.target.value
							}),
							placeholder: "Flat, building, street",
							className: "h-11 rounded-full border border-line bg-paper px-4"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: form.contactName,
							onChange: (event) => setForm({
								...form,
								contactName: event.target.value
							}),
							placeholder: "Name on the doorbell",
							className: "h-11 rounded-full border border-line bg-paper px-4"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: form.contactPhone,
							onChange: (event) => setForm({
								...form,
								contactPhone: event.target.value
							}),
							placeholder: "10-digit mobile",
							inputMode: "numeric",
							className: "h-11 rounded-full border border-line bg-paper px-4"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy,
							onClick: () => void addAddress(),
							className: "h-11 rounded-full border border-line font-semibold",
							children: "Save address"
						})
					]
				})
			]
		}),
		quote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4 rounded-3xl border border-line bg-cream p-4 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Order summary"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1",
					children: resolved.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							line.name,
							" × ",
							line.qty
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: inr(line.pricePaise * line.qty)
						})]
					}, line.variantId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 flex justify-between font-bold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "To pay" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: inr(quote.payablePaise)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted",
					children: [
						"Delivery ",
						quote.deliveryPaise === 0 ? "free" : inr(quote.deliveryPaise),
						" · GST included ",
						inr(quote.taxPaise)
					]
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4 rounded-3xl border border-line bg-cream p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Payment"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Cash on delivery is live. Razorpay runs only when sandbox keys are configured on the server — nothing is charged otherwise."
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-danger",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy || blocked || !addressId,
					onClick: () => void payCod(),
					className: "mt-3 h-12 w-full rounded-full bg-brand font-bold text-ink disabled:opacity-40",
					children: "Place cash on delivery order"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy || blocked || !addressId || !catalog?.settings.razorpayConfigured,
					onClick: () => void payOnline(),
					className: "mt-2 h-12 w-full rounded-full bg-ink font-semibold text-cream disabled:opacity-40",
					children: catalog?.settings.razorpayConfigured ? "Pay online with Razorpay" : "Online payment not connected"
				})
			]
		})
	] });
}
function loadRazorpay() {
	if (window.Razorpay) return Promise.resolve();
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.onload = () => resolve();
		script.onerror = () => reject(/* @__PURE__ */ new Error("Could not load Razorpay."));
		document.body.appendChild(script);
	});
}
//#endregion
export { CheckoutPage as component };
