import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import HabitCard from '../components/HabitCard'
import HabitForm from '../components/HabitForm'
import type { Habit, NewHabit } from '../types'

const TODAY = new Date().toISOString().split('T')[0]

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function Dashboard() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [loading, setLoading] = useState(true)

  const todayLabel = (() => {
    const d = new Date()
    return `${DAYS_ES[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`
  })()

  useEffect(() => {
    if (user) fetchAll()
  }, [user])

  const fetchAll = async () => {
    setLoading(true)
    const [habitsRes, completionsRes] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', user!.id).order('created_at'),
      supabase.from('habit_completions').select('habit_id').eq('user_id', user!.id).eq('completed_date', TODAY),
    ])
    if (habitsRes.data) setHabits(habitsRes.data)
    if (completionsRes.data) setCompletedIds(new Set(completionsRes.data.map(c => c.habit_id)))
    setLoading(false)
  }

  const handleToggle = async (habitId: string) => {
    const isDone = completedIds.has(habitId)

    if (isDone) {
      await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', user!.id)
        .eq('completed_date', TODAY)
      setCompletedIds(prev => { const s = new Set(prev); s.delete(habitId); return s })
    } else {
      await supabase
        .from('habit_completions')
        .insert({ habit_id: habitId, user_id: user!.id, completed_date: TODAY })
      setCompletedIds(prev => new Set(prev).add(habitId))
    }
  }

  const handleCreate = async (data: NewHabit) => {
    const { data: created, error } = await supabase
      .from('habits')
      .insert({ ...data, user_id: user!.id })
      .select()
      .single()

    if (!error && created) {
      setHabits(prev => [...prev, created])
      setShowForm(false)
    }
  }

  const handleEdit = async (data: NewHabit) => {
    if (!editingHabit) return

    const { data: updated, error } = await supabase
      .from('habits')
      .update(data)
      .eq('id', editingHabit.id)
      .select()
      .single()

    if (!error && updated) {
      setHabits(prev => prev.map(h => h.id === updated.id ? updated : h))
      setEditingHabit(null)
    }
  }

  const handleDelete = async (habitId: string) => {
    if (!confirm('¿Seguro que querés borrar este hábito?')) return
    const { error } = await supabase.from('habits').delete().eq('id', habitId)
    if (!error) setHabits(prev => prev.filter(h => h.id !== habitId))
  }

  const completedCount = habits.filter(h => completedIds.has(h.id)).length
  const progress = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-1">{todayLabel}</p>
        <h1 className="text-2xl font-bold text-gray-900">Mis hábitos</h1>
      </div>

      {/* Progress */}
      {habits.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progreso de hoy</span>
            <span className="font-medium text-gray-800">{completedCount} / {habits.length}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && (
            <p className="text-sm text-green-600 font-medium mt-2">¡Completaste todos los hábitos de hoy!</p>
          )}
        </div>
      )}

      {/* Habit list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">Todavía no tenés hábitos</p>
          <p className="text-sm">Creá el primero para empezar</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              completed={completedIds.has(habit.id)}
              onToggle={handleToggle}
              onEdit={h => setEditingHabit(h)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add button */}
      {!showForm && !editingHabit && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-400 hover:border-green-400 hover:text-green-600 transition-colors"
        >
          + Nuevo hábito
        </button>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium mb-4">Nuevo hábito</h3>
          <HabitForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Edit form */}
      {editingHabit && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium mb-4">Editar hábito</h3>
          <HabitForm initial={editingHabit} onSubmit={handleEdit} onCancel={() => setEditingHabit(null)} />
        </div>
      )}
    </div>
  )
}
