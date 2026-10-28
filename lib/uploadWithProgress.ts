import { supabase } from '@/lib/supabase'

export interface UploadProgress {
  loaded: number
  total: number
  /** 0-100 */
  percent: number
  /** bytes por segundo (promedio móvil simple desde el inicio) */
  speed: number
  /** segundos restantes estimados (null si aún no se puede calcular) */
  etaSeconds: number | null
}

interface UploadOptions {
  bucket: string
  path: string
  file: File
  onProgress?: (p: UploadProgress) => void
  signal?: AbortSignal
}

/**
 * Sube un archivo a Supabase Storage reportando progreso real.
 * supabase-js (fetch) no expone progreso de subida, por eso se usa XMLHttpRequest
 * contra el endpoint REST de Storage con el token de la sesión actual.
 */
export async function uploadToStorageWithProgress({
  bucket,
  path,
  file,
  onProgress,
  signal,
}: UploadOptions): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) throw new Error('Falta la configuración de Supabase')

  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? anonKey

  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  const endpoint = `${supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const startedAt = Date.now()

    xhr.open('POST', endpoint)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('apikey', anonKey)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('Cache-Control', 'max-age=3600')
    if (file.type) xhr.setRequestHeader('Content-Type', file.type)

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable || !onProgress) return
      const elapsed = Math.max((Date.now() - startedAt) / 1000, 0.001)
      const speed = e.loaded / elapsed
      const remaining = e.total - e.loaded
      onProgress({
        loaded: e.loaded,
        total: e.total,
        percent: Math.min(100, Math.round((e.loaded / e.total) * 100)),
        speed,
        etaSeconds: speed > 0 && e.loaded > 0 ? remaining / speed : null,
      })
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve()
      let message = `Error ${xhr.status}`
      try {
        const body = JSON.parse(xhr.responseText)
        message = body.message || body.error || message
      } catch {
        /* respuesta no JSON */
      }
      reject(new Error(message))
    }
    xhr.onerror = () => reject(new Error('Error de red durante la subida'))
    xhr.ontimeout = () => reject(new Error('La subida tardó demasiado'))
    xhr.onabort = () => reject(new Error('Subida cancelada'))

    if (signal) {
      if (signal.aborted) return reject(new Error('Subida cancelada'))
      signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }

    xhr.send(file)
  })
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatEta(seconds: number | null): string {
  if (seconds === null || !isFinite(seconds)) return 'calculando…'
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))} s`
  return `${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} s`
}
