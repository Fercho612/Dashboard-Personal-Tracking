// Paleta cerrada de colores para categorías, pensada para el tema oscuro.
// Las categorías guardan la CLAVE (p. ej. "indigo"), no el hex: si un tono se ajusta acá,
// todas las categorías que lo usan cambian solas.
export const PALETTE = {
  indigo: { label: 'Índigo', color: '#6366f1' },
  emerald: { label: 'Esmeralda', color: '#10b981' },
  amber: { label: 'Ámbar', color: '#f59e0b' },
  coral: { label: 'Coral', color: '#f43f5e' },
  sky: { label: 'Celeste', color: '#0ea5e9' },
  violet: { label: 'Violeta', color: '#a855f7' },
  pink: { label: 'Rosa', color: '#ec4899' },
  slate: { label: 'Pizarra', color: '#64748b' },
}

export const PALETTE_KEYS = Object.keys(PALETTE)

// Si una clave no existe (datos viejos o corruptos), usamos un gris neutro.
export function getCategoryColor(colorKey) {
  return (PALETTE[colorKey] ?? PALETTE.slate).color
}
