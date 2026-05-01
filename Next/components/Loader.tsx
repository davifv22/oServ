"use client"

export default function Loader({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="loader-wrapper">
      <div className="loader-spinner" />
      <small className="text-muted">{label}</small>
    </div>
  )
}
