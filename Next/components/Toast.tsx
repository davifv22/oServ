"use client"

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info'

export default function Toast({ message, type = 'success', onClose }: { message: string; type?: ToastType; onClose: () => void }) {
  const toneClass = type === 'success'
    ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100'
    : type === 'error'
      ? 'border-red-400/40 bg-red-500/20 text-red-100'
      : 'border-sky-400/40 bg-sky-500/20 text-sky-100'

  useEffect(() => {
    const timeout = setTimeout(onClose, 4500)
    return () => clearTimeout(timeout)
  }, [message, onClose])

  return (
    <div className={cn('toast-custom', toneClass)} role="alert" aria-live="assertive">
      <span className="text-sm leading-relaxed">{message}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-current hover:bg-white/10"
        onClick={onClose}
        aria-label="Fechar notificacao"
      >
        <i className="fa-solid fa-xmark" />
      </Button>
    </div>
  )
}
