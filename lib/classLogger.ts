import { supabase } from "@/lib/supabase"

export interface LogClassEventParams {
  student_id: string
  teacher_id: string
  class_id?: string | null
  action_type: 
    | "CLASS_CREATED" 
    | "ATTENDANCE_MARKED" 
    | "STATUS_CHANGED" 
    | "RESCHEDULED" 
    | "RECOVERY_SCHEDULED" 
    | "NOTE_ADDED" 
    | "TASK_ADDED"
    | "PAYMENT_REGISTERED"
    | "CLASS_DELETED"
  description: string
  metadata?: Record<string, any>
  created_by?: string | null
}

/**
 * Registra un evento en la bitácora ClassLog sin interrumpir el flujo principal en caso de advertencia.
 */
export async function logClassEvent(params: LogClassEventParams) {
  try {
    const { error } = await supabase.from("ClassLog").insert({
      student_id: params.student_id,
      teacher_id: params.teacher_id,
      class_id: params.class_id || null,
      action_type: params.action_type,
      description: params.description,
      metadata: params.metadata || {},
      created_by: params.created_by || null,
    })

    if (error) {
      console.warn("[logClassEvent] Warning saving class log:", error.message)
    }
  } catch (err) {
    console.error("[logClassEvent] Error:", err)
  }
}
