export type FontId = 'stencil' | 'mono' | 'modern' | 'bebas' | 'orbitron' | 'playfair' | 'raleway' | 'josefin';

export interface FontDef {
  id: FontId;
  name: string;
  fontFamily: string;
  fontWeight?: string;
  assetFile: string;
  clockSize: number;
  clockTracking: number;
}

export const FONTS: FontDef[] = [
  { id: 'stencil',  name: 'Stencil',  fontFamily: 'SirinStencil_400Regular',  assetFile: 'SirinStencil_400Regular.ttf',  clockSize: 68, clockTracking: 2 },
  { id: 'mono',     name: 'Mono',     fontFamily: 'SpaceMono_700Bold',         assetFile: 'SpaceMono_700Bold.ttf',         clockSize: 60, clockTracking: -2 },
  { id: 'modern',   name: 'Modern',   fontFamily: 'SpaceGrotesk_700Bold',      assetFile: 'SpaceGrotesk_700Bold.ttf',      clockSize: 64, clockTracking: -3 },
  { id: 'bebas',    name: 'Bebas',    fontFamily: 'BebasNeue_400Regular',      assetFile: 'BebasNeue_400Regular.ttf',      clockSize: 74, clockTracking: 3 },
  { id: 'orbitron', name: 'Orbitron', fontFamily: 'Orbitron_700Bold',          assetFile: 'Orbitron_700Bold.ttf',          clockSize: 52, clockTracking: 0, fontWeight: '700' },
  { id: 'playfair', name: 'Elegant',  fontFamily: 'PlayfairDisplay_700Bold',   assetFile: 'PlayfairDisplay_700Bold.ttf',   clockSize: 64, clockTracking: -1, fontWeight: '700' },
  { id: 'raleway',  name: 'Light',    fontFamily: 'Raleway_300Light',          assetFile: 'Raleway_300Light.ttf',          clockSize: 66, clockTracking: 4, fontWeight: '300' },
  { id: 'josefin',  name: 'Josefin',  fontFamily: 'JosefinSans_600SemiBold',   assetFile: 'JosefinSans_600SemiBold.ttf',   clockSize: 62, clockTracking: 5, fontWeight: '600' },
];

export const DEFAULT_FONT_ID: FontId = 'stencil';

export function getFontDef(id: FontId): FontDef {
  return FONTS.find(f => f.id === id) ?? FONTS[0];
}
