"use client"

import { useState } from "react"

import TaskItem from "./TaskItem"

interface Task {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'done'
  dueDate?: string
}

export default function TeacherTaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Revisar pago de Rodrigo Tapia', priority: 'high', status: 'todo', dueDate: 'Hoy' },
    { id: '2', title: 'Enviar material de práctica a curso Iniciación', priority: 'medium', status: 'todo', dueDate: 'Mañana' },
    { id: '3', title: 'Actualizar temario nivel Intermedio', priority: 'low', status: 'done' },
  ])

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'todo' ? 'done' : 'todo' } : t))
  }

  return (
    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/30">
        <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
          <span>📋</span> Tareas de Gestión
        </h2>
        <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-600 transition-colors">
          + Nueva Tarea
        </button>
      </div>
      <div className="p-6 space-y-3 flex-1 overflow-y-auto max-h-[400px]">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={toggleTask} />
        ))}
      </div>
      <div className="p-4 bg-neutral-50/50 border-t border-neutral-100">
        <button className="w-full py-3 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors flex items-center justify-center gap-2">
          Ver todas las tareas <span>➔</span>
        </button>
      </div>
    </div>
  )
}
