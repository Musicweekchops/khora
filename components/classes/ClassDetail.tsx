"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EditClassModal from "./EditClassModal"
import WhatsAppButton from "@/components/ui/WhatsAppButton"

interface ClassData {
  id: string
  date: string
  startTime: string
  endTime: string
  duration: number
  status: string
  modalidad: string
  isTrialClass: boolean
  student: {
    id: string
    user: {
      name: string
      email: string
      phone: string
    }
  }
  notes: Array<{
    id: string
    content: string
    topics: string
    createdAt: string
  }>
  tasks: Array<{
    id: string
    title: string
    description: string
    completed: boolean
    dueDate: string | null
  }>
}

export default function ClassDetail({ classId }: { classId: string }) {
  const router = useRouter()
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingStatus, setSavingStatus] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  // Estados para formularios
  const [noteContent, setNoteContent] = useState("")
  const [noteTopics, setNoteTopics] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [savingTask, setSavingTask] = useState(false)

  useEffect(() => {
    fetchClass()
  }, [classId])

  const fetchClass = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`)
      if (response.ok) {
        const data = await response.json()
        setClassData(data)
      }
    } catch (error) {
      console.error("Error al cargar clase:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    setSavingStatus(true)
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus, attendanceMarked: true })
      })

      if (response.ok) {
        fetchClass()
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error)
    } finally {
      setSavingStatus(false)
    }
  }

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim()) return

    setSavingNote(true)
    try {
      const topics = noteTopics.split(",").map(t => t.trim()).filter(Boolean)
      
      const response = await fetch(`/api/classes/${classId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: noteContent,
          topics
        })
      })

      if (response.ok) {
        setNoteContent("")
        setNoteTopics("")
        fetchClass()
      }
    } catch (error) {
      console.error("Error al agregar nota:", error)
    } finally {
      setSavingNote(false)
    }
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim() || !classData) return

    setSavingTask(true)
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId: classData.student.id,
          classId: classId,
          title: taskTitle,
          description: taskDescription
        })
      })

      if (response.ok) {
        setTaskTitle("")
        setTaskDescription("")
        fetchClass()
      }
    } catch (error) {
      console.error("Error al agregar tarea:", error)
    } finally {
      setSavingTask(false)
    }
  }

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ completed: !completed })
      })
      fetchClass()
    } catch (error) {
      console.error("Error al actualizar tarea:", error)
    }
  }

  const cancelClass = async () => {
    if (!confirm("¿Estás seguro de cancelar esta clase?")) return

    try {
      await fetch(`/api/classes/${classId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          status: "CANCELLED"
        })
      })
      fetchClass()
    } catch (error) {
      console.error("Error al cancelar clase:", error)
    }
  }

  const deleteClass = async () => {
    if (!confirm("⚠️ ¿Eliminar esta clase?\n\nLa clase se marcará como eliminada pero mantendrá el registro en el historial.")) return

    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          status: "DELETED",
          deletedAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        router.push("/dashboard/clases")
      }
    } catch (error) {
      console.error("Error al eliminar clase:", error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cargando información...</p>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Clase no encontrada</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      SCHEDULED: "bg-blue-100 text-blue-800",
      CONFIRMED: "bg-green-100 text-green-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
      NO_SHOW: "bg-orange-100 text-orange-800",
      DELETED: "bg-gray-400 text-gray-900"
    }
    
    const labels = {
      SCHEDULED: "Programada",
      CONFIRMED: "Confirmada",
      COMPLETED: "Completada",
      CANCELLED: "Cancelada",
      NO_SHOW: "No asistió",
      DELETED: "Eliminada"
    }

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header - Información de la Clase */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{classData.student.user.name}</h2>
            <p className="text-gray-600 mt-1">{formatDate(classData.date)} • {classData.startTime} - {classData.endTime}</p>
            <p className="text-gray-600">
              {classData.modalidad === "online" ? "📹 Online" : "🎓 Presencial"} • {classData.duration} minutos
            </p>
            {classData.isTrialClass && (
              <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                Clase de Prueba
              </span>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            {getStatusBadge(classData.status)}
            {classData.status !== "DELETED" && (
              <button
                onClick={() => setShowEditModal(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ✏️ Editar Clase
              </button>
            )}
            {classData.status !== "CANCELLED" && classData.status !== "COMPLETED" && classData.status !== "DELETED" && (
              <button
                onClick={cancelClass}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Cancelar Clase
              </button>
            )}
          </div>
        </div>

        {/* Marcar Asistencia */}
        {classData.status !== "CANCELLED" && classData.status !== "COMPLETED" && classData.status !== "DELETED" && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Marcar Asistencia:</h3>
            <div className="flex flex-wrap gap-3">
              {/* Solo mostrar Confirmar si NO está confirmada */}
              {classData.status !== "CONFIRMED" && (
                <button
                  onClick={() => updateStatus("CONFIRMED")}
                  disabled={savingStatus}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                >
                  ✓ Confirmar
                </button>
              )}
              <button
                onClick={() => updateStatus("COMPLETED")}
                disabled={savingStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                ✓ Completada
              </button>
              <button
                onClick={() => updateStatus("NO_SHOW")}
                disabled={savingStatus}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm font-medium"
              >
                ✗ No asistió
              </button>
            </div>
          </div>
        )}

        {/* Contacto y Eliminación */}
        {classData.status !== "DELETED" && (
          <div className="border-t pt-4 mt-4">
            <div className="flex flex-wrap gap-3">
              {/* WhatsApp con fecha/hora */}
              <WhatsAppButton
                phone={classData.student.user.phone}
                context="class"
                classDate={classData.date}
                classTime={classData.startTime}
              />
              
              {/* Botón Eliminar */}
              {classData.status !== "COMPLETED" && (
                <button
                  onClick={deleteClass}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  🗑️ Eliminar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notas de Clase */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📝 Notas de Clase</h3>
        
        {/* Formulario agregar nota */}
        <form onSubmit={addNote} className="mb-6 border-b pb-6">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenido de la Clase
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="¿Qué se trabajó en la clase?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temas (separados por comas)
              </label>
              <input
                type="text"
                value={noteTopics}
                onChange={(e) => setNoteTopics(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ritmo básico, coordinación, técnica"
              />
            </div>
            <button
              type="submit"
              disabled={savingNote || !noteContent.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {savingNote ? "Guardando..." : "Agregar Nota"}
            </button>
          </div>
        </form>

        {/* Notas existentes */}
        {classData.notes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay notas para esta clase</p>
        ) : (
          <div className="space-y-4">
            {classData.notes.map((note) => (
              <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                {note.topics && JSON.parse(note.topics).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {JSON.parse(note.topics).map((topic: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(note.createdAt).toLocaleDateString("es-CL")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tareas */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">✏️ Tareas Asignadas</h3>
        
        {/* Formulario agregar tarea */}
        <form onSubmit={addTask} className="mb-6 border-b pb-6">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Tarea
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Practicar ritmo básico"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detalles de la tarea..."
              />
            </div>
            <button
              type="submit"
              disabled={savingTask || !taskTitle.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {savingTask ? "Asignando..." : "Asignar Tarea"}
            </button>
          </div>
        </form>

        {/* Tareas existentes */}
        {classData.tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay tareas asignadas</p>
        ) : (
          <div className="space-y-3">
            {classData.tasks.map((task) => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id, task.completed)}
                    className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Fecha límite: {new Date(task.dueDate).toLocaleDateString("es-CL")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      {showEditModal && classData && (
        <EditClassModal
          classData={classData}
          onClose={() => setShowEditModal(false)}
          onSave={fetchClass}
        />
      )}
    </div>
  )
}
