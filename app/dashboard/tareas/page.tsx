"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { ClipboardList, CheckCircle2, Circle } from "lucide-react"
import { RichText } from "@/components/ui/RichText"

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  created_at: string
}

export default function TareasPage() {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.studentProfileId) {
      loadTasks()
    }
  }, [profile?.studentProfileId])

  async function loadTasks() {
    setLoading(true)
    const { data, error } = await supabase
      .from("Task")
      .select("*")
      .eq("student_id", profile!.studentProfileId!)
      .order("created_at", { ascending: false })

    if (!error && data) setTasks(data)
    setLoading(false)
  }

  async function toggleTask(task: Task) {
    const newStatus = !task.completed
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: newStatus } : t))
    
    await supabase
      .from("Task")
      .update({ completed: newStatus })
      .eq("id", task.id)
  }

  const pending = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          Mis Tareas
        </h1>
        <p className="text-neutral-500 font-medium mt-2">{pending.length} pendientes</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse" />)}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-neutral-100 shadow-sm">
          <span className="text-5xl mb-4 block opacity-30">✨</span>
          <p className="text-neutral-900 font-bold text-lg">No tienes tareas asignadas</p>
          <p className="text-neutral-400 text-sm mt-1">¡Estás al día con todo!</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Pendientes */}
          {pending.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-neutral-800 flex items-center gap-2">
                <span className="w-2 h-5 bg-emerald-500 rounded-full" />
                Por Hacer
              </h2>
              <div className="grid gap-3">
                {pending.map(task => <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task)} />)}
              </div>
            </div>
          )}

          {/* Completadas */}
          {completed.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-5 bg-neutral-200 rounded-full" />
                Completadas
              </h2>
              <div className="grid gap-3 opacity-60 hover:opacity-100 transition-opacity">
                {completed.map(task => <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task)} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, onToggle }: { task: Task, onToggle: () => void }) {
  return (
    <div 
      onClick={onToggle}
      className={`bg-white rounded-3xl p-5 border cursor-pointer transition-all hover:shadow-md flex gap-4 ${
        task.completed ? 'border-neutral-100 bg-neutral-50' : 'border-emerald-100 hover:border-emerald-300'
      }`}
    >
      <div className="pt-1">
        {task.completed ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        ) : (
          <Circle className="w-6 h-6 text-neutral-300 hover:text-emerald-400 transition-colors" />
        )}
      </div>
      <div className="flex-1">
        <p className={`font-bold text-lg transition-colors ${task.completed ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
          {task.title}
        </p>
        {task.description && (
          <div onClick={e => e.stopPropagation()}>
            <RichText 
              text={task.description} 
              className={`text-sm mt-1 ${task.completed ? 'text-neutral-400' : 'text-neutral-500'}`} 
            />
          </div>
        )}
      </div>
    </div>
  )
}
