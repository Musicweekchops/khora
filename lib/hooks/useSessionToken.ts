/**
 * useSessionToken
 *
 * Hook que devuelve el access_token de la sesión activa de Supabase
 * leyéndolo DIRECTAMENTE del AuthContext (ya en memoria) sin hacer
 * ninguna llamada asíncrona a supabase.auth.getSession().
 *
 * Esto evita el "lock contention" que congela la UI cuando el usuario
 * vuelve a la pestaña después de inactividad.
 *
 * USO:
 *   const token = useSessionToken()
 *   fetch(`${SUPABASE_URL}/functions/v1/my-fn`, {
 *     headers: { Authorization: `Bearer ${token}` }
 *   })
 */
import { useAuth } from "@/lib/context/AuthContext"

export function useSessionToken(): string | null {
  const { session } = useAuth()
  return session?.access_token ?? null
}

/**
 * getStoredToken
 *
 * Alternativa no-React: lee el token directamente de localStorage
 * (donde supabase-js lo persiste con persistSession: true).
 * Útil en funciones de utilidad que no pueden usar hooks.
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    // Supabase guarda la sesión con la key "sb-<project-ref>-auth-token"
    const keys = Object.keys(localStorage).filter(k => k.includes("-auth-token"))
    for (const key of keys) {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      const token = parsed?.access_token ?? parsed?.session?.access_token
      if (token) return token
    }
  } catch {
    // localStorage no disponible o JSON inválido
  }
  return null
}
