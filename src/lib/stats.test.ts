import { describe, it, expect } from 'vitest'
import { currentStreak, completionRate, getLast7Days } from './stats'

const iso = (d: Date) => d.toISOString().split('T')[0]
function daysBefore(today: Date, n: number): string {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return iso(d)
}

describe('completionRate', () => {
  it('redondea el porcentaje de dias completados', () => {
    expect(completionRate(3, 7)).toBe(43)
    expect(completionRate(7, 7)).toBe(100)
    expect(completionRate(0, 7)).toBe(0)
  })

  it('devuelve 0 cuando no hay dias considerados', () => {
    expect(completionRate(5, 0)).toBe(0)
  })
})

describe('currentStreak', () => {
  // Fecha fija (mediodia para evitar corrimientos por zona horaria) -> test determinista.
  const today = new Date('2026-06-30T12:00:00')

  it('cuenta los dias consecutivos completados hacia atras desde hoy', () => {
    const completed = new Set([daysBefore(today, 0), daysBefore(today, 1), daysBefore(today, 2)])
    expect(currentStreak(completed, today)).toBe(3)
  })

  it('corta la racha en el primer dia sin completar', () => {
    const completed = new Set([daysBefore(today, 0), daysBefore(today, 2), daysBefore(today, 3)])
    expect(currentStreak(completed, today)).toBe(1)
  })

  it('es 0 si hoy no esta completado', () => {
    const completed = new Set([daysBefore(today, 1), daysBefore(today, 2)])
    expect(currentStreak(completed, today)).toBe(0)
  })
})

describe('getLast7Days', () => {
  it('devuelve 7 fechas consecutivas terminando hoy', () => {
    const days = getLast7Days(new Date('2026-06-30T12:00:00'))
    expect(days).toHaveLength(7)
    expect(days[6]).toBe('2026-06-30')
    expect(days[0]).toBe('2026-06-24')
  })
})
