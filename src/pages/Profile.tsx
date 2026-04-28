import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

// TODO: agregar edicion de nombre y foto de perfil
export default function Profile() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mi perfil</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Email</p>
        <p className="font-medium">{user?.email}</p>
        {/* WIP: form de edicion */}
      </div>
    </div>
  )
}
