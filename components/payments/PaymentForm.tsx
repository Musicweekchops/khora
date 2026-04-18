"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"

interface Student {
  id: string
  name: string
  email: string
}

interface PaymentFormProps {
  preselectedStudentId?: string
}

export default function PaymentForm({ preselectedStudentId }: PaymentFormProps) {
  const router = useRouter()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    studentId: preselectedStudentId || "",
    amount: "",
    description: "",
    method: "TRANSFER",
    status: "PAID",
    paidAt: new Date().toISOString().split("T")[0],
    dueDate: "",
    referenceNumber: "",
    notes: ""
  })

  useEffect(() => {
    if (profile?.teacherProfileId) {
      fetchStudents(profile.teacherProfileId)
    }
  }, [profile?.teacherProfileId])

  useEffect(() => {
    if (preselectedStudentId) {
      setFormData(prev => ({ ...prev, studentId: preselectedStudentId }))
    }
  }, [preselectedStudentId])

  const fetchStudents = async (teacherId: string) => {
    try {
      const { data, error } = await supabase
        .from('StudentProfile')
        .select('id, user:"User"(name, email)')
        .eq('teacherId', teacherId)
        .in('status', ['ACTIVE', 'TRIAL'])

      if (error) throw error

      const formattedStudents = (data || []).map((s: any) => ({
        id: s.id,
        name: s.user?.name || "Sin nombre",
        email: s.user?.email || ""
      }))
      setStudents(formattedStudents)
    } catch (error) {
      console.error("Error al cargar alumnos:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const amountFloat = parseFloat(formData.amount)
      
      const { data: payment, error: createError } = await supabase
        .from('Payment')
        .insert({
          studentId: formData.studentId,
          amount: amountFloat,
          description: formData.description,
          method: formData.method,
          status: formData.status,
          paidAt: formData.paidAt ? new Date(formData.paidAt).toISOString() : formData.status === "PAID" ? new Date().toISOString() : null,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          referenceNumber: formData.referenceNumber,
          notes: formData.notes,
          isAutomatic: false
        })
        .select()
        .single()

      if (createError) throw createError

      // Si el pago está pagado, actualizar el LTV del alumno
      if (formData.status === "PAID") {
        const { data: student } = await supabase
          .from('StudentProfile')
          .select('lifetimeValue')
          .eq('id', formData.studentId)
          .single()

        await supabase
          .from('StudentProfile')
          .update({
            lifetimeValue: (student?.lifetimeValue || 0) + amountFloat
          })
          .eq('id', formData.studentId)
      }

      router.push(`/dashboard/alumnos/${formData.studentId}`)
    } catch (error: any) {
      setError(error.message || "Error al registrar el pago")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Información del Pago
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
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!!preselectedStudentId}
            >
              <option value="">Seleccionar alumno...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.email}
                </option>
              ))}
            </select>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto (CLP) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="1000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="80000"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <select
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar...</option>
              <option value="Mensualidad">Mensualidad</option>
              <option value="Clase de Prueba">Clase de Prueba</option>
              <option value="Clase Individual">Clase Individual</option>
              <option value="Paquete de Clases">Paquete de Clases</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago *
            </label>
            <select
              required
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TRANSFER">Transferencia Bancaria</option>
              <option value="CASH">Efectivo</option>
              <option value="MERCADOPAGO">Mercado Pago</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Pago *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PAID">Pagado</option>
              <option value="PENDING">Pendiente</option>
              <option value="OVERDUE">Vencido</option>
            </select>
          </div>

          {/* Fecha de Pago */}
          {formData.status === "PAID" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Pago *
              </label>
              <input
                type="date"
                required
                value={formData.paidAt}
                onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Fecha de Vencimiento */}
          {formData.status !== "PAID" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Número de Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Comprobante / Referencia
            </label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 12345678"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Información adicional sobre el pago..."
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

      {/* Resumen */}
      {formData.amount && formData.studentId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Resumen del Pago:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Alumno:</strong> {students.find(s => s.id === formData.studentId)?.name || "N/A"}
            </p>
            <p>
              <strong>Monto:</strong> ${parseFloat(formData.amount || "0").toLocaleString()} CLP
            </p>
            <p>
              <strong>Método:</strong> {formData.method}
            </p>
            <p>
              <strong>Estado:</strong> {formData.status === "PAID" ? "Pagado" : "Pendiente"}
            </p>
          </div>
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
          {loading ? "Registrando..." : "Registrar Pago"}
        </button>
      </div>
    </form>
  )
}
