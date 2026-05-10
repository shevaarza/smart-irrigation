// src/components/StatsCard.tsx
'use client';

interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  color?: 'green' | 'blue' | 'amber' | 'gray';
  delay?: string;
}

const colorMap = {
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'bg-green-100',
    text: 'text-green-700',
    value: 'text-green-900',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'bg-blue-100',
    text: 'text-blue-700',
    value: 'text-blue-900',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'bg-amber-100',
    text: 'text-amber-700',
    value: 'text-amber-900',
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: 'bg-gray-100',
    text: 'text-gray-600',
    value: 'text-gray-900',
  },
};

export default function StatsCard({
  icon,
  label,
  value,
  sub,
  color = 'green',
  delay = '',
}: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={`${c.bg} border ${c.border} rounded-2xl p-4 card-hover animate-fade-in-up ${delay}`}
    >
      <div className="flex items-center gap-3">
        <div className={`${c.icon} w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wider ${c.text} truncate`}>
            {label}
          </p>
          <p className={`font-bold text-xl ${c.value} leading-tight`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
