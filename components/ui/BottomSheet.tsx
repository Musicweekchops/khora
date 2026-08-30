"use client"

import React, { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
}

export default function BottomSheet({ isOpen, onClose, children, title, className = "" }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Presionar escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center pointer-events-none">
          {/* Fondo oscuro (backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] touch-none pointer-events-auto"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose()
              }
            }}
            // En móvil se ancla abajo. En desktop se centra como modal.
            className={`relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] pointer-events-auto ${className}`}
          >
            {/* Tirador (Handle) para mobile */}
            <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0 touch-none md:hidden">
              <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            {title && (
              <div className="px-6 pb-4 pt-2 md:pt-6 shrink-0 border-b border-neutral-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">{title}</h2>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors hidden md:flex"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}

            {/* Contenido scrolleable */}
            <div className="p-6 overflow-y-auto overscroll-contain pb-safe scrollbar-thin flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
