import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Habit } from '../types'
import { getLast7Days, getDayLabel, currentStreak, completionRate } from '../lib/stats'

interface HabitStat {
  habit: Habit
  completedDays: Set<string>
  streak: number
  rate: number
}

export default function Stats() {
  const { user } = useAuth()
  const [habitStats, setHabitStats] = useState<HabitStat[]>([])
  const [dailyCounts, setDailyCounts] = useState<Record<string, number>>({})
  const [totalHabits, setTotalHabits] = useState(0)
  const [loading, setLoading] = useState(true)

  const last7 = getLast7Days()

  useEffect(() => {
    if (!user) return
    fetchStats()
  }, [user])

  async function fetchStats() {
    setLoading(true)

    const [habitsRes, completionsRes] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', user!.id),
      supabase
        .from('habit_completions')
        .select('habit_id, completed_date')
        .eq('user_id', user!.id)
        .gte('completed_date', last7[0]),
    ])

    const habits: Habit[] = habitsRes.data ?? []
    const completions: { habit_id: string; completed_date: string }[] = completionsRes.data ?? []

    setTotalHabits(habits.length)

    // Por día: cuántos hábitos se completaron
    const byDay: Record<string, Set<string>> = {}
    for (const day of last7) byDay[day] = new Set()
    for (const c of completions) {
      if (byDay[c.completed_date]) byDay[c.completed_date].add(c.habit_id)
    }
    const counts: Record<string, number> = {}
    for (const day of last7) counts[day] = byDay[day].size
    setDailyCounts(counts)

    // Por hábito: días completados + racha actual
    const stats: HabitStat[] = habits.map(habit => {
      const completedDays = new Set(
        completions.filter(c => c.habit_id === habit.id).map(c => c.completed_date)
      )

      const streak = currentStreak(completedDays)
      const rate = completionRate(completedDays.size, last7.length)

      return { habit, completedDays, streak, rate }
    })

    setHabitStats(stats)
    setLoading(false)
  }

  const maxCount = Math.max(...Object.values(dailyCounts), 1)
  const totalCompletionsThisWeek = Object.values(dailyCounts).reduce((a, b) => a + b, 0)
  const bestDay = last7.reduce((best, day) =>
    (dailyCounts[day] ?? 0) > (dailyCounts[best] ?? 0) ? day : best, last7[0])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
      </div>
    )
  }

  if (totalHabits === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">
        <p className="text-lg mb-1">Todavía no tenés hábitos</p>
        <p className="text-sm">Creá algunos desde el dashboard para ver tus estadísticas.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Estadísticas</h1>
      <p className="text-sm text-gray-400 mb-8">Últimos 7 días</p>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalCompletionsThisWeek}</p>
          <p className="text-xs text-gray-400 mt-1">completions esta semana</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalHabits}</p>
          <p className="text-xs text-gray-400 mt-1">hábitos activos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{getDayLabel(bestDay)}</p>
          <p className="text-xs text-gray-400 mt-1">mejor día</p>
        </div>
      </div>

      {/* Gráfico de barras semanal */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Completions por día</h2>
        <div className="flex items-end gap-2 h-32">
          {last7.map(day => {
            const count = dailyCounts[day] ?? 0
            const height = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
            const isToday = day === new Date().toISOString().split('T')[0]
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400">{count > 0 ? count : ''}</span>
                <div className="w-full flex items-end" style={{ height: 96 }}>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${isToday ? 'bg-green-500' : 'bg-green-200'}`}
                    style={{ height: `${Math.max(height, count > 0 ? 8 : 2)}%` }}
                  />
                </div>
                <span className={`text-xs ${isToday ? 'font-semibold text-green-600' : 'text-gray-400'}`}>
                  {getDayLabel(day)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Por hábito */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Detalle por hábito</h2>
        <div className="space-y-4">
          {habitStats.map(({ habit, completedDays, streak, rate }) => (
            <div key={habit.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800 truncate">{habit.name}</span>
                <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                  {streak > 0 && (
                    <span className="text-xs text-orange-500 font-medium">🔥 {streak}d</span>
                  )}
                  <span className="text-xs text-gray-500">{rate}%</span>
                </div>
              </div>
              {/* Mini calendario de 7 días */}
              <div className="flex gap-1">
                {last7.map(day => (
                  <div
                    key={day}
                    title={day}
                    className={`flex-1 h-2 rounded-full ${completedDays.has(day) ? 'bg-green-500' : 'bg-gray-100'}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
