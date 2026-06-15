import { useState } from 'react'
import type { Habit, NewHabit } from '../types'

const COLORS = ['green', 'blue', 'purple', 'orange', 'pink']

const COLOR_CLASSES: Record<string, string> = {
  green:  'bg-green-500',
  blue:   'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink:   'bg-pink-500',
}

interface Props {
  initial?: Habit
  onSubmit: (data: NewHabit) => Promise<void>
  onCancel: () => void
}

export default function HabitForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [color, setColor] = useState(initial?.color ?? 'green')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError('')
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || null, color })
    } catch {
      setError('Ocurrió un error. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del hábito *
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Leer 30 minutos"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción (opcional)
        </label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ej: Antes de dormir"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <div className="flex gap-2">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full ${COLOR_CLASSES[c]} transition-transform ${
                color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'
              }`}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear hábito'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
