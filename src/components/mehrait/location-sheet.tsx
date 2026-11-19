import { LocateFixed, X } from "lucide-react";
import { useMemo, useState } from "react";
import { nearestArea, pinLayout } from "@/lib/mehrait/geo";
import { usePlace } from "@/lib/mehrait/cart-store";
import type { Catalog } from "@/lib/mehrait/types";
import { cn } from "@/lib/utils";

export function LocationButton({ catalog, onOpen }: { catalog: Catalog; onOpen: () => void }) {
  const place = usePlace();
  const store = catalog.stores.find((item) => item.id === place.storeId);
  return (
    <button type="button" onClick={onOpen} className="flex h-11 max-w-full items-center gap-2 rounded-full border border-line bg-cream px-3 text-left">
      <LocateFixed className="size-4 shrink-0" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">
          {place.serviceable ? place.label : "Outside the delivery area"}
        </span>
        <span className="block truncate text-xs text-muted">
          {place.serviceable ? `${catalog.settings.promise} · ${store?.name ?? place.city}` : "Pick a serviceable pincode"}
        </span>
      </span>
    </button>
  );
}

export function LocationSheet({ catalog, onClose }: { catalog: Catalog; onClose: () => void }) {
  const setPlace = usePlace((state) => state.setPlace);
  const [city, setCity] = useState(catalog.areas[0]?.city ?? "Bengaluru");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const cities = [...new Set(catalog.areas.map((area) => area.city))];
  const cityAreas = catalog.areas.filter((area) => area.city === city);
  const pins = useMemo(() => pinLayout(cityAreas), [cityAreas]);
  const filtered = cityAreas.filter((area) => {
    const hay = `${area.name} ${area.pincode}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  function choose(areaId: number) {
    const area = catalog.areas.find((item) => item.id === areaId);
    if (!area) return;
    const store = catalog.stores.find((item) => item.id === area.storeId);
    setPlace({
      areaId: area.id,
      storeId: area.storeId,
      label: area.name,
      city: area.city,
      pincode: area.pincode,
      serviceable: true,
      lat: area.lat,
      lng: area.lng,
    });
    onClose();
    void store;
  }

  function useGps() {
    if (!navigator.geolocation) {
      setMessage("This browser cannot share a location. Search your area instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
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
            lng: position.coords.longitude,
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
          lng: position.coords.longitude,
        });
        onClose();
      },
      () => setMessage("Location permission is off. Search your area instead."),
      { enableHighAccuracy: true, timeout: 8000 },
    );
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
        lng: null,
      });
      setMessage(`MehraIT is not in ${pin} yet. Try Indiranagar 560038 or Bandra West 400050.`);
      return;
    }
    choose(area.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 md:items-center" role="dialog" aria-modal="true" aria-labelledby="location-title">
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper p-4 md:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 id="location-title" className="text-lg font-semibold">Delivery location</h2>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full border border-line" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <button type="button" onClick={useGps} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand font-semibold text-ink">
          <LocateFixed className="size-4" /> Use current location
        </button>
        <div className="mt-3 flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Area or pincode"
            className="h-11 min-w-0 flex-1 rounded-full border border-line bg-cream px-4 text-sm"
          />
          <button type="button" onClick={checkPincode} className="h-11 rounded-full bg-ink px-4 text-sm font-semibold text-cream">
            Check
          </button>
        </div>
        {message ? <p className="mt-2 text-sm text-danger">{message}</p> : null}
        <div className="mt-4 flex gap-2">
          {cities.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCity(name)}
              className={cn("h-9 rounded-full px-3 text-sm font-semibold", city === name ? "bg-ink text-cream" : "border border-line bg-cream")}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="relative mt-4 h-52 overflow-hidden rounded-3xl bg-ink">
          <p className="absolute top-3 left-3 text-xs font-medium text-cream/80">Service pins · {city}</p>
          {pins.map((pin) => (
            <button
              key={pin.id}
              type="button"
              onClick={() => choose(pin.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand px-2 py-1 text-xs font-bold text-ink"
              style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
            >
              {pin.name}
            </button>
          ))}
        </div>
        <ul className="mt-3 divide-y divide-line">
          {filtered.map((area) => (
            <li key={area.id}>
              <button type="button" onClick={() => choose(area.id)} className="flex w-full items-center justify-between py-3 text-left">
                <span>
                  <span className="block font-semibold">{area.name}</span>
                  <span className="text-sm text-muted">{area.city} · {area.pincode}</span>
                </span>
                <span className="text-sm font-semibold">Select</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 ? <li className="py-4 text-sm text-muted">No matching area.</li> : null}
        </ul>
      </div>
    </div>
  );
}
