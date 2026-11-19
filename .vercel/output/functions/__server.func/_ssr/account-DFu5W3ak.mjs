import { o as __toESM } from "../_runtime.mjs";
import { n as inr } from "./pricing-DaB8c9_f.mjs";
import { i as STATUS_LABEL } from "./types-CG6XJmV6.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useCurrentUserState } from "./use-current-user-B7Cbrtsy.mjs";
import { n as UserButton, t as RedirectToSignIn } from "./gates-Dco3ZlwP.mjs";
import { c as deleteAddress, d as listAddresses, f as listNotifications, h as markNotificationsRead, l as getMe, m as listTickets, n as Shell, p as listOrders, s as createTicket, y as updateProfile } from "./shell-D2L_H36Z.mjs";
import { a as useCatalog } from "./use-catalog-s9v4_ydO.mjs";
import { i as isStaff } from "./permissions-BDsC6k0_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-DFu5W3ak.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	"Profile",
	"Addresses",
	"Orders",
	"Alerts",
	"Support"
];
function AccountPage() {
	const { user, isPending } = useCurrentUserState();
	const { catalog } = useCatalog();
	const [tab, setTab] = (0, import_react.useState)("Profile");
	const [me, setMe] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [addresses, setAddresses] = (0, import_react.useState)([]);
	const [orders, setOrders] = (0, import_react.useState)([]);
	const [notes, setNotes] = (0, import_react.useState)([]);
	const [tickets, setTickets] = (0, import_react.useState)([]);
	const [subject, setSubject] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!user) return;
		getMe().then((profile) => {
			setMe(profile);
			setName(profile.name);
			setPhone(profile.phone);
		}).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load your account."));
	}, [user]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		if (tab === "Addresses") listAddresses().then(setAddresses).catch(() => setAddresses([]));
		if (tab === "Orders") listOrders().then(setOrders).catch(() => setOrders([]));
		if (tab === "Alerts") {
			listNotifications().then(setNotes).catch(() => setNotes([]));
			markNotificationsRead().catch(() => void 0);
		}
		if (tab === "Support") listTickets().then(setTickets).catch(() => setTickets([]));
	}, [tab, user]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Checking your session…"
	}) });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold tracking-tight",
			children: "Account"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: user.primaryEmail ?? user.displayName
		}),
		me && isStaff(me.roles) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/admin",
				className: "inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm font-semibold text-cream",
				children: "Store desk"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/rider",
				className: "inline-flex h-10 items-center rounded-full bg-brand px-4 text-sm font-semibold",
				children: "Rider"
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rail mt-4 flex gap-2 overflow-x-auto",
			children: TABS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(item),
				className: `h-10 shrink-0 rounded-full px-4 text-sm font-semibold ${tab === item ? "bg-ink text-cream" : "border border-line bg-cream"}`,
				children: item
			}, item))
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-danger",
			children: error
		}) : null,
		tab === "Profile" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 max-w-md space-y-3",
			onSubmit: (event) => {
				event.preventDefault();
				updateProfile({ data: {
					fullName: name,
					phone
				} }).then(() => toast.success("Profile saved")).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not save."));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm font-semibold",
					children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: name,
						onChange: (event) => setName(event.target.value),
						className: "mt-1 h-11 w-full rounded-full border border-line bg-cream px-4 font-normal"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm font-semibold",
					children: ["Mobile", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: phone,
						onChange: (event) => setPhone(event.target.value),
						inputMode: "numeric",
						placeholder: "10-digit mobile",
						className: "mt-1 h-11 w-full rounded-full border border-line bg-cream px-4 font-normal"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Used on delivery calls. Sign-in stays on email, Google or X."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "h-11 rounded-full bg-brand px-5 font-bold",
					children: "Save"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
				})
			]
		}) : null,
		tab === "Addresses" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-4 space-y-3",
			children: [addresses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-sm text-muted",
				children: "No saved addresses yet. Add one at checkout."
			}) : null, addresses.map((address) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-3xl border border-line bg-cream p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-semibold",
						children: [
							address.label,
							" · ",
							address.area
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							address.line1,
							", ",
							address.city,
							" ",
							address.pincode
						]
					}),
					catalog && !catalog.areas.some((area) => area.pincode === address.pincode) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold text-danger",
						children: "Outside the delivery area"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-2 text-sm font-semibold text-danger",
						onClick: () => deleteAddress({ data: address.id }).then(() => setAddresses((rows) => rows.filter((row) => row.id !== address.id))),
						children: "Remove"
					})
				]
			}, address.id))]
		}) : null,
		tab === "Orders" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-4 space-y-3",
			children: [orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-sm text-muted",
				children: "No orders yet."
			}) : null, orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/orders/$id",
				params: { id: order.publicId },
				className: "block rounded-3xl border border-line bg-cream p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold",
						children: order.publicId
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-brand px-2 py-1 text-xs font-bold",
						children: STATUS_LABEL[order.status] ?? order.status
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mt-1 block text-sm text-muted",
					children: [
						order.itemCount,
						" items · ",
						inr(order.payablePaise),
						" · ",
						order.paymentMethod === "cod" ? "Cash" : "Online"
					]
				})]
			}) }, order.publicId))]
		}) : null,
		tab === "Alerts" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-4 space-y-3",
			children: [notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-sm text-muted",
				children: "No alerts yet. Order updates land here."
			}) : null, notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-3xl border border-line bg-cream p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: note.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: note.body
				})]
			}, note.id))]
		}) : null,
		tab === "Support" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						"Care ",
						catalog?.settings.supportPhone,
						" · ",
						catalog?.settings.supportEmail
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-3 space-y-2",
					onSubmit: (event) => {
						event.preventDefault();
						createTicket({ data: {
							subject,
							body
						} }).then(async () => {
							setSubject("");
							setBody("");
							setTickets(await listTickets());
							toast.success("Ticket sent");
						}).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not send."));
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: subject,
							onChange: (event) => setSubject(event.target.value),
							placeholder: "Subject",
							className: "h-11 w-full rounded-full border border-line bg-cream px-4"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: body,
							onChange: (event) => setBody(event.target.value),
							placeholder: "What do you need?",
							className: "min-h-28 w-full rounded-3xl border border-line bg-cream p-4"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "h-11 rounded-full bg-brand px-5 font-bold",
							children: "Send"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-2",
					children: tickets.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-2xl border border-line p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: ticket.subject
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: ticket.body
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase",
								children: ticket.status
							})
						]
					}, ticket.id))
				})
			]
		}) : null
	] });
}
//#endregion
export { AccountPage as component };
