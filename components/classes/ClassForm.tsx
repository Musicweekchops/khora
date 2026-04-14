"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Student {
  id: string
  name: string
  email: string
  modalidad: string | null
}

export default function ClassForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    studentId: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    modalidad: "online",
    isTrialClass: false
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students")
      if (response.ok) {
        const data = await response.json()
        const formattedStudents = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          modalidad: s.modalidad
        }))
        setStudents(formattedStudents)
      }
    } catch (error) {
      console.error("Error al cargar alumnos:", error)
    }
  }

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId)
    setFormData({
      ...formData,
      studentId,
      modalidad: student?.modalidad || "online"
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Combinar fecha y hora
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)

      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId: formData.studentId,
          scheduledDate: scheduledDateTime.toISOString(),
          duration: formData.duration,
          modalidad: formData.modalidad,
          isTrialClass: formData.isTrialClass
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al crear la clase")
        return
      }

      // Redirigir a la lista de clases
      router.push("/dashboard/clases")
      router.refresh()

    } catch (error) {
      setError("Error al crear la clase")
    } finally {
      setLoading(false)
    }
  }

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Información de la Clase
        </h3>
        
        <div className="space-y-4">
          {/* Alumno */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alumno *
            </label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar alumno...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              required
              min={today}
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora *
            </label>
            <input
              type="time"
              required
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración (minutos)
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos (1 hora)</option>
              <option value={90}>90 minutos (1.5 horas)</option>
              <option value={120}>120 minutos (2 horas)</option>
            </select>
          </div>

          {/* Modalidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modalidad
            </label>
            <select
              value={formData.modalidad}
              onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="online">📹 Online</option>
              <option value="presencial">🎓 Presencial</option>
            </select>
          </div>

          {/* Clase de Prueba */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isTrialClass"
              checked={formData.isTrialClass}
              onChange={(e) => setFormData({ ...formData, isTrialClass: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isTrialClass" className="ml-2 text-sm text-gray-700">
              Esta es una clase de prueba
            </label>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Agendando..." : "Agendar Clase"}
        </button>
      </div>
    </form>
  )
}
