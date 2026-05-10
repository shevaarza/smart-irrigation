type SensorCardProps = {
  label: string
  value: string | number
  unit?: string
  color?: string
  sub?: string
}

export default function SensorCard({
  label,
  value,
  unit = '',
  color = 'blue',
  sub,
}: SensorCardProps) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 border-green-100 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    red: 'bg-red-50 border-red-100 text-red-700',
  }

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${colors[color] || colors.blue}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>

      <div className="mt-3 flex items-end gap-1">
        <p className="text-2xl font-bold">{value}</p>
        {unit && <span className="text-sm mb-1">{unit}</span>}
      </div>

      {sub && <p className="text-xs mt-2 opacity-70">{sub}</p>}
    </div>
  )
}