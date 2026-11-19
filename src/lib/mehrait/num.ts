export function num(v: unknown) {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : 0;
}

export function asBool(v: unknown) {
  return v === true || v === "t" || v === "true" || v === 1;
}
