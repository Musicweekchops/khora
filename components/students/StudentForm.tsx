"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface StudentFormProps {
  mode: "create" | "edit"
  studentId?: string
}

export default function StudentForm({ mode, studentId }: StudentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "PROSPECT",
    leadSource: "",
    modalidad: "online",
    preferredDay: "",
    preferredTime: "",
    emergencyContact: "",
    emergencyPhone: ""
  })

  useEffect(() => {
    if (mode === "edit" && studentId) {
      fetchStudent()
    }
  }, [mode, studentId])

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "",
          password: "", // No mostramos la contraseña
          status: data.status,
          leadSource: data.leadSource || "",
          modalidad: data.modalidad || "online",
          preferredDay: data.preferredDay || "",
          preferredTime: data.preferredTime || "",
          emergencyContact: data.emergencyContact || "",
          emergencyPhone: data.emergencyPhone || ""
        })
      }
    } catch (error) {
      console.error("Error al cargar alumno:", error)
      setError("Error al cargar los datos del alumno")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const url = mode === "create" 
        ? "/api/students"
        : `/api/students/${studentId}`
      
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al guardar el alumno")
        return
      }

      // Redirigir a la lista de alumnos
      router.push("/dashboard/alumnos")
      router.refresh()

    } catch (error) {
      setError("Error al guardar el alumno")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Información Básica
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="juan@email.com"
              disabled={mode === "edit"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+56912345678"
            />
          </div>

          {mode === "create" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Inicial
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Dejar vacío para auto-generar"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si no se proporciona, se generará automáticamente
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Estado y Origen */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Estado y Origen
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PROSPECT">Prospecto</option>
              <option value="TRIAL">Clase de Prueba</option>
              <option value="ACTIVE">Activo</option>
              <option value="PAUSED">Pausado</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuente de Lead
            </label>
            <select
              value={formData.leadSource}
              onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar...</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="GOOGLE">Google</option>
              <option value="REFERRAL">Referido</option>
              <option value="WEBSITE">Sitio Web</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preferencias de Clase */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Preferencias de Clase
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modalidad
            </label>
            <select
              value={formData.modalidad}
              onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Día Preferido
            </label>
            <select
              value={formData.preferredDay}
              onChange={(e) => setFormData({ ...formData, preferredDay: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar...</option>
              <option value="Monday">Lunes</option>
              <option value="Tuesday">Martes</option>
              <option value="Wednesday">Miércoles</option>
              <option value="Thursday">Jueves</option>
              <option value="Friday">Viernes</option>
              <option value="Saturday">Sábado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora Preferida
            </label>
            <input
              type="time"
              value={formData.preferredTime}
              onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contacto de Emergencia */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Contacto de Emergencia (Opcional)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="María Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+56987654321"
            />
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
          {loading 
            ? (mode === "create" ? "Creando..." : "Guardando...") 
            : (mode === "create" ? "Crear Alumno" : "Guardar Cambios")
          }
        </button>
      </div>
    </form>
  )
}
