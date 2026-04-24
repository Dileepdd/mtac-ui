const COLOR_PALETTE = [
  "#4f46e5","#7c3aed","#059669","#b45309","#be123c","#0891b2","#c2410c","#15803d",
];

export function idToColor(id: string, idx?: number): string {
  if (idx !== undefined) return COLOR_PALETTE[idx % COLOR_PALETTE.length];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return COLOR_PALETTE[h % COLOR_PALETTE.length];
}

export function deriveKey(name: string): string {
  return name.split(/\s+/).map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 4);
}
