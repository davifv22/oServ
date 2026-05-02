"use client"

type LoaderProps = {
  label?: string
  fullscreen?: boolean
}

export default function Loader({ label = 'Carregando...', fullscreen = false }: LoaderProps) {
  return (
    <div className={`loader-wrapper${fullscreen ? ' loader-wrapper-fullscreen' : ''}`} role="status" aria-live="polite">
      <span className="loader-spinner" aria-hidden />
      {label ? <small className="loader-label">{label}</small> : null}
    </div>
  )
}
