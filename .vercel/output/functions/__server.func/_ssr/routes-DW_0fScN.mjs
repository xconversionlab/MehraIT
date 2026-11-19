import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as LocateFixed, t as X } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { b as useCart, n as Shell, r as SkeletonRows, x as usePlace } from "./shell-D2L_H36Z.mjs";
import { a as useCatalog, r as rootCategory } from "./use-catalog-s9v4_ydO.mjs";
import { t as CategoryGlyph } from "./icons-DGeKNi1_.mjs";
import { t as ProductCard } from "./product-card-DFVPpEak.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DW_0fScN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function haversineKm(aLat, aLng, bLat, bLng) {
	const r = 6371;
	const dLat = (bLat - aLat) * Math.PI / 180;
	const dLng = (bLng - aLng) * Math.PI / 180;
	const s = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
	return 2 * r * Math.asin(Math.min(1, Math.sqrt(s)));
}
function nearestArea(areas, stores, lat, lng) {
	let best = null;
	for (const area of areas) {
		const store = stores.find((s) => s.id === area.storeId);
		if (!store) continue;
		const km = haversineKm(lat, lng, area.lat, area.lng);
		if (km > store.radiusKm) continue;
		if (!best || km < best.km) best = {
			area,
			store,
			km
		};
	}
	return best;
}
function pinLayout(areas) {
	if (areas.length === 0) return [];
	const lats = areas.map((a) => a.lat);
	const lngs = areas.map((a) => a.lng);
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);
	const minLng = Math.min(...lngs);
	const maxLng = Math.max(...lngs);
	const latSpan = maxLat - minLat || 1;
	const lngSpan = maxLng - minLng || 1;
	return areas.map((area) => ({
		...area,
		left: 14 + (area.lng - minLng) / lngSpan * 72,
		top: 16 + (maxLat - area.lat) / latSpan * 68
	}));
}
function LocationButton({ catalog, onOpen }) {
	const place = usePlace();
	const store = catalog.stores.find((item) => item.id === place.storeId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onOpen,
		className: "flex h-11 max-w-full items-center gap-2 rounded-full border border-line bg-cream px-3 text-left",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-sm font-semibold",
				children: place.serviceable ? place.label : "Outside the delivery area"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-xs text-muted",
				children: place.serviceable ? `${catalog.settings.promise} · ${store?.name ?? place.city}` : "Pick a serviceable pincode"
			})]
		})]
	});
}
function LocationSheet({ catalog, onClose }) {
	const setPlace = usePlace((state) => state.setPlace);
	const [city, setCity] = (0, import_react.useState)(catalog.areas[0]?.city ?? "Bengaluru");
	const [query, setQuery] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const cities = [...new Set(catalog.areas.map((area) => area.city))];
	const cityAreas = catalog.areas.filter((area) => area.city === city);
	const pins = (0, import_react.useMemo)(() => pinLayout(cityAreas), [cityAreas]);
	const filtered = cityAreas.filter((area) => {
		return `${area.name} ${area.pincode}`.toLowerCase().includes(query.trim().toLowerCase());
	});
	function choose(areaId) {
		const area = catalog.areas.find((item) => item.id === areaId);
		if (!area) return;
		catalog.stores.find((item) => item.id === area.storeId);
		setPlace({
			areaId: area.id,
			storeId: area.storeId,
			label: area.name,
			city: area.city,
			pincode: area.pincode,
			serviceable: true,
			lat: area.lat,
			lng: area.lng
		});
		onClose();
	}
	function useGps() {
		if (!navigator.geolocation) {
			setMessage("This browser cannot share a location. Search your area instead.");
			return;
		}
		navigator.geolocation.getCurrentPosition((position) => {
			const hit = nearestArea(catalog.areas, catalog.stores, position.coords.latitude, position.coords.longitude);
			if (!hit) {
				setPlace({
					areaId: null,
					storeId: null,
					label: "Current location",
					city: "",
					pincode: "",
					serviceable: false,
					lat: position.coords.latitude,
					lng: position.coords.longitude
				});
				setMessage("MehraIT does not deliver to this pin yet. Bengaluru and Mumbai are live.");
				return;
			}
			setPlace({
				areaId: hit.area.id,
				storeId: hit.store.id,
				label: hit.area.name,
				city: hit.area.city,
				pincode: hit.area.pincode,
				serviceable: true,
				lat: position.coords.latitude,
				lng: position.coords.longitude
			});
			onClose();
		}, () => setMessage("Location permission is off. Search your area instead."), {
			enableHighAccuracy: true,
			timeout: 8e3
		});
	}
	function checkPincode() {
		const pin = query.trim();
		if (!/^\d{6}$/.test(pin)) {
			setMessage("Enter a 6-digit pincode.");
			return;
		}
		const area = catalog.areas.find((item) => item.pincode === pin);
		if (!area) {
			setPlace({
				areaId: null,
				storeId: null,
				label: pin,
				city: "",
				pincode: pin,
				serviceable: false,
				lat: null,
				lng: null
			});
			setMessage(`MehraIT is not in ${pin} yet. Try Indiranagar 560038 or Bandra West 400050.`);
			return;
		}
		choose(area.id);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-ink/40 md:items-center",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "location-title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper p-4 md:rounded-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "location-title",
						className: "text-lg font-semibold",
						children: "Delivery location"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "grid h-11 w-11 place-items-center rounded-full border border-line",
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: useGps,
					className: "mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand font-semibold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "size-4" }), " Use current location"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Area or pincode",
						className: "h-11 min-w-0 flex-1 rounded-full border border-line bg-cream px-4 text-sm"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: checkPincode,
						className: "h-11 rounded-full bg-ink px-4 text-sm font-semibold text-cream",
						children: "Check"
					})]
				}),
				message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-danger",
					children: message
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex gap-2",
					children: cities.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setCity(name),
						className: cn("h-9 rounded-full px-3 text-sm font-semibold", city === name ? "bg-ink text-cream" : "border border-line bg-cream"),
						children: name
					}, name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mt-4 h-52 overflow-hidden rounded-3xl bg-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "absolute top-3 left-3 text-xs font-medium text-cream/80",
						children: ["Service pins · ", city]
					}), pins.map((pin) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => choose(pin.id),
						className: "absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand px-2 py-1 text-xs font-bold text-ink",
						style: {
							left: `${pin.left}%`,
							top: `${pin.top}%`
						},
						children: pin.name
					}, pin.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 divide-y divide-line",
					children: [filtered.map((area) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => choose(area.id),
						className: "flex w-full items-center justify-between py-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-semibold",
							children: area.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm text-muted",
							children: [
								area.city,
								" · ",
								area.pincode
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-semibold",
							children: "Select"
						})]
					}) }, area.id)), filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "py-4 text-sm text-muted",
						children: "No matching area."
					}) : null]
				})
			]
		})
	});
}
function Home() {
	const { catalog, error, loading, reload } = useCatalog();
	const place = usePlace();
	const [open, setOpen] = (0, import_react.useState)(false);
	const introSeen = useCart((state) => state.introSeen);
	const dismissIntro = useCart((state) => state.dismissIntro);
	const setCoupon = useCart((state) => state.setCoupon);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: loading || !catalog ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-4 h-11 w-56 animate-pulse rounded-full bg-line" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonRows, {}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 rounded-3xl border border-line bg-cream p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: "The store did not load."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: reload,
					className: "mt-3 h-11 rounded-full bg-brand px-4 font-semibold",
					children: "Try again"
				})
			]
		}) : null
	] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationButton, {
				catalog,
				onOpen: () => setOpen(true)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: catalog.settings.tagline
			})]
		}),
		!place.serviceable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 rounded-3xl bg-ink p-4 text-cream",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-semibold",
				children: [
					"MehraIT is not in ",
					place.pincode || "this pin",
					" yet."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-cream/80",
				children: "We deliver across parts of Bengaluru and Mumbai. Pick a live area to shop."
			})]
		}) : null,
		!introSeen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex items-start justify-between gap-3 rounded-3xl bg-brand p-4 text-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-wide uppercase",
				children: "Shop smart · Live better"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-lg font-semibold",
				children: [
					"Daily essentials from a store near you, in about ",
					catalog.settings.promise,
					"."
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: dismissIntro,
				className: "h-9 shrink-0 rounded-full bg-ink px-3 text-sm font-semibold text-cream",
				children: "Got it"
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rail mt-4 flex gap-3 overflow-x-auto pb-1",
			children: catalog.banners.map((banner) => {
				const slug = banner.href.startsWith("/c/") ? banner.href.slice(3) : "";
				const className = cn("block w-72 shrink-0 snap-start rounded-3xl p-5", banner.tone === "ink" && "bg-ink text-cream", banner.tone === "cream" && "border border-line bg-cream text-ink", banner.tone !== "ink" && banner.tone !== "cream" && "bg-brand text-ink");
				const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-wide uppercase opacity-70",
						children: catalog.settings.promise
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 text-2xl font-extrabold tracking-tight",
						children: banner.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm opacity-80",
						children: banner.subtitle
					})
				] });
				return slug ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/c/$slug",
					params: { slug },
					className,
					children: inner
				}, banner.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className,
					children: inner
				}, banner.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/search",
			className: "mt-4 flex h-12 items-center rounded-full border border-line bg-cream px-4 text-sm text-muted md:hidden",
			children: "Search milk, atta, bananas"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Categories"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/categories",
					className: "text-sm font-semibold",
					children: "See all"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-4 gap-3 md:grid-cols-8",
				children: catalog.categories.filter((category) => category.parentId == null).map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/c/$slug",
					params: { slug: category.slug },
					className: "text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
							slug: category.slug,
							className: "size-6"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-2 block text-xs leading-4 font-medium",
						children: category.name
					})]
				}, category.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
			title: "Bestsellers",
			catalog,
			products: catalog.products.filter((product) => product.bestseller),
			placeStore: place.storeId
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
			title: "Featured",
			catalog,
			products: catalog.products.filter((product) => product.featured),
			placeStore: place.storeId
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: "Offers"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-3 md:grid-cols-2",
				children: catalog.coupons.map((coupon) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setCoupon(coupon.code),
					className: "rounded-3xl border border-line bg-cream p-4 text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-wide text-muted uppercase",
							children: "Tap to apply"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-lg font-extrabold",
							children: coupon.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: coupon.description
						})
					]
				}, coupon.code))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
			className: "mt-10 border-t border-line pt-4 text-sm text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold text-ink",
					children: catalog.settings.businessName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1",
					children: catalog.settings.tagline
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1",
					children: [
						"Care ",
						catalog.settings.supportPhone,
						" · ",
						catalog.settings.supportEmail
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1",
					children: ["GSTIN ", catalog.settings.gstin]
				})
			]
		}),
		open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationSheet, {
			catalog,
			onClose: () => setOpen(false)
		}) : null
	] }) });
}
function Rail({ title, products, catalog, placeStore }) {
	if (!products || !Array.isArray(products) || products.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rail mt-3 flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible",
			children: products.map((product) => {
				const root = rootCategory(catalog.categories, product.categoryId);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
					product,
					slug: root?.slug ?? "snacks",
					storeId: placeStore
				}, product.id);
			})
		})]
	});
}
//#endregion
export { Home as component };
