// Build a translucent version of any CSS colour (hex or var()) without
// string-concatenating alpha suffixes, which break for var() colours.
export function tint(color, pct = 8) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}
