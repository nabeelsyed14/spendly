import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const RES = join(root, 'android', 'app', 'src', 'main', 'res');

const GRADIENT = `
  <linearGradient id="bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
    <stop offset="0%" stop-color="#3a3a42"/>
    <stop offset="100%" stop-color="#17171c"/>
  </linearGradient>`;

const WALLET = `
  <rect x="7" y="9" width="18" height="14" rx="4" fill="#ffffff" opacity="0.9"/>
  <rect x="7" y="9" width="18" height="5" rx="4" fill="#ffffff"/>
  <rect x="17" y="13.5" width="6" height="5" rx="2.5" fill="url(#bg)"/>
  <circle cx="20" cy="16" r="1.5" fill="#ffffff"/>`;

function fullIconSvg(size, circle) {
  const bg = circle
    ? `<circle cx="16" cy="16" r="16" fill="url(#bg)"/>`
    : `<rect width="32" height="32" fill="url(#bg)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <defs>${GRADIENT}</defs>
  ${bg}
  ${WALLET}
</svg>`;
}

// Adaptive-icon foreground: transparent 108 canvas, wallet scaled so it stays
// inside the 66dp mask-safe circle (half-diagonal ~30 < 33).
function foregroundSvg(size) {
  const scale = 48 / 18; // glyph width 48 of 108 canvas
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 108 108">
  <defs>${GRADIENT}</defs>
  <g transform="translate(54,54) scale(${scale}) translate(-16,-16)">
    ${WALLET}
  </g>
</svg>`;
}

function splashSvg(width, height) {
  const tile = Math.round(Math.min(width, height) * 0.3);
  const x = Math.round((width - tile) / 2);
  const y = Math.round((height - tile) / 2);
  const unit = tile / 32;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#0d0a14"/>
  <defs>${GRADIENT}</defs>
  <g transform="translate(${x},${y}) scale(${unit})">
    <rect width="32" height="32" rx="8" fill="url(#bg)"/>
    ${WALLET}
  </g>
</svg>`;
}

function render(svg, width) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
  return resvg.render().asPng();
}

function write(relPath, buffer) {
  const abs = join(RES, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, buffer);
  console.log('wrote', relPath);
}

function pngSize(absPath) {
  const buf = readFileSync(absPath);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

for (const [density, mult] of Object.entries(DENSITIES)) {
  const iconSize = Math.round(48 * mult);
  const fgSize = Math.round(108 * mult);
  write(`mipmap-${density}/ic_launcher.png`, render(fullIconSvg(iconSize, false), iconSize));
  write(`mipmap-${density}/ic_launcher_round.png`, render(fullIconSvg(iconSize, true), iconSize));
  write(`mipmap-${density}/ic_launcher_foreground.png`, render(foregroundSvg(fgSize), fgSize));
}

// Rebrand splash PNGs at their existing dimensions (keeps layout untouched)
const splashFiles = [
  'drawable/splash.png',
  'drawable-land-hdpi/splash.png',
  'drawable-land-mdpi/splash.png',
  'drawable-land-xhdpi/splash.png',
  'drawable-land-xxhdpi/splash.png',
  'drawable-land-xxxhdpi/splash.png',
  'drawable-port-hdpi/splash.png',
  'drawable-port-mdpi/splash.png',
  'drawable-port-xhdpi/splash.png',
  'drawable-port-xxhdpi/splash.png',
  'drawable-port-xxxhdpi/splash.png',
];
for (const rel of splashFiles) {
  const abs = join(RES, rel);
  if (!existsSync(abs)) {
    console.log('skip (missing)', rel);
    continue;
  }
  const { width, height } = pngSize(abs);
  write(rel, render(splashSvg(width, height), width));
}

console.log('done');
