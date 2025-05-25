"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  /** URL de la imagen del usuario */
  src?: string | null
  /** Nombre del usuario para mostrar iniciales como fallback */
  name?: string | null
  /** Texto alternativo para la imagen */
  alt?: string
  /** Clases CSS adicionales */
  className?: string
  /** Tamaño del avatar */
  size?: "sm" | "md" | "lg" | "xl"
  /** Mostrar un indicador de estado */
  showStatus?: boolean
  /** Estado del usuario (online, offline, etc.) */
  status?: "online" | "offline" | "away"
}

const sizeClasses = {
  sm: "size-8",
  md: "size-10", 
  lg: "size-16",
  xl: "size-20"
}

const statusClasses = {
  online: "bg-green-500",
  offline: "bg-gray-400", 
  away: "bg-yellow-500"
}

export function UserAvatar({
  src,
  name,
  alt,
  className,
  size = "md",
  showStatus = false,
  status = "offline",
  ...props
}: UserAvatarProps) {
  const getInitials = (fullName?: string | null) => {
    if (!fullName) return "U"
    
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase()
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <div className="relative inline-block">
      <Avatar
        className={cn(sizeClasses[size], className)}
        {...props}
      >
        {src && (
          <AvatarImage
            src={src}
            alt={alt || `${name || 'Usuario'}'s avatar`}
            className="object-cover"
          />
        )}
        <AvatarFallback className="bg-sage-green/20 text-sage-green font-semibold">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      
      {showStatus && (
        <div 
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
            statusClasses[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
} 