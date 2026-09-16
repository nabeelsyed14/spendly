import { useMemo } from 'react';

const GRADIENTS = [
  ['#0d9488', '#0f766e'],
  ['#6366f1', '#4f46e5'],
  ['#ec4899', '#db2777'],
  ['#f59e0b', '#d97706'],
  ['#3b82f6', '#2563eb'],
  ['#8b5cf6', '#7c3aed'],
  ['#ef4444', '#dc2626'],
  ['#22c55e', '#16a34a'],
  ['#14b8a6', '#0d9488'],
  ['#f97316', '#ea580c'],
  ['#0ea5e9', '#0284c7'],
  ['#d946ef', '#c026d3'],
];

function hashName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getGradient(name) {
  const idx = hashName(name || 'User') % GRADIENTS.length;
  return GRADIENTS[idx];
}

export default function Avatar({ name = 'User', photo = null, size = 40, className = '' }) {
  const initials = useMemo(() => getInitials(name), [name]);
  const [c1, c2] = useMemo(() => getGradient(name), [name]);

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        fontSize: size * 0.38,
        letterSpacing: '-0.02em',
        boxShadow: `0 2px 8px ${c1}30`,
      }}
    >
      {initials}
    </div>
  );
}

export { GRADIENTS, getGradient, getInitials };
