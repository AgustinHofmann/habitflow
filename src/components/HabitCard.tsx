import type { Habit } from '../types'

const COLORS: Record<string, string> = {
  green:  'bg-green-100 border-green-300',
  blue:   'bg-blue-100 border-blue-300',
  purple: 'bg-purple-100 border-purple-300',
  orange: 'bg-orange-100 border-orange-300',
  pink:   'bg-pink-100 border-pink-300',
}

const DOT_COLORS: Record<string, string> = {
  green:  'bg-green-500',
  blue:   'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink:   'bg-pink-500',
}

interface Props {
  habit: Habit
  completed: boolean
  onToggle: (habitId: string) => void
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
}

export default function HabitCard({ habit, completed, onToggle, onEdit, onDelete }: Props) {
  const colorClass = COLORS[habit.color] ?? COLORS.green
  const dotClass   = DOT_COLORS[habit.color] ?? DOT_COLORS.green

  return (
    <div className={`border rounded-xl p-4 flex items-center gap-4 transition-opacity ${colorClass} ${completed ? 'opacity-60' : ''}`}>
      <button
        onClick={() => onToggle(habit.id)}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          completed
            ? `${dotClass} border-transparent`
            : 'border-gray-400 bg-white hover:border-gray-600'
        }`}
      >
        {completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {habit.name}
        </p>
        {habit.description && (
          <p className="text-sm text-gray-500 truncate">{habit.description}</p>
        )}
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onEdit(habit)}
          className="text-gray-400 hover:text-gray-700 transition-colors text-sm"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          className="text-gray-400 hover:text-red-500 transition-colors text-sm"
        >
          Borrar
        </button>
      </div>
    </div>
  )
}
