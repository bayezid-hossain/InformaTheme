export const WALLPAPER_FILTERS = [
  { id: 'original', name: 'None',   color: null,      opacity: 0    },
  { id: 'warm',     name: 'Warm',   color: '#FF8C42', opacity: 0.22 },
  { id: 'cool',     name: 'Cool',   color: '#3B82F6', opacity: 0.22 },
  { id: 'dusk',     name: 'Dusk',   color: '#7C3AED', opacity: 0.28 },
  { id: 'mono',     name: 'Mono',   color: '#1F2937', opacity: 0.65 },
  { id: 'forest',   name: 'Forest', color: '#15803D', opacity: 0.28 },
  { id: 'ocean',    name: 'Ocean',  color: '#0369A1', opacity: 0.28 },
  { id: 'night',    name: 'Night',  color: '#030712', opacity: 0.55 },
  { id: 'golden',   name: 'Golden', color: '#D97706', opacity: 0.28 },
  { id: 'rose',     name: 'Rose',   color: '#BE185D', opacity: 0.22 },
] as const;

export type WallpaperFilterId = (typeof WALLPAPER_FILTERS)[number]['id'];

export function getFilterOverlay(filterId: WallpaperFilterId): { color: string; opacity: number } | null {
  const f = WALLPAPER_FILTERS.find(x => x.id === filterId);
  if (!f || !f.color) return null;
  return { color: f.color, opacity: f.opacity };
}
