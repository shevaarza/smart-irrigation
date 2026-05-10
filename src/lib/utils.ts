export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatTime(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function timeSince(dateStr: string): string {
  if (!dateStr) return '-';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}d yang lalu`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m yang lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}j yang lalu`;
  return `${Math.floor(seconds / 86400)}hr yang lalu`;
}

export function getSoilStatusColor(moisture: number): string {
  if (moisture < 30) return 'text-red-500';
  if (moisture < 60) return 'text-yellow-500';
  return 'text-green-500';
}

export function getSoilStatusLabel(moisture: number): string {
  if (moisture < 30) return 'Kering';
  if (moisture < 60) return 'Normal';
  return 'Lembap';
}

export function getRSSILabel(rssi: number): string {
  if (rssi > -50) return 'Excellent';
  if (rssi > -70) return 'Good';
  if (rssi > -80) return 'Fair';
  return 'Weak';
}

export function padZero(n: number): string {
  return n.toString().padStart(2, '0');
}
