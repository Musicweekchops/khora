"use client"

interface TaskItemProps {
  task: {
    id: string
    title: string
    priority: 'low' | 'medium' | 'high'
    status: 'todo' | 'done'
    dueDate?: string
  }
  onToggle: (id: string) => void
}

export default function TaskItem({ task, onToggle }: TaskItemProps) {
  const priorityColors = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-amber-400/10 text-amber-600 border-amber-400/20',
    low: 'bg-neutral-100 text-neutral-400 border-neutral-200'
  }

  return (
    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
      task.status === 'done' 
        ? 'bg-neutral-50/50 border-neutral-100 opacity-60' 
        : 'bg-white border-neutral-100 hover:border-primary/20 hover:shadow-md'
    }`}>
      <div className="flex items-center gap-4">
        <button 
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            task.status === 'done'
              ? 'bg-primary border-primary text-white scale-90'
              : 'border-neutral-200 hover:border-primary hover:bg-primary/5'
          }`}
          onClick={() => onToggle(task.id)}
        >
          {task.status === 'done' && <span className="text-xs font-bold text-white">✓</span>}
        </button>
        <div>
          <p className={`text-sm font-black tracking-tight ${
            task.status === 'done' ? 'line-through text-neutral-400' : 'text-neutral-900 group-hover:text-primary transition-colors'
          }`}>
            {task.title}
          </p>
          {task.dueDate && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] grayscale group-hover:grayscale-0 transition-all">📅</span>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                {task.dueDate}
              </span>
            </div>
          )}
        </div>
      </div>
      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] rounded-md border ${priorityColors[task.priority]}`}>
        {task.priority}
      </span>
    </div>
  )
}
