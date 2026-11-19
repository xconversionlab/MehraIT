import { o as __toESM } from "../_runtime.mjs";
import { n as inr } from "./pricing-DaB8c9_f.mjs";
import { i as STATUS_LABEL } from "./types-CG6XJmV6.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useCurrentUserState } from "./use-current-user-B7Cbrtsy.mjs";
import { t as RedirectToSignIn } from "./gates-Dco3ZlwP.mjs";
import { t as authMiddleware } from "./middleware-BBXSmM46.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rider-CM0_g_YI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function parse(schema, input) {
	const result = schema.safeParse(input);
	if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Check that form and try again.");
	return result.data;
}
var getRider = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4da5e3d648307120c310e0c6b2848479dc857da5267dfd9a55941b5e8c33d081"));
var joinRoster = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("42552b646610cd691b6f8d4491d712fa7f848f7aa1c08b563d239e0755e45434"));
var setAvailability = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(boolean(), input)).handler(createSsrRpc("1f9aedf9fe81035bb8b30fcc16c1e23dccd35c6bc52d8c747aa0db1ce048ac55"));
var shareLocation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	lat: number(),
	lng: number()
}), input)).handler(createSsrRpc("a49b2ac0bc8917710ef42713b0a7e7e717b42d76000b27ae9e0d8278790eb483"));
var riderAdvance = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parse(object({
	publicId: string().trim().min(4),
	action: _enum([
		"pickup",
		"out",
		"deliver"
	]),
	otp: string().trim().optional().default("")
}), input)).handler(createSsrRpc("604a35795045a1119525adf0ca9ad055602a3a6e6ce60b1ca10b6a7394340a93"));
function RiderPage() {
	const { user, isPending } = useCurrentUserState();
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [otp, setOtp] = (0, import_react.useState)("");
	function load() {
		getRider().then(setData).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not open rider mode."));
	}
	(0, import_react.useEffect)(() => {
		if (user) load();
	}, [user]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-6 text-sm",
		children: "Opening rider mode…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	async function act(publicId, action) {
		setError("");
		try {
			await riderAdvance({ data: {
				publicId,
				action,
				otp
			} });
			setOtp("");
			toast.success("Updated");
			load();
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Could not update the delivery.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-screen max-w-lg bg-paper px-4 py-4 text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2 font-extrabold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/brand/icon-192.png",
						alt: "",
						className: "h-10 w-10 rounded-xl"
					}), " Rider"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/account",
					className: "text-sm font-semibold",
					children: "Account"
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-danger",
				children: error
			}) : null,
			!data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-muted",
				children: "Loading assignments…"
			}) : null,
			data && !data.enrolled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-3xl border border-line bg-cream p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-xl font-extrabold",
						children: "You are not on the roster"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "A delivery manager adds partners. The first store owner is enrolled automatically."
					}),
					data.canJoin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-4 h-12 rounded-full bg-brand px-5 font-bold",
						onClick: () => joinRoster().then(load).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not join.")),
						children: "Join the roster"
					}) : null
				]
			}) : null,
			data && data.enrolled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-3xl bg-brand p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: data.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-extrabold tabular-nums",
								children: inr(data.earningsPaise)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm",
								children: ["Delivered earnings · ", data.vehicle]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mt-3 h-12 w-full rounded-full bg-ink font-bold text-cream",
								onClick: () => setAvailability({ data: !data.available }).then(load),
								children: data.available ? "You are available · go offline" : "Go available"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mt-2 h-11 w-full rounded-full bg-cream font-semibold",
								onClick: () => {
									if (!navigator.geolocation) {
										setError("This browser cannot share location.");
										return;
									}
									navigator.geolocation.getCurrentPosition((pos) => shareLocation({ data: {
										lat: pos.coords.latitude,
										lng: pos.coords.longitude
									} }).then(() => toast.success("Location shared")).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not share.")), () => setError("Location permission is off."));
								},
								children: "Share my location"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Assigned"
						}),
						data.jobs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "No active drops. Stay available and the desk will assign you."
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-3",
							children: data.jobs.map((job) => {
								const line1 = String(job.address.line1 ?? "");
								const area = String(job.address.area ?? "");
								const pin = String(job.address.pincode ?? "");
								const lat = job.address.lat;
								const lng = job.address.lng;
								const dest = typeof lat === "number" && typeof lng === "number" ? `${lat},${lng}` : encodeURIComponent(`${line1} ${area} ${pin}`);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-3xl border border-line bg-cream p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-extrabold",
											children: job.publicId
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm",
											children: [
												STATUS_LABEL[job.status] ?? job.status,
												" · payout ",
												inr(job.payoutPaise)
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-sm font-semibold",
											children: ["Pickup · ", job.storeName]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: job.storeAddress
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											className: "text-sm font-semibold",
											href: `https://www.google.com/maps/dir/?api=1&destination=${job.storeLat},${job.storeLng}`,
											target: "_blank",
											rel: "noreferrer",
											children: "Navigate to store"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-sm font-semibold",
											children: ["Drop · ", area]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted",
											children: [
												line1,
												", ",
												pin
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											className: "text-sm font-semibold",
											href: `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
											target: "_blank",
											rel: "noreferrer",
											children: "Navigate to customer"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 grid gap-2",
											children: [
												job.status === "assigned" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "h-12 rounded-full bg-brand font-bold",
													onClick: () => void act(job.publicId, "pickup"),
													children: "Confirm pickup"
												}) : null,
												job.status === "picked_up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "h-12 rounded-full bg-brand font-bold",
													onClick: () => void act(job.publicId, "out"),
													children: "Start delivery"
												}) : null,
												job.status === "out_for_delivery" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: otp,
													onChange: (event) => setOtp(event.target.value),
													inputMode: "numeric",
													placeholder: "Customer delivery code",
													className: "h-12 rounded-full border border-line px-4"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "h-12 rounded-full bg-ink font-bold text-cream",
													onClick: () => void act(job.publicId, "deliver"),
													children: "Complete delivery"
												})] }) : null
											]
										})
									]
								}, job.publicId);
							})
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "History"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-2 space-y-2 text-sm",
						children: [data.history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-muted",
							children: "No completed drops yet."
						}) : null, data.history.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between rounded-2xl border border-line px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.publicId }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums",
								children: [
									STATUS_LABEL[row.status] ?? row.status,
									" · ",
									inr(row.payoutPaise)
								]
							})]
						}, row.publicId))]
					})] })
				]
			}) : null
		]
	});
}
//#endregion
export { RiderPage as component };
