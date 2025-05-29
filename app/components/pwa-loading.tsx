'use client'

import { Loader2 } from 'lucide-react'

interface PWALoadingProps {
  show: boolean
  message?: string
}

export default function PWALoading({ show, message = 'Cargando...' }: PWALoadingProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-[#F5EBDD] dark:bg-[#4A4A4A] z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#F88379]" />
        </div>
        <p className="text-[#4A4A4A] dark:text-[#F5EBDD] text-sm font-medium">
          {message}
        </p>
      </div>
    </div>
  )
} 