"use client"
import { useEffect, useRef, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function PDFViewerContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get("url")
  const page = parseInt(searchParams.get("page") || "1")
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!url || !canvasRef.current) return
    
    let isMounted = true

    const loadPdf = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Cargar script dinámicamente si no existe
        if (!(window as any).pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script")
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        const pdfjsLib = (window as any).pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
        
        const loadingTask = pdfjsLib.getDocument(url)
        const pdf = await loadingTask.promise
        
        const maxPage = pdf.numPages
        const targetPage = Math.min(Math.max(page, 1), maxPage)
        
        const pdfPage = await pdf.getPage(targetPage)
        
        // Ajustar el viewport al ancho de la pantalla
        const screenWidth = window.innerWidth
        let viewport = pdfPage.getViewport({ scale: 1 })
        const scale = screenWidth / viewport.width
        viewport = pdfPage.getViewport({ scale: scale * 0.95 }) // dejar margen
        
        const canvas = canvasRef.current!
        const context = canvas.getContext("2d")!
        
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        await pdfPage.render({ canvasContext: context, viewport }).promise
        
        if (isMounted) setLoading(false)
      } catch (err: any) {
        console.error(err)
        if (isMounted) {
          setError("Error al renderizar el PDF. Puede ser un archivo muy pesado o estar dañado.")
          setLoading(false)
        }
      }
    }
    
    loadPdf()
    
    return () => { isMounted = false }
  }, [url, page])

  if (!url) {
    return <div className="text-white text-center">URL no proporcionada.</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 z-10 text-white">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold">Cargando página {page}...</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-center max-w-sm mt-10">
          <p className="font-bold">{error}</p>
          <a href={url} target="_blank" rel="noreferrer" className="mt-4 block bg-red-600 text-white py-2 rounded-lg font-bold">
            Intentar Abrir Original
          </a>
        </div>
      )}
      
      <canvas 
        ref={canvasRef} 
        className={`bg-white shadow-2xl rounded-sm transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`} 
      />

      {!loading && !error && (
        <div className="mt-6 text-neutral-400 text-xs text-center flex flex-col items-center pb-8">
          Página {page}
          <div className="mt-4 flex flex-col gap-3 w-full">
            <button 
              onClick={() => window.close()} 
              className="px-6 py-3 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 font-bold"
            >
              Cerrar Visor
            </button>
            <a 
              href={url} 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 bg-neutral-800 text-violet-300 rounded-xl hover:bg-neutral-700 font-bold"
            >
              Abrir PDF Completo
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PDFViewerPage() {
  return (
    <div className="min-h-screen bg-neutral-900 p-4 flex flex-col">
      <Suspense fallback={<div className="text-white text-center mt-20">Cargando visor...</div>}>
        <PDFViewerContent />
      </Suspense>
    </div>
  )
}
