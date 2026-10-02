export const PALETTES = [
  {
    id: 'violet',
    name: 'Violet',
    colors: {
      50: '#ede9fe', 100: '#ddd6fe', 200: '#c4b5fd', 300: '#a78bfa', 400: '#8b5cf6',
      500: '#7c3aed', 600: '#6d28d9', 700: '#5b21b6', 800: '#4c1d95', 900: '#3b0764',
    },
    rgb: '109, 40, 217',
    btn: ['#6d28d9', '#5b21b6'],
    btnHover: ['#5b21b6', '#4c1d95'],
    edge: '#4c1d95',
    hero: ['#6d28d9', '#5b21b6', '#4c1d95'],
    accent1: '236, 72, 153',
    accent2: '124, 58, 237',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    colors: {
      50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
      500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b',
    },
    rgb: '5, 150, 105',
    btn: ['#047857', '#065f46'],
    btnHover: ['#065f46', '#064e3b'],
    edge: '#064e3b',
    hero: ['#047857', '#065f46', '#064e3b'],
    accent1: '20, 184, 166',
    accent2: '190, 242, 100',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
      500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
    },
    rgb: '37, 99, 235',
    btn: ['#1d4ed8', '#1e40af'],
    btnHover: ['#1e40af', '#1e3a8a'],
    edge: '#172554',
    hero: ['#1d4ed8', '#1e40af', '#1e3a8a'],
    accent1: '56, 189, 248',
    accent2: '99, 102, 241',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
      500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12',
    },
    rgb: '234, 88, 12',
    btn: ['#ea580c', '#c2410c'],
    btnHover: ['#c2410c', '#9a3412'],
    edge: '#7c2d12',
    hero: ['#ea580c', '#c2410c', '#9a3412'],
    accent1: '251, 191, 36',
    accent2: '244, 63, 94',
  },
  {
    id: 'rose',
    name: 'Rose',
    colors: {
      50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
      500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337',
    },
    rgb: '225, 29, 72',
    btn: ['#be123c', '#9f1239'],
    btnHover: ['#9f1239', '#881337'],
    edge: '#4c0519',
    hero: ['#be123c', '#9f1239', '#881337'],
    accent1: '251, 113, 133',
    accent2: '168, 85, 247',
  },
];

export const DEFAULT_PALETTE_ID = 'violet';

export function getPalette(id) {
  return PALETTES.find(p => p.id === id) || PALETTES[0];
}
