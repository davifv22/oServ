"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Toast from '@/components/Toast'

type NotificationItem = {
  id: string
  kind: string
  title: string
  body: string
  readAt: string | null
  createdAt: string
}

type ModalFilter = 'all' | 'unread' | 'read'

type KindMeta = {
  label: string
  icon: string
  tone: 'mention' | 'updated' | 'assigned' | 'system'
}

const KIND_META: Record<string, KindMeta> = {
  MENTION: {
    label: 'Mencao',
    icon: 'fa-solid fa-at',
    tone: 'mention'
  },
  SERVICE_ORDER_UPDATED: {
    label: 'OS atualizada',
    icon: 'fa-solid fa-arrows-rotate',
    tone: 'updated'
  },
  SERVICE_ORDER_ASSIGNED: {
    label: 'OS atribuida',
    icon: 'fa-solid fa-user-check',
    tone: 'assigned'
  }
}

function getKindMeta(kind: string): KindMeta {
  return KIND_META[kind] || {
    label: 'Sistema',
    icon: 'fa-solid fa-circle-info',
    tone: 'system'
  }
}

function formatRelativeDate(value: string) {
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()

  if (Number.isNaN(diffMs) || diffMs < 0) return 'agora'

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < minute) return 'agora'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} min`
  if (diffMs < day) return `${Math.floor(diffMs / hour)} h`

  return `${Math.floor(diffMs / day)} d`
}

function formatAbsoluteDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

export default function NotificationBell() {
  const [hydrated, setHydrated] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<ModalFilter>('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const knownNotificationIdsRef = useRef<Set<string>>(new Set())
  const initializedNotificationsRef = useRef(false)

  function trackIncomingNotifications(nextItems: NotificationItem[]) {
    const knownIds = knownNotificationIdsRef.current
    const incoming = nextItems.filter(item => !knownIds.has(item.id))

    for (const item of nextItems) knownIds.add(item.id)

    if (!initializedNotificationsRef.current) {
      initializedNotificationsRef.current = true
      return
    }

    const incomingUnread = incoming.filter(item => !item.readAt)
    if (incomingUnread.length === 0) return

    if (incomingUnread.length === 1) {
      const item = incomingUnread[0]
      const kindMeta = getKindMeta(item.kind)
      setToast({ message: `${kindMeta.label}: ${item.title}`, type: 'info' })
      return
    }

    setToast({ message: `${incomingUnread.length} novas notificacoes recebidas`, type: 'info' })
  }

  async function load(silent = false) {
    if (!silent) setLoading(true)

    try {
      const res = await fetch('/api/notifications?take=120', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const nextItems = Array.isArray(data) ? data as NotificationItem[] : []
        setItems(nextItems)
        trackIncomingNotifications(nextItems)
      } else if (!silent) {
        setToast({ message: 'Erro ao carregar notificacoes.', type: 'error' })
      }
    } catch {
      if (!silent) {
        setToast({ message: 'Nao foi possivel carregar notificacoes agora.', type: 'error' })
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    setHydrated(true)
    void load()
    const interval = setInterval(() => void load(true), 7000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadItems = useMemo(() => items.filter(item => !item.readAt), [items])
  const readItems = useMemo(() => items.filter(item => Boolean(item.readAt)), [items])
  const unreadCount = unreadItems.length

  const dropdownUnread = unreadItems.slice(0, 4)
  const dropdownRead = readItems.slice(0, 3)

  const modalItems = useMemo(() => {
    if (filter === 'unread') return unreadItems
    if (filter === 'read') return readItems
    return items
  }, [filter, items, readItems, unreadItems])

  async function markAll() {
    try {
      const response = await fetch('/api/notifications', { method: 'PATCH' })
      if (!response.ok) throw new Error('Erro ao marcar notificacoes')
      setItems(prev => prev.map(item => ({ ...item, readAt: item.readAt || new Date().toISOString() })))
      setToast({ message: 'Notificacoes marcadas como lidas.', type: 'info' })
      await load(true)
    } catch {
      setToast({ message: 'Erro ao marcar notificacoes como lidas.', type: 'error' })
    }
  }

  async function markOne(id: string) {
    const previous = items
    setItems(prev => prev.map(item => (
      item.id === id ? { ...item, readAt: item.readAt || new Date().toISOString() } : item
    )))

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (!response.ok) throw new Error('Erro ao marcar notificacao')
      await load(true)
    } catch {
      setItems(previous)
      setToast({ message: 'Erro ao marcar notificacao como lida.', type: 'error' })
    }
  }

  function renderNotification(item: NotificationItem, compact: boolean) {
    const kindMeta = getKindMeta(item.kind)
    const isUnread = !item.readAt

    return (
      <article
        key={item.id}
        className={`notification-item ${isUnread ? 'notification-item-unread' : ''} ${compact ? 'notification-item-compact' : ''}`}
      >
        <div className="notification-item-icon-wrap">
          <span className={`notification-kind-icon notification-kind-${kindMeta.tone}`}>
            <i className={kindMeta.icon} />
          </span>
        </div>

        <div className="notification-item-content">
          <div className="notification-item-top">
            <span className="notification-kind-badge">{kindMeta.label}</span>
            <time title={hydrated ? formatAbsoluteDate(item.createdAt) : ''} suppressHydrationWarning>
              {hydrated ? formatRelativeDate(item.createdAt) : '--'}
            </time>
          </div>

          <strong className="notification-item-title">{item.title}</strong>
          <p className="notification-item-body">{item.body}</p>

          {isUnread && (
            <Button variant="link" size="sm" className="notification-action h-auto px-0 text-app-accent" onClick={() => void markOne(item.id)}>
              Marcar como lida
            </Button>
          )}
        </div>
      </article>
    )
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <Button
        variant="outline"
        size="sm"
        className="relative bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
        onClick={() => setOpen(prev => !prev)}
        aria-label="Notificacoes"
      >
        <i className="fa-solid fa-bell" />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <Card className="notification-dropdown-panel p-0 shadow-xl">
          <div className="notification-dropdown-header">
            <div>
              <strong className="block">Notificacoes</strong>
              <small className="text-muted-foreground">{unreadCount} nao lidas de {items.length}</small>
            </div>
            <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void markAll()} disabled={unreadCount === 0}>
              Marcar todas
            </Button>
          </div>

          <div className="notification-dropdown-body">
            {items.length === 0 && <small className="text-muted-foreground p-3 block">Sem notificacoes</small>}

            {dropdownUnread.length > 0 && (
              <section className="notification-section">
                <h6 className="notification-section-title">Nao lidas</h6>
                {dropdownUnread.map(item => renderNotification(item, true))}
              </section>
            )}

            {dropdownRead.length > 0 && (
              <section className="notification-section">
                <h6 className="notification-section-title">Lidas recentes</h6>
                {dropdownRead.map(item => renderNotification(item, true))}
              </section>
            )}
          </div>

          <div className="notification-dropdown-footer">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
              onClick={() => {
                setModalOpen(true)
                setOpen(false)
              }}
            >
              Ver todas
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void load()} disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </Card>
      )}

      {modalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setModalOpen(false)}>
          <Card className="modal-card modal-card-lg notification-modal-card" onClick={event => event.stopPropagation()}>
            <div className="notification-modal-header">
              <div>
                <h5 className="mb-1">Central de notificacoes</h5>
                <small className="text-muted-foreground">Acompanhe mencoes e atualizacoes importantes da operacao.</small>
              </div>
              <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setModalOpen(false)}>
                Fechar
              </Button>
            </div>

            <div className="notification-metrics">
              <div className="notification-metric-card">
                <span>Total</span>
                <strong>{items.length}</strong>
              </div>
              <div className="notification-metric-card">
                <span>Nao lidas</span>
                <strong>{unreadCount}</strong>
              </div>
              <div className="notification-metric-card">
                <span>Lidas</span>
                <strong>{readItems.length}</strong>
              </div>
            </div>

            <div className="notification-modal-toolbar">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar notificacoes">
                <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" className={filter === 'all' ? 'bg-app-accent text-white hover:bg-app-accent/85' : 'bg-transparent border-app-border hover:bg-app-surface-alt text-app-text'} onClick={() => setFilter('all')}>
                  Todas
                </Button>
                <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" className={filter === 'unread' ? 'bg-app-accent text-white hover:bg-app-accent/85' : 'bg-transparent border-app-border hover:bg-app-surface-alt text-app-text'} onClick={() => setFilter('unread')}>
                  Nao lidas
                </Button>
                <Button variant={filter === 'read' ? 'default' : 'outline'} size="sm" className={filter === 'read' ? 'bg-app-accent text-white hover:bg-app-accent/85' : 'bg-transparent border-app-border hover:bg-app-surface-alt text-app-text'} onClick={() => setFilter('read')}>
                  Lidas
                </Button>
              </div>

              <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void markAll()} disabled={unreadCount === 0}>
                Marcar todas como lidas
              </Button>
            </div>

            <div className="notification-modal-list">
              {modalItems.length === 0 && <small className="text-muted-foreground block p-2">Nenhuma notificacao nesse filtro.</small>}
              {modalItems.map(item => renderNotification(item, false))}
            </div>
          </Card>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
