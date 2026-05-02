"use client"

import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export default function Toast({ message, type = 'success', onClose }: { message: string; type?: ToastType; onClose: () => void }) {
  const bg = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-primary'

  useEffect(() => {
    const timeout = setTimeout(onClose, 4500)
    return () => clearTimeout(timeout)
  }, [message, onClose])

  return (
    <div className={`toast-custom ${bg} text-white`} role="alert" aria-live="assertive">
      <span>{message}</span>
      <button type="button" className="btn btn-sm text-white" onClick={onClose} aria-label="Fechar notificacao">x</button>
    </div>
  )
}
