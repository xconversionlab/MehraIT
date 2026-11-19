import type { Area, Store } from "./types";

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const r = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function nearestArea(areas: Area[], stores: Store[], lat: number, lng: number) {
  let best: { area: Area; store: Store; km: number } | null = null;
  for (const area of areas) {
    const store = stores.find((s) => s.id === area.storeId);
    if (!store) continue;
    const km = haversineKm(lat, lng, area.lat, area.lng);
    if (km > store.radiusKm) continue;
    if (!best || km < best.km) best = { area, store, km };
  }
  return best;
}

export function pinLayout(areas: Area[]) {
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
    left: 14 + ((area.lng - minLng) / lngSpan) * 72,
    top: 16 + ((maxLat - area.lat) / latSpan) * 68,
  }));
}
