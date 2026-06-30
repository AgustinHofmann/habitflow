// PR de prueba: este test FALLA a proposito para demostrar que el pipeline de CI
// frena el merge cuando un test no pasa. Este branch NO se mergea a main.
import { describe, it, expect } from 'vitest'
import { completionRate } from './stats'

describe('demo: el pipeline debe frenar esto', () => {
  it('falla a proposito (7 de 7 dias es 100%, no 50%)', () => {
    expect(completionRate(7, 7)).toBe(50)
  })
})
