import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// TODO: terminar graficos de progreso semanal
export default function Stats() {
  const { user } = useAuth()
  const [weekData, setWeekData] = useState<number[]>([])

  useEffect(() => {
    // WIP: traer completions de los ultimos 7 dias
  }, [user])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Estadísticas</h1>
      <p className="text-gray-400">Próximamente...</p>
    </div>
  )
}
