export interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  created_at: string
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
}

export type NewHabit = Omit<Habit, 'id' | 'user_id' | 'created_at'>
