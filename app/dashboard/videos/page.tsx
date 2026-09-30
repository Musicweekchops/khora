"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { 
  Video, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Plus, 
  User as UserIcon,
  Sparkles,
  MessageSquare,
  BookmarkCheck,
  RefreshCw,
  ExternalLink
} from "lucide-react"
import TeacherSendVideoModal from "@/components/students/TeacherSendVideoModal"
import VideoExerciseRecorder from "@/components/students/VideoExerciseRecorder"
import ExerciseFeedbackModal from "@/components/students/ExerciseFeedbackModal"

interface SubmissionItem {
  id: string
  student_id: string
  teacher_id: string
  task_id: string | null
  title: string
  video_url: string
  video_duration?: number | null
  student_notes?: string | null
  created_by: "STUDENT" | "TEACHER"
  status: "PENDING" | "IN_REVIEW" | "APPROVED" | "NEEDS_WORK"
  teacher_feedback_text?: string | null
  teacher_feedback_audio_url?: string | null
  teacher_feedback_video_url?: string | null
  timestamp_markers?: Array<{ time: number; note: string }> | null
  reviewed_at?: string | null
  created_at: string
  student?: {
    id: string
    User?: {
      id: string
      name: string
      email: string
    } | null
  } | null
}

export default function VideosHubPage() {
  const { profile, loading: authLoading } = useAuth()
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"pending" | "teacher_sent" | "all">("pending")
  const [assignedTeacherId, setAssignedTeacherId] = useState<string | null>(null)

  // Modals state
  const [showTeacherSendModal, setShowTeacherSendModal] = useState(false)
  const [showStudentRecorderModal, setShowStudentRecorderModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null)

  const isTeacher = profile?.role === "TEACHER" || profile?.role === "ACADEMY" || !!profile?.is_admin
  const isStudent = profile?.role === "STUDENT"

  const loadSubmissions = async () => {
    if (!profile) return
    setLoading(true)
    try {
      if (isTeacher) {
        // Consultar entregas del profesor
        const teacherId = profile.teacherProfileId
        let query = supabase
          .from("ExerciseSubmission")
          .select(`
            *,
            student:StudentProfile (
              id,
              User:user_id (
                id,
                name,
                email
              )
            )
          `)
          .order("created_at", { ascending: false })

        if (teacherId) {
          query = query.eq("teacher_id", teacherId)
        }

        const { data, error } = await query
        if (error) throw error
        setSubmissions((data as any) || [])
      } else if (isStudent && profile.studentProfileId) {
        // Consultar entregas del alumno
        const { data: stData } = await supabase
          .from("StudentProfile")
          .select("teacher_id")
          .eq("id", profile.studentProfileId)
          .maybeSingle()
        if (stData?.teacher_id) {
          setAssignedTeacherId(stData.teacher_id)
        }

        const { data, error } = await supabase
          .from("ExerciseSubmission")
          .select(`
            *,
            student:StudentProfile (
              id,
              User:user_id (
                id,
                name,
                email
              )
            )
          `)
          .eq("student_id", profile.studentProfileId)
          .order("created_at", { ascending: false })

        if (error) throw error
        setSubmissions((data as any) || [])
      }
    } catch (err) {
      console.error("Error loading submissions in videos hub:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && profile) {
      loadSubmissions()
    }
  }, [authLoading, profile])

  // Filtrado
  const filteredSubmissions = submissions.filter((sub) => {
    const studentName = sub.student?.User?.name || ""
    const matchesSearch = 
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (isTeacher) {
      if (activeTab === "pending") {
        return (sub.status === "PENDING" || sub.status === "IN_REVIEW") && sub.created_by === "STUDENT"
      }
      if (activeTab === "teacher_sent") {
        return sub.created_by === "TEACHER"
      }
      return true
    } else {
      if (activeTab === "pending") {
        return sub.status === "PENDING" || sub.status === "IN_REVIEW"
      }
      if (activeTab === "teacher_sent") {
        return !!sub.teacher_feedback_text || !!sub.teacher_feedback_video_url || sub.created_by === "TEACHER"
      }
      return true
    }
  })

  // Contadores para badges
  const pendingCount = submissions.filter(s => (s.status === "PENDING" || s.status === "IN_REVIEW") && s.created_by === "STUDENT").length
  const teacherSentCount = submissions.filter(s => s.created_by === "TEACHER").length
  const reviewedCount = submissions.filter(s => s.status === "APPROVED" || s.status === "NEEDS_WORK").length

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-3xl md:rounded-[36px] p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {isTeacher ? "Centro de Feedback & Ejercicios" : "Zona de Práctica"}
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">
                Audio sin compresión · 720p HD
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
              {isTeacher ? "Videos y Devoluciones Técnicas" : "Mis Videos de Práctica"}
            </h1>
            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed">
              {isTeacher 
                ? "Revisa las tomas de tus alumnos con slow-motion (0.5x, 0.75x) y notas al segundo exacto, o graba demostraciones técnicas directamente."
                : "Envía videos de tus rudimentos y canciones para que tu profesor corrija tu agarre, rebote y tempo con notas detalladas."}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            {isTeacher && (
              <button
                type="button"
                onClick={() => setShowTeacherSendModal(true)}
                className="px-6 py-3.5 md:px-7 md:py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-950/50 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Grabar / Enviar Video a Alumno</span>
              </button>
            )}

            {isStudent && (
              <button
                type="button"
                onClick={() => setShowStudentRecorderModal(true)}
                className="px-6 py-3.5 md:px-7 md:py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-violet-950/50 active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>Grabar Video para mi Profesor</span>
              </button>
            )}

            <button
              onClick={loadSubmissions}
              className="p-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-2xl transition-colors"
              title="Recargar videos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-violet-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-[-30%] right-[-10%] w-80 h-80 bg-violet-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[10%] w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Tabs & Search Navigation Bar */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-neutral-100 p-3 md:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto p-1 bg-neutral-100/80 rounded-2xl">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "pending"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span>{isTeacher ? "Por Revisar" : "En Espera"}</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("teacher_sent")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "teacher_sent"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span>{isTeacher ? "Enviados por Mí" : "Devoluciones del Profesor"}</span>
            {isTeacher && teacherSentCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-black">
                {teacherSentCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "all"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span>Todos los Videos</span>
            <span className="text-[10px] opacity-60">({submissions.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isTeacher ? "Buscar por alumno o título..." : "Buscar por ejercicio..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          />
        </div>
      </div>

      {/* Grid of Videos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-neutral-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-neutral-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <Video className="w-8 h-8 opacity-60" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              No hay videos en esta sección
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              {isTeacher
                ? activeTab === "pending"
                  ? "¡Al día! No tienes videos de alumnos pendientes de corrección."
                  : "Aún no se han enviado videos en este apartado."
                : "No has subido grabaciones en esta categoría todavía."}
            </p>
          </div>
          {isTeacher && (
            <button
              onClick={() => setShowTeacherSendModal(true)}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Enviar Video a un Alumno</span>
            </button>
          )}
          {isStudent && (
            <button
              onClick={() => setShowStudentRecorderModal(true)}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black transition-all inline-flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span>Grabar Video para mi Profesor</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubmissions.map((sub) => {
            const studentName = sub.student?.User?.name || "Alumno"
            const markersCount = sub.timestamp_markers?.length || 0
            const hasTeacherDemo = !!sub.teacher_feedback_video_url
            const hasTeacherText = !!sub.teacher_feedback_text

            return (
              <div
                key={sub.id}
                className="bg-white rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group border-b-2"
              >
                {/* Video Preview Frame */}
                <div 
                  onClick={() => setSelectedSubmission(sub)}
                  className="relative aspect-video bg-neutral-900 flex items-center justify-center cursor-pointer overflow-hidden group/thumb"
                >
                  <video
                    src={sub.video_url}
                    preload="metadata"
                    playsInline
                    className="w-full h-full object-cover opacity-85 group-hover/thumb:opacity-100 group-hover/thumb:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-neutral-950 flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-neutral-950" />
                    </div>
                  </div>

                  {/* Creator Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {sub.created_by === "TEACHER" ? (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-violet-600/90 text-white backdrop-blur-md shadow">
                        Profesor
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-neutral-900/80 text-white backdrop-blur-md shadow">
                        Alumno
                      </span>
                    )}
                  </div>

                  {/* Status Pill */}
                  <div className="absolute top-3 right-3">
                    {sub.status === "PENDING" && (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow">
                        Por Revisar
                      </span>
                    )}
                    {sub.status === "IN_REVIEW" && (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-sky-500 text-white shadow">
                        En Revisión
                      </span>
                    )}
                    {sub.status === "APPROVED" && (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Aprobado
                      </span>
                    )}
                    {sub.status === "NEEDS_WORK" && (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-500 text-white shadow flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Ajustar Técnica
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-neutral-700 font-bold">{studentName}</span>
                      </span>
                      <span>
                        {new Date(sub.created_at).toLocaleDateString("es-CL", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    <h3 
                      onClick={() => setSelectedSubmission(sub)}
                      className="text-sm font-black text-neutral-900 line-clamp-1 group-hover:text-violet-600 transition-colors cursor-pointer"
                    >
                      {sub.title}
                    </h3>

                    {sub.student_notes && (
                      <p className="text-xs text-neutral-500 line-clamp-2 bg-neutral-50 p-2 rounded-xl">
                        &ldquo;{sub.student_notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Highlights & Badges */}
                  <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-2">
                    {markersCount > 0 && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <BookmarkCheck className="w-3 h-3" /> {markersCount} nota{markersCount > 1 ? "s" : ""} en tiempo
                      </span>
                    )}
                    {hasTeacherDemo && (
                      <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Demo profesor
                      </span>
                    )}
                    {hasTeacherText && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Feedback escrito
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 bg-neutral-100 hover:bg-violet-600 hover:text-white text-neutral-800"
                  >
                    <span>
                      {isTeacher 
                        ? (sub.status === "PENDING" ? "Revisar con Slow-Mo" : "Ver Devolución") 
                        : "Ver Video y Devolución"}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Profesor Enviar Video Directo a Alumno */}
      {showTeacherSendModal && profile?.teacherProfileId && (
        <TeacherSendVideoModal
          teacherId={profile.teacherProfileId}
          isOpen={showTeacherSendModal}
          onClose={() => setShowTeacherSendModal(false)}
          onSuccess={() => {
            loadSubmissions()
          }}
        />
      )}

      {/* Modal: Alumno Graba Video para su Profesor */}
      {showStudentRecorderModal && profile?.studentProfileId && assignedTeacherId && (
        <VideoExerciseRecorder
          studentId={profile.studentProfileId}
          teacherId={assignedTeacherId}
          customTitle="Práctica libre de instrumento"
          isOpen={showStudentRecorderModal}
          onClose={() => setShowStudentRecorderModal(false)}
          onSuccess={() => {
            loadSubmissions()
          }}
        />
      )}

      {/* Modal: Reproductor de Feedback Técnico & Slow Motion */}
      {selectedSubmission && (
        <ExerciseFeedbackModal
          submission={selectedSubmission}
          isTeacher={!!isTeacher}
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onUpdate={() => {
            loadSubmissions()
          }}
        />
      )}
    </div>
  )
}
