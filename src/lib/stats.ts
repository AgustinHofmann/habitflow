// Logica de negocio de las estadisticas, extraida como funciones puras para poder testearla.
// (Antes vivia dentro de Stats.tsx; se movio aca sin cambiar el comportamiento.)

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

/** Fechas ISO (YYYY-MM-DD) de los ultimos 7 dias, terminando en `today` (incluido). */
export function getLast7Days(today: Date = new Date()): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

/** Etiqueta del dia de la semana (en espanol) para una fecha ISO. */
export function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return DAYS_ES[d.getDay()]
}

/**
 * Racha actual: cantidad de dias consecutivos completados contando hacia atras
 * desde `today`. Corta en el primer dia sin completar (si hoy no esta, la racha es 0).
 */
export function currentStreak(completedDays: Set<string>, today: Date = new Date()): number {
  let streak = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    if (completedDays.has(key)) streak++
    else break
  }
  return streak
}

/** Porcentaje de cumplimiento: dias completados sobre el total de dias (0 si no hay dias). */
export function completionRate(completedCount: number, totalDays: number): number {
  if (totalDays <= 0) return 0
  return Math.round((completedCount / totalDays) * 100)
}
