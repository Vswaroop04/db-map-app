export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

export function categoryEmoji(category: string | null): string {
  if (!category) return '📍';
  const c = category.toLowerCase();
  if (c.includes('museum')) return '🏛️';
  if (c.includes('park') || c.includes('garden') || c.includes('national')) return '🌳';
  if (c.includes('church') || c.includes('cathedral') || c.includes('mosque') || c.includes('temple')) return '⛪';
  if (c.includes('castle') || c.includes('palace')) return '🏰';
  if (c.includes('bridge')) return '🌉';
  if (c.includes('monument') || c.includes('memorial')) return '🗿';
  if (c.includes('square') || c.includes('plaza')) return '🏙️';
  if (c.includes('stadium') || c.includes('arena')) return '🏟️';
  if (c.includes('attraction') || c.includes('sight') || c.includes('tourism')) return '🎯';
  if (c.includes('entertainment')) return '🎭';
  if (c.includes('beach') || c.includes('lake') || c.includes('river')) return '🏖️';
  return '📍';
}
