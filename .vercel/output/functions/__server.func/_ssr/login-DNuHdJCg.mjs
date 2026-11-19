import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, S as Navigate, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as GROK_PROVIDERS } from "./server-jPSbhjEd.mjs";
import { r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { n as useCurrentUserState } from "./use-current-user-B7Cbrtsy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DNuHdJCg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (!isPending && user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function submit(event) {
		event.preventDefault();
		setError("");
		if (password.length < 8) {
			setError("Use at least 8 characters.");
			return;
		}
		setBusy(true);
		try {
			if (mode === "up") {
				const created = await authClient.signUp.email({
					email,
					password,
					name: name || email.split("@")[0]
				});
				if (created.error) throw new Error(created.error.message || "Could not create the account.");
			}
			const signed = await authClient.signIn.email({
				email,
				password
			});
			if (signed.error) throw new Error(signed.error.message || "Could not sign in.");
			window.location.assign("/");
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Could not sign in.");
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid min-h-screen md:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex flex-col justify-between bg-brand p-6 text-ink md:p-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/brand/icon-192.png",
						alt: "",
						className: "h-14 w-14 rounded-2xl"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-2xl font-extrabold tracking-tight",
						children: ["MEHRA", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-md bg-ink px-1 text-brand",
							children: "IT"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold tracking-wide uppercase",
							children: "Shop smart · Live better"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 max-w-sm text-4xl font-extrabold tracking-tight",
							children: "Groceries from a store near you."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-6 space-y-2 text-sm font-medium",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Minutes, not a next-day slot." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Live in parts of Bengaluru and Mumbai." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Track the order from packed to delivered." })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-sm",
					children: "SMS one-time passwords are not used. Sign in with email, Google or X."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "flex items-center bg-paper p-6 md:p-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-sm",
				children: [
					isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-40 animate-pulse rounded-full bg-line" }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-extrabold",
						children: mode === "in" ? "Welcome back" : "Create your account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (event) => void submit(event),
						className: "mt-4 space-y-3",
						children: [
							mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: name,
								onChange: (event) => setName(event.target.value),
								placeholder: "Name",
								className: "h-12 w-full rounded-full border border-line bg-cream px-4",
								required: true
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								value: email,
								onChange: (event) => setEmail(event.target.value),
								placeholder: "Email",
								autoComplete: "email",
								className: "h-12 w-full rounded-full border border-line bg-cream px-4",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "password",
								value: password,
								onChange: (event) => setPassword(event.target.value),
								placeholder: "Password",
								autoComplete: mode === "up" ? "new-password" : "current-password",
								className: "h-12 w-full rounded-full border border-line bg-cream px-4",
								required: true
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-danger",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: busy || false,
								className: "h-12 w-full rounded-full bg-brand font-bold text-ink disabled:opacity-50",
								children: busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-3 text-sm font-semibold",
						onClick: () => setMode(mode === "in" ? "up" : "in"),
						children: mode === "in" ? "New to MehraIT? Create an account" : "Already have an account? Sign in"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-4 h-px bg-line" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => signIn(provider.providerId, { callbackURL: "/" }),
							className: "h-12 w-full rounded-full border border-line bg-cream font-semibold",
							children: ["Continue with ", provider.label]
						}, provider.providerId))
					})
				]
			})
		})]
	});
}
//#endregion
export { LoginPage as component };
