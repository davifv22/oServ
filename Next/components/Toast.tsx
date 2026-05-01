"use client"

export type ToastType = 'success' | 'error' | 'info'

export default function Toast({ message, type = 'success', onClose }: { message: string; type?: ToastType; onClose: () => void }) {
  const bg = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-primary'

  return (
    <div className={`toast-custom ${bg} text-white`}>
      <span>{message}</span>
      <button className="btn btn-sm text-white" onClick={onClose}>×</button>
    </div>
  )
}
