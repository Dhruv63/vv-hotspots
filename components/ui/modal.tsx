"use client"

import { ReactNode, useEffect, useState, useId } from "react"
import { X } from "lucide-react"
import { modalStack } from "@/lib/modal-stack"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  title?: string
}

export function Modal({ isOpen, onClose, children, className = "", title }: ModalProps) {
  const [isClosing, setIsClosing] = useState(false)

  const modalId = useId()

  useEffect(() => {
    if (isOpen) {
      modalStack.push(modalId)
    }
    return () => {
      modalStack.pop(modalId)
    }
  }, [isOpen, modalId])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalStack.isTop(modalId)) {
        handleClose()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose, modalId])

  useEffect(() => {
    if (isOpen) setIsClosing(false)
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 200) // Wait for animation
  }

  if (!isOpen && !isClosing) return null

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 ${!isOpen && isClosing ? "pointer-events-none" : ""}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />

      {/* Content */}
      <div
        className={`relative z-10 w-full max-w-lg bg-[#1A1F3A] border border-[#E8FF00]/30 rounded-lg shadow-[0_0_30px_rgba(232,255,0,0.1)] overflow-hidden transition-all duration-200 ${
          isClosing
            ? "opacity-0 scale-95 translate-y-4"
            : "opacity-100 scale-100 translate-y-0"
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
             <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-xl font-mono font-bold text-white tracking-tight">{title}</h3>
                <button
                    onClick={handleClose}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
             </div>
        )}
        {!title && (
             <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 p-1 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            >
                <X className="w-5 h-5" />
            </button>
        )}

        {children}
      </div>
    </div>
  )
}
