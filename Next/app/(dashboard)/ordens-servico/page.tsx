"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrencyBRL, formatCurrencyInput, formatPhone, numberToCurrencyInput, parseCurrencyInput } from '@/lib/br'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'
import { exportListPdf } from '@/lib/pdf'

const columns = [
  { key: 'OPEN', title: 'Aberta' },
  { key: 'IN_PROGRESS', title: 'Em andamento' },
  { key: 'WAITING_CUSTOMER', title: 'Aguardando cliente' },
  { key: 'FINISHED', title: 'Finalizada' },
  { key: 'CANCELED', title: 'Cancelada' }
]

type ServiceOrder = {
  id: string
  title?: string
  description?: string | null
  status: string
  priority?: string
  total?: number
  travelCost?: number
  createdAt?: string
  updatedAt?: string
  customerId?: string | null
  vehicleId?: string | null
  orderTypeId?: string | null
  responsibleEmployeeId?: string | null
  customer?: { name?: string; email?: string; phone?: string }
  vehicle?: { plate?: string; model?: string; brand?: string; modelYear?: number | null }
  responsibleEmployee?: { name?: string; email?: string; phone?: string }
  items?: Array<{
    id: string
    itemType: 'SERVICE' | 'MATERIAL'
    description?: string | null
    quantity?: number
    unitPrice?: number
    total?: number
    service?: { id: string; name: string } | null
    material?: { id: string; name: string; unit?: string } | null
  }>
  comments?: { id: string }[]
}

type DraftOrderItem = {
  id: string
  itemType: 'SERVICE' | 'MATERIAL'
  serviceId: string
  materialId: string
  description: string
  quantity: number
  unitPrice: number
  unitPriceInput: string
  total: number
}

type ColumnProps = {
  keyId: string
  title: string
  orders: ServiceOrder[]
  onOpenOrder: (id: string) => void
}

type OrderSortKey = 'title' | 'customer' | 'responsible' | 'status' | 'priority' | 'total' | 'updatedAt'

function toLocalDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCurrentMonthDateRange() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    start: toLocalDateInputValue(firstDay),
    end: toLocalDateInputValue(now)
  }
}

function createDraftOrderItem(itemType: 'SERVICE' | 'MATERIAL' = 'SERVICE'): DraftOrderItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemType,
    serviceId: '',
    materialId: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    unitPriceInput: '0,00',
    total: 0
  }
}

function calcDraftItemTotal(item: DraftOrderItem) {
  return Number((Number(item.quantity || 0) * Number(item.unitPrice || 0)).toFixed(2))
}

function calcDraftItemsTotal(items: DraftOrderItem[]) {
  return Number(items.reduce((sum, item) => sum + Number(item.total || 0), 0).toFixed(2))
}

function priorityPill(priority?: string) {
  if (priority === 'LOW') return 'border-slate-400/30 bg-slate-400/20 text-slate-100'
  if (priority === 'MEDIUM') return 'border-sky-400/30 bg-sky-400/20 text-sky-100'
  if (priority === 'HIGH') return 'border-amber-400/30 bg-amber-400/20 text-amber-100'
  if (priority === 'URGENT') return 'border-red-400/30 bg-red-500/20 text-red-100'
  return 'border-slate-400/30 bg-slate-400/20 text-slate-100'
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    OPEN: 'Aberta',
    IN_PROGRESS: 'Em andamento',
    WAITING_CUSTOMER: 'Aguardando cliente',
    FINISHED: 'Finalizada',
    CANCELED: 'Cancelada'
  }

  return labels[status || ''] || 'Nao definido'
}

function priorityLabel(priority?: string) {
  const labels: Record<string, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    URGENT: 'Urgente'
  }

  return labels[priority || ''] || 'Nao definida'
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('pt-BR')
}

function localizeStatusTokens(text?: string) {
  if (!text) return text || ''

  return text.replace(/\b(OPEN|IN_PROGRESS|WAITING_CUSTOMER|FINISHED|CANCELED)\b/g, code => statusLabel(code))
}

function highlightMentions(message: string) {
  return message.split(/(@[\w.-]+)/g).map((part, index) => {
    if (part.startsWith('@')) return <strong key={index} className="text-app-accent">{part}</strong>
    return <span key={index}>{part}</span>
  })
}

function timelineActionLabel(action?: string) {
  const labels: Record<string, string> = {
    CREATED: 'Criacao',
    STATUS_CHANGED: 'Mudanca de status',
    UPDATED: 'Atualizacao',
    COMMENTED: 'Comentario',
    ASSIGNED: 'Atribuicao'
  }

  return labels[action || ''] || 'Evento'
}

function OrderCardContent({ order, onOpenOrder }: { order: ServiceOrder; onOpenOrder: (id: string) => void }) {
  return (
    <>
      <div className="flex justify-between gap-2">
        <strong className="truncate">{order.title || 'Sem titulo'}</strong>
        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityPill(order.priority)}`}>
          {order.priority || 'MEDIUM'}
        </span>
      </div>
      <small className="block text-muted-foreground mt-1 truncate">Cliente: {order.customer?.name || 'Sem cliente'}</small>
      <small className="block text-muted-foreground truncate">Responsavel: {order.responsibleEmployee?.name || 'Sem responsavel'}</small>
      <small className="block text-muted-foreground truncate">
        Veiculo: {order.vehicle?.plate || 'Sem veiculo'} {order.vehicle?.model ? `- ${order.vehicle.model}` : ''}
      </small>
      {order.description && <small className="block mt-1 text-muted-foreground truncate">Descricao: {order.description}</small>}
      <div className="flex justify-between items-center mt-2 gap-2">
        <span className="font-semibold">{formatCurrencyBRL(order.total || 0)}</span>
        <span className="inline-flex rounded-full border border-app-border bg-app-surface-alt px-2 py-0.5 text-[11px] text-muted-foreground">
          Comentarios: {order.comments?.length || 0}
        </span>
      </div>
      <small className="block mt-1 text-muted-foreground truncate">Deslocamento: {formatCurrencyBRL(order.travelCost || 0)}</small>
      <small className="block mt-1 text-muted-foreground truncate">Itens: {order.items?.length || 0}</small>
      <Button
        variant="outline"
        size="sm"
        className="mt-2 w-full bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
        onClick={() => onOpenOrder(order.id)}
      >
        Abrir OS
      </Button>
    </>
  )
}

function DraggableOrderCard({ order, onOpenOrder }: { order: ServiceOrder; onOpenOrder: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: { status: order.status }
  })

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.35 : 1
  }

  return (
    <article ref={setNodeRef} style={style} className={`kanban-card ${isDragging ? 'kanban-card-dragging' : ''}`}>
      <div className="kanban-card-grab" {...listeners} {...attributes}>
        <i className="fa-solid fa-grip-lines" />
        Segure e arraste
      </div>
      <OrderCardContent order={order} onOpenOrder={onOpenOrder} />
    </article>
  )
}

function DroppableColumn({ keyId, title, orders, onOpenOrder }: ColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: keyId })

  return (
    <section ref={setNodeRef} className={`kanban-column ${isOver ? 'kanban-column-active' : ''}`}>
      <div className="kanban-column-header flex items-center justify-between gap-2">
        <strong>{title}</strong>
        <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-app-border bg-app-surface-alt px-2 py-0.5 text-xs text-muted-foreground">{orders.length}</span>
      </div>
      <div className="kanban-column-body">
        {orders.map(order => (
          <DraggableOrderCard key={order.id} order={order} onOpenOrder={onOpenOrder} />
        ))}
      </div>
    </section>
  )
}

export default function ServiceOrdersPage() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [orderTypes, setOrderTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('ALL')
  const [responsible, setResponsible] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [tableSortKey, setTableSortKey] = useState<OrderSortKey>('updatedAt')
  const [tableSortDir, setTableSortDir] = useState<'asc' | 'desc'>('desc')
  const [tableLimitInput, setTableLimitInput] = useState('50')
  const [tablePage, setTablePage] = useState(1)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [kanbanModalOpen, setKanbanModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsTab, setDetailsTab] = useState<'resumo' | 'comentarios' | 'timeline' | 'faturas'>('resumo')
  const [detailsOrder, setDetailsOrder] = useState<any>(null)
  const [detailsComments, setDetailsComments] = useState<any[]>([])
  const [detailsTimeline, setDetailsTimeline] = useState<any[]>([])
  const [detailsCommentMessage, setDetailsCommentMessage] = useState('')
  const [detailsCommentSending, setDetailsCommentSending] = useState(false)
  const [detailsInvoiceSaving, setDetailsInvoiceSaving] = useState(false)
  const [detailsInvoiceForm, setDetailsInvoiceForm] = useState({
    dueDate: '',
    discountInput: '0,00',
    interestInput: '0,00',
    notes: '',
    createBoleto: true,
    bankName: '',
    barcode: '',
    digitableLine: ''
  })

  const [form, setForm] = useState<any>({
    orderTypeId: '',
    priority: 'MEDIUM',
    status: 'OPEN',
    total: 0,
    totalInput: '0,00',
    travelCost: 0,
    travelCostInput: '0,00',
    items: [createDraftOrderItem('SERVICE')]
  })
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const loadingRef = useRef(false)
  const interactionLockRef = useRef(false)
  const loadErrorShownRef = useRef(false)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  )

  function applyCurrentMonthDateRange() {
    const range = getCurrentMonthDateRange()
    setDateFrom(range.start)
    setDateTo(range.end)
  }

  async function load(showLoader = false, force = false) {
    if ((interactionLockRef.current || loadingRef.current) && !force) return

    if (showLoader) setLoading(true)
    loadingRef.current = true
    setSyncing(true)

    try {
      const [ordersRes, employeesRes, customersRes, servicesRes, materialsRes, vehiclesRes, orderTypesRes] = await Promise.all([
        fetch('/api/service-orders', { cache: 'no-store' }),
        fetch('/api/employees', { cache: 'no-store' }),
        fetch('/api/customers', { cache: 'no-store' }),
        fetch('/api/services', { cache: 'no-store' }),
        fetch('/api/materials', { cache: 'no-store' }),
        fetch('/api/vehicles', { cache: 'no-store' }),
        fetch('/api/order-types', { cache: 'no-store' })
      ])

      const allOk = ordersRes.ok
        && employeesRes.ok
        && customersRes.ok
        && servicesRes.ok
        && materialsRes.ok
        && vehiclesRes.ok
        && orderTypesRes.ok
      if (!allOk) {
        if (!loadErrorShownRef.current) {
          setToast({ message: 'Erro ao carregar dados das ordens de servico', type: 'error' })
          loadErrorShownRef.current = true
        }
      } else {
        loadErrorShownRef.current = false
      }

      if (ordersRes.ok) setOrders(await ordersRes.json())
      if (employeesRes.ok) setEmployees(await employeesRes.json())
      if (customersRes.ok) setCustomers(await customersRes.json())
      if (servicesRes.ok) setServices(await servicesRes.json())
      if (materialsRes.ok) setMaterials(await materialsRes.json())
      if (vehiclesRes.ok) setVehicles(await vehiclesRes.json())
      if (orderTypesRes.ok) setOrderTypes(await orderTypesRes.json())

      setLastSync(new Date())
    } catch {
      if (!loadErrorShownRef.current) {
        setToast({ message: 'Erro de conexao ao carregar ordens de servico', type: 'error' })
        loadErrorShownRef.current = true
      }
    } finally {
      loadingRef.current = false
      setSyncing(false)
      if (showLoader) setLoading(false)
    }
  }

  useEffect(() => {
    void load(true, true)
    const interval = setInterval(() => {
      void load(false)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyCurrentMonthDateRange()
  }, [])

  useEffect(() => {
    if (searchParams.get('view') === 'kanban') {
      setKanbanModalOpen(true)
    }
  }, [searchParams])

  useEffect(() => {
    interactionLockRef.current = Boolean(activeOrderId || saving || updatingStatus)
  }, [activeOrderId, saving, updatingStatus])

  const filteredOrders = useMemo(() => {
    const startRaw = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null
    const endRaw = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null

    const start = startRaw !== null && Number.isFinite(startRaw) ? startRaw : null
    const end = endRaw !== null && Number.isFinite(endRaw) ? endRaw : null

    const rangeStart = start !== null && end !== null ? Math.min(start, end) : start
    const rangeEnd = start !== null && end !== null ? Math.max(start, end) : end

    return orders.filter(order => {
      const text = `${order.title || ''} ${order.customer?.name || ''} ${order.vehicle?.plate || ''} ${order.vehicle?.model || ''}`.toLowerCase()
      const matchesText = text.includes(search.toLowerCase())
      const matchesPriority = priority === 'ALL' || order.priority === priority
      const matchesResponsible = responsible === 'ALL' || order.responsibleEmployeeId === responsible

      let matchesDateRange = true
      if (rangeStart !== null || rangeEnd !== null) {
        const dateSource = order.createdAt || order.updatedAt
        const orderDate = dateSource ? new Date(dateSource).getTime() : Number.NaN
        if (!Number.isFinite(orderDate)) {
          matchesDateRange = false
        } else {
          if (rangeStart !== null && orderDate < rangeStart) matchesDateRange = false
          if (rangeEnd !== null && orderDate > rangeEnd) matchesDateRange = false
        }
      }

      return matchesText && matchesPriority && matchesResponsible && matchesDateRange
    })
  }, [orders, search, priority, responsible, dateFrom, dateTo])

  const rowLimit = useMemo(() => {
    const parsed = Number(tableLimitInput)
    if (!Number.isFinite(parsed) || parsed <= 0) return 50
    return Math.floor(parsed)
  }, [tableLimitInput])

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let comparison = 0

      if (tableSortKey === 'total') {
        comparison = Number(a.total || 0) - Number(b.total || 0)
      } else if (tableSortKey === 'updatedAt') {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime()
        comparison = aTime - bTime
      } else {
        const valueA =
          tableSortKey === 'title'
            ? (a.title || '')
            : tableSortKey === 'customer'
              ? (a.customer?.name || '')
              : tableSortKey === 'responsible'
                ? (a.responsibleEmployee?.name || '')
                : tableSortKey === 'status'
                  ? statusLabel(a.status)
                  : priorityLabel(a.priority)

        const valueB =
          tableSortKey === 'title'
            ? (b.title || '')
            : tableSortKey === 'customer'
              ? (b.customer?.name || '')
              : tableSortKey === 'responsible'
                ? (b.responsibleEmployee?.name || '')
                : tableSortKey === 'status'
                  ? statusLabel(b.status)
                  : priorityLabel(b.priority)

        comparison = String(valueA).localeCompare(String(valueB), 'pt-BR', { sensitivity: 'base' })
      }

      return tableSortDir === 'asc' ? comparison : -comparison
    })
  }, [filteredOrders, tableSortDir, tableSortKey])

  const tableTotalPages = useMemo(() => Math.max(1, Math.ceil(sortedOrders.length / rowLimit)), [sortedOrders.length, rowLimit])

  useEffect(() => {
    setTablePage(1)
  }, [search, priority, responsible, dateFrom, dateTo, tableSortKey, tableSortDir, rowLimit])

  useEffect(() => {
    setTablePage(prev => Math.min(prev, tableTotalPages))
  }, [tableTotalPages])

  const listedOrders = useMemo(() => {
    const start = (tablePage - 1) * rowLimit
    return sortedOrders.slice(start, start + rowLimit)
  }, [tablePage, rowLimit, sortedOrders])

  const tablePageStart = sortedOrders.length === 0 ? 0 : (tablePage - 1) * rowLimit + 1
  const tablePageEnd = Math.min(tablePage * rowLimit, sortedOrders.length)

  const activeOrder = useMemo(() => {
    if (!activeOrderId) return null
    return orders.find(order => order.id === activeOrderId) || null
  }, [activeOrderId, orders])

  function toggleTableSort(nextKey: OrderSortKey) {
    if (tableSortKey === nextKey) {
      setTableSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setTableSortKey(nextKey)
    setTableSortDir('asc')
  }

  function tableSortIndicator(key: OrderSortKey) {
    if (tableSortKey !== key) return '↕'
    return tableSortDir === 'asc' ? '↑' : '↓'
  }

  async function exportOrdersPdf() {
    if (orders.length === 0) {
      setToast({ message: 'Nenhuma ordem de servico para exportar', type: 'info' })
      return
    }

    await exportListPdf(
      'Ordens de Servico',
      ['Titulo', 'Status', 'Prioridade', 'Cliente', 'Responsavel', 'Total'],
      ['title', 'status', 'priority', 'customer', 'responsible', 'total'],
      orders.map(order => ({
        title: order.title || '-',
        status: order.status || '-',
        priority: order.priority || '-',
        customer: order.customer?.name || '-',
        responsible: order.responsibleEmployee?.name || '-',
        total: formatCurrencyBRL(order.total || 0)
      })),
      'ordens-servico.pdf'
    )
  }

  function openNewOrderModal() {
    setForm({
      orderTypeId: '',
      priority: 'MEDIUM',
      status: 'OPEN',
      total: 0,
      totalInput: '0,00',
      travelCost: 0,
      travelCostInput: '0,00',
      items: [createDraftOrderItem('SERVICE')]
    })
    setCreateModalOpen(true)
  }

  function syncFormTotals(items: DraftOrderItem[]) {
    const total = calcDraftItemsTotal(items)
    setForm((prev: any) => ({
      ...prev,
      items,
      total,
      totalInput: numberToCurrencyInput(total)
    }))
  }

  function addDraftItem(itemType: 'SERVICE' | 'MATERIAL') {
    const items = [...(form.items || []), createDraftOrderItem(itemType)]
    syncFormTotals(items)
  }

  function removeDraftItem(itemId: string) {
    const items = (form.items || []).filter((item: DraftOrderItem) => item.id !== itemId)
    syncFormTotals(items.length > 0 ? items : [createDraftOrderItem('SERVICE')])
  }

  function updateDraftItem(itemId: string, updater: (item: DraftOrderItem) => DraftOrderItem) {
    const items = (form.items || []).map((item: DraftOrderItem) => {
      if (item.id !== itemId) return item
      const next = updater(item)
      const total = calcDraftItemTotal(next)
      return { ...next, total }
    })

    syncFormTotals(items)
  }

  function applyOrderTypeToForm(orderTypeId: string) {
    if (!orderTypeId) {
      setForm((prev: any) => ({
        ...prev,
        orderTypeId: '',
        items: [createDraftOrderItem('SERVICE')],
        total: 0,
        totalInput: '0,00'
      }))
      return
    }

    const orderType = orderTypes.find(item => item.id === orderTypeId)
    if (!orderType) return

    const mappedItems: DraftOrderItem[] = (orderType.items || []).map((item: any) => {
      const quantity = Number(item.quantity || 1) || 1
      const unitPrice = Number(item.unitPrice || 0) || 0
      const total = Number((quantity * unitPrice).toFixed(2))

      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        itemType: item.itemType === 'MATERIAL' ? 'MATERIAL' : 'SERVICE',
        serviceId: item.serviceId || '',
        materialId: item.materialId || '',
        description: item.description || item.service?.name || item.material?.name || '',
        quantity,
        unitPrice,
        unitPriceInput: numberToCurrencyInput(unitPrice),
        total
      }
    })

    const hasItems = mappedItems.length > 0
    const safeItems = hasItems ? mappedItems : [createDraftOrderItem('SERVICE')]
    const total = calcDraftItemsTotal(safeItems)

    setForm((prev: any) => ({
      ...prev,
      orderTypeId,
      title: prev.title || orderType.name || '',
      priority: orderType.defaultPriority || prev.priority || 'MEDIUM',
      items: safeItems,
      total,
      totalInput: numberToCurrencyInput(total)
    }))
  }

  async function createOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.customerId) {
      setToast({ message: 'Informe titulo e cliente para criar a OS', type: 'error' })
      return
    }

    const formItems: DraftOrderItem[] = Array.isArray(form.items) ? form.items : []
    const itemsPayload = formItems
      .map(item => ({
        itemType: item.itemType,
        serviceId: item.itemType === 'SERVICE' ? (item.serviceId || null) : null,
        materialId: item.itemType === 'MATERIAL' ? (item.materialId || null) : null,
        description: item.description || null,
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0)
      }))
      .filter(item => item.quantity > 0 && (item.description || item.serviceId || item.materialId))

    if (itemsPayload.length === 0) {
      setToast({ message: 'Adicione pelo menos um servico ou material na OS', type: 'error' })
      return
    }

    const parsedItemsTotal = calcDraftItemsTotal(formItems)
    const parsedTravelCost = parseCurrencyInput(form.travelCostInput)
    const parsedTotal = Number((parsedItemsTotal + parsedTravelCost).toFixed(2))

    const payload = {
      ...form,
      vehicleId: form.vehicleId || null,
      items: itemsPayload,
      travelCost: parsedTravelCost,
      total: parsedTotal
    }

    setSaving(true)
    const response = await fetch('/api/service-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    setSaving(false)

    if (response.ok) {
      setToast({ message: 'OS criada com sucesso', type: 'success' })
      setCreateModalOpen(false)
      setForm({
        orderTypeId: '',
        priority: 'MEDIUM',
        status: 'OPEN',
        total: 0,
        totalInput: '0,00',
        travelCost: 0,
        travelCostInput: '0,00',
        items: [createDraftOrderItem('SERVICE')]
      })
      await load(false, true)
    } else {
      setToast({ message: 'Erro ao criar OS', type: 'error' })
    }
  }

  async function updateStatus(id: string, status: string) {
    const response = await fetch('/api/service-orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })

    if (!response.ok) {
      setToast({ message: 'Erro ao atualizar status da OS', type: 'error' })
      return false
    }

    return true
  }

  function onDragStart(event: DragStartEvent) {
    setActiveOrderId(String(event.active.id))
  }

  async function onDragEnd(event: DragEndEvent) {
    const currentActiveId = activeOrderId
    setActiveOrderId(null)

    if (!event.over) return

    const newStatus = String(event.over.id)
    if (!columns.some(col => col.key === newStatus)) return

    const draggableId = currentActiveId || String(event.active.id)
    const current = orders.find(order => order.id === draggableId)
    if (!current || current.status === newStatus) return

    setOrders(prev => prev.map(order => (order.id === draggableId ? { ...order, status: newStatus } : order)))

    setUpdatingStatus(true)
    let ok = false
    try {
      ok = await updateStatus(draggableId, newStatus)
    } finally {
      setUpdatingStatus(false)
    }

    if (ok) {
      setToast({ message: 'Status atualizado', type: 'success' })
      await load(false, true)

      if (detailsOrder?.id === draggableId) {
        setDetailsOrder((prev: any) => prev ? { ...prev, status: newStatus } : prev)
      }
    } else {
      setOrders(prev => prev.map(order => (order.id === draggableId ? { ...order, status: current.status } : order)))
    }
  }

  async function openOrderDetails(orderId: string) {
    setDetailsModalOpen(true)
    setDetailsLoading(true)
    setDetailsTab('resumo')
    setDetailsCommentMessage('')
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)
    setDetailsInvoiceForm({
      dueDate: toLocalDateInputValue(dueDate),
      discountInput: '0,00',
      interestInput: '0,00',
      notes: '',
      createBoleto: true,
      bankName: '',
      barcode: '',
      digitableLine: ''
    })

    try {
      const [orderRes, timelineRes, commentsRes] = await Promise.all([
        fetch(`/api/service-orders/${orderId}`, { cache: 'no-store' }),
        fetch(`/api/service-orders/${orderId}/timeline`, { cache: 'no-store' }),
        fetch(`/api/service-orders/${orderId}/comments`, { cache: 'no-store' })
      ])

      if (!orderRes.ok) {
        setToast({ message: 'Erro ao carregar detalhes da OS', type: 'error' })
        setDetailsModalOpen(false)
        return
      }

      setDetailsOrder(await orderRes.json())
      setDetailsTimeline(timelineRes.ok ? await timelineRes.json() : [])
      setDetailsComments(commentsRes.ok ? await commentsRes.json() : [])
    } catch {
      setToast({ message: 'Erro de conexao ao carregar detalhes da OS', type: 'error' })
      setDetailsModalOpen(false)
    } finally {
      setDetailsLoading(false)
    }
  }

  async function sendDetailsComment(e: React.FormEvent) {
    e.preventDefault()

    const orderId = detailsOrder?.id
    const message = String(detailsCommentMessage || '').trim()
    if (!orderId || !message) return

    setDetailsCommentSending(true)

    try {
      const response = await fetch(`/api/service-orders/${orderId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })

      if (!response.ok) {
        setToast({ message: 'Erro ao enviar comentario', type: 'error' })
        return
      }

      setToast({ message: 'Comentario enviado', type: 'success' })
      setDetailsCommentMessage('')

      const [timelineRes, commentsRes] = await Promise.all([
        fetch(`/api/service-orders/${orderId}/timeline`, { cache: 'no-store' }),
        fetch(`/api/service-orders/${orderId}/comments`, { cache: 'no-store' })
      ])

      if (timelineRes.ok) setDetailsTimeline(await timelineRes.json())
      if (commentsRes.ok) setDetailsComments(await commentsRes.json())

      await load(false, true)
    } catch {
      setToast({ message: 'Erro de conexao ao enviar comentario', type: 'error' })
    } finally {
      setDetailsCommentSending(false)
    }
  }

  async function createDetailsInvoice(e: React.FormEvent) {
    e.preventDefault()
    if (!detailsOrder?.id) return

    setDetailsInvoiceSaving(true)

    try {
      const response = await fetch(`/api/service-orders/${detailsOrder.id}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dueDate: detailsInvoiceForm.dueDate || null,
          discount: parseCurrencyInput(detailsInvoiceForm.discountInput),
          interest: parseCurrencyInput(detailsInvoiceForm.interestInput),
          notes: detailsInvoiceForm.notes || null,
          createBoleto: detailsInvoiceForm.createBoleto,
          boleto: detailsInvoiceForm.createBoleto
            ? {
                bankName: detailsInvoiceForm.bankName || null,
                barcode: detailsInvoiceForm.barcode || null,
                digitableLine: detailsInvoiceForm.digitableLine || null,
                dueDate: detailsInvoiceForm.dueDate || null
              }
            : null
        })
      })

      if (!response.ok) {
        setToast({ message: 'Erro ao criar fatura da OS', type: 'error' })
        return
      }

      const createdInvoice = await response.json()
      setDetailsOrder((prev: any) => ({
        ...(prev || {}),
        invoices: [createdInvoice, ...((prev?.invoices || []) as any[])]
      }))

      setToast({ message: 'Fatura criada com sucesso', type: 'success' })
      setDetailsTab('faturas')
    } catch {
      setToast({ message: 'Erro de conexao ao criar fatura da OS', type: 'error' })
    } finally {
      setDetailsInvoiceSaving(false)
    }
  }

  if (loading) return <Loader label="Carregando ordens de servico..." />

  return (
    <div className="kanban-wrapper">
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div>
          <h2 className="text-3xl font-bold">Ordens de Servico</h2>
          <small className="text-muted-foreground">
            {syncing ? 'Sincronizando...' : lastSync ? `Atualizado as ${lastSync.toLocaleTimeString('pt-BR')}` : 'Aguardando sincronizacao'}
          </small>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void exportOrdersPdf()}>Exportar PDF</Button>
          <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void load(false, true)}>Atualizar agora</Button>
          <Button
            variant="outline"
            className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
            onClick={() => {
              setPriority('ALL')
              setResponsible('ALL')
              setKanbanModalOpen(true)
            }}
          >
            <i className="fa-solid fa-table-columns mr-2" />
            Abrir Kanban
          </Button>
          <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={openNewOrderModal}>+ Nova OS</Button>
        </div>
      </div>

      <Card className="kanban-filter-card">
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-4 space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <Input placeholder="OS ou cliente" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <Select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="ALL">Todas</option>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </Select>
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-medium">Responsavel</label>
              <Select value={responsible} onChange={e => setResponsible(e.target.value)}>
                <option value="ALL">Todos</option>
                {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button
                variant="outline"
                className="w-full bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                onClick={() => {
                  setSearch('')
                  setPriority('ALL')
                  setResponsible('ALL')
                  applyCurrentMonthDateRange()
                }}
              >
                Limpar
              </Button>
            </div>
          </div>
          <div className="mt-3 grid gap-3 border-t border-app-border pt-3 md:grid-cols-12">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-muted-foreground block">Data inicial</label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-muted-foreground block">Data final</label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-3">
              <label className="text-xs text-muted-foreground block">Limite de registros</label>
              <Select value={tableLimitInput} onChange={e => setTableLimitInput(e.target.value)}>
                <option value="50">50</option>
                <option value="150">150</option>
                <option value="200">200</option>
              </Select>
            </div>
            <div className="flex items-end md:col-span-5">
              <small className="text-muted-foreground">
                Exibindo {tablePageStart}-{tablePageEnd} de {sortedOrders.length} registros filtrados no periodo.
              </small>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button type="button" className="table-sort-button" onClick={() => toggleTableSort('title')}>
                    OS <span>{tableSortIndicator('title')}</span>
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="table-sort-button" onClick={() => toggleTableSort('customer')}>
                    Cliente <span>{tableSortIndicator('customer')}</span>
                  </button>
                </TableHead>
                <TableHead>Veiculo</TableHead>
                <TableHead>
                  <button type="button" className="table-sort-button" onClick={() => toggleTableSort('responsible')}>
                    Responsavel <span>{tableSortIndicator('responsible')}</span>
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="table-sort-button" onClick={() => toggleTableSort('status')}>
                    Status <span>{tableSortIndicator('status')}</span>
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="table-sort-button" onClick={() => toggleTableSort('priority')}>
                    Prioridade <span>{tableSortIndicator('priority')}</span>
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="table-sort-button" onClick={() => toggleTableSort('total')}>
                    Valor <span>{tableSortIndicator('total')}</span>
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="table-sort-button" onClick={() => toggleTableSort('updatedAt')}>
                    Atualizada <span>{tableSortIndicator('updatedAt')}</span>
                  </button>
                </TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listedOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">Nenhuma OS encontrada para os filtros atuais.</TableCell>
                </TableRow>
              )}

              {listedOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <strong className="block truncate">{order.title || 'Sem titulo'}</strong>
                      <small className="text-muted-foreground block truncate">{order.id}</small>
                    </div>
                  </TableCell>
                  <TableCell>{order.customer?.name || 'Sem cliente'}</TableCell>
                  <TableCell>
                    {order.vehicle?.plate || 'Sem veiculo'}
                    {order.vehicle?.model ? <small className="block text-muted-foreground">{order.vehicle.model}</small> : null}
                  </TableCell>
                  <TableCell>{order.responsibleEmployee?.name || 'Sem responsavel'}</TableCell>
                  <TableCell>{statusLabel(order.status)}</TableCell>
                  <TableCell>{priorityLabel(order.priority)}</TableCell>
                  <TableCell>{formatCurrencyBRL(order.total || 0)}</TableCell>
                  <TableCell>{formatDateTime(order.updatedAt || order.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                      onClick={() => void openOrderDetails(order.id)}
                    >
                      Abrir OS
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-app-border px-4 py-3">
            <small className="text-muted-foreground">
              Pagina {tablePage} de {tableTotalPages}
            </small>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                onClick={() => setTablePage(prev => Math.max(prev - 1, 1))}
                disabled={tablePage <= 1}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                onClick={() => setTablePage(prev => Math.min(prev + 1, tableTotalPages))}
                disabled={tablePage >= tableTotalPages}
              >
                Proxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {kanbanModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setKanbanModalOpen(false)}>
          <Card className="modal-card modal-card-fullscreen" onClick={e => e.stopPropagation()}>
            <div className="kanban-modal-layout">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h5 className="mb-1 text-lg font-semibold">Kanban de Ordens de Servico</h5>
                  <small className="text-muted-foreground">Arraste para mudar status e abra os detalhes em modal.</small>
                </div>
                <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setKanbanModalOpen(false)}>
                  Fechar
                </Button>
              </div>

              <Card className="kanban-modal-filters">
                <CardContent className="p-3">
                  <div className="grid gap-3 md:grid-cols-12">
                    <div className="md:col-span-8 space-y-1">
                      <label className="text-xs text-muted-foreground block">Buscar</label>
                      <Input placeholder="OS ou cliente" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs text-muted-foreground block">Data inicial</label>
                      <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs text-muted-foreground block">Data final</label>
                      <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-app-border pt-3">
                    <small className="text-muted-foreground">
                      {filteredOrders.length} OS no Kanban para os filtros atuais.
                    </small>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                      onClick={() => {
                        setSearch('')
                        setPriority('ALL')
                        setResponsible('ALL')
                        applyCurrentMonthDateRange()
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="kanban-modal-body">
                <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={event => void onDragEnd(event)}>
                  <div className="kanban-stage">
                    <div className="kanban-scroll">
                      {columns.map(col => (
                        <DroppableColumn
                          key={col.key}
                          keyId={col.key}
                          title={col.title}
                          orders={filteredOrders.filter(order => order.status === col.key)}
                          onOpenOrder={orderId => void openOrderDetails(orderId)}
                        />
                      ))}
                    </div>
                  </div>

                  <DragOverlay>
                    {activeOrder ? (
                      <article className="kanban-card kanban-card-dragging kanban-card-overlay">
                        <div className="kanban-card-grab">
                          <i className="fa-solid fa-grip-lines" />
                          Movendo...
                        </div>
                        <OrderCardContent order={activeOrder} onOpenOrder={() => {}} />
                      </article>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            </div>
          </Card>
        </div>
      )}

      {createModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setCreateModalOpen(false)}>
          <Card className="modal-card modal-card-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-3 mb-3">
              <div>
                <h5 className="mb-1 text-lg font-semibold">Nova Ordem de Servico</h5>
                <small className="text-muted-foreground">Preencha os dados para abrir uma nova OS no Kanban.</small>
              </div>
              <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setCreateModalOpen(false)}>Fechar</Button>
            </div>

            <form onSubmit={createOrder} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-12">
                <div className="md:col-span-6 space-y-2">
                  <label className="text-sm font-medium">Titulo</label>
                  <Input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="md:col-span-6 space-y-2">
                  <label className="text-sm font-medium">Cliente</label>
                  <Select value={form.customerId || ''} onChange={e => setForm({ ...form, customerId: e.target.value })}>
                    <option value="">Selecione</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </div>
                <div className="md:col-span-6 space-y-2">
                  <label className="text-sm font-medium">Tipo de OS (opcional)</label>
                  <Select value={form.orderTypeId || ''} onChange={e => applyOrderTypeToForm(e.target.value)}>
                    <option value="">Selecione</option>
                    {orderTypes.map(orderType => (
                      <option key={orderType.id} value={orderType.id}>
                        {orderType.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="md:col-span-6 space-y-2">
                  <label className="text-sm font-medium">Veiculo</label>
                  <Select value={form.vehicleId || ''} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                    <option value="">Sem veiculo</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} {vehicle.model ? `- ${vehicle.model}` : ''}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="md:col-span-6 space-y-2">
                  <label className="text-sm font-medium">Responsavel</label>
                  <Select value={form.responsibleEmployeeId || ''} onChange={e => setForm({ ...form, responsibleEmployeeId: e.target.value })}>
                    <option value="">Sem responsavel</option>
                    {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                  </Select>
                </div>
                <div className="md:col-span-4 space-y-2">
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select value={form.priority || 'MEDIUM'} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </Select>
                </div>
                <div className="md:col-span-4 space-y-2">
                  <label className="text-sm font-medium">Subtotal (itens)</label>
                  <Input value={form.totalInput || '0,00'} readOnly />
                </div>
                <div className="md:col-span-4 space-y-2">
                  <label className="text-sm font-medium">Custo deslocamento</label>
                  <Input
                    inputMode="numeric"
                    value={form.travelCostInput || '0,00'}
                    onChange={e => {
                      const masked = formatCurrencyInput(e.target.value)
                      setForm({ ...form, travelCostInput: masked, travelCost: parseCurrencyInput(masked) })
                    }}
                  />
                </div>
                <div className="md:col-span-4 space-y-2">
                  <label className="text-sm font-medium">Status inicial</label>
                  <Select value={form.status || 'OPEN'} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {columns.map(col => <option key={col.key} value={col.key}>{col.title}</option>)}
                  </Select>
                </div>
                <div className="md:col-span-12 space-y-1">
                  <div className="rounded-xl border border-app-border bg-app-surface p-3 flex justify-between items-center">
                    <small className="text-muted-foreground">Total final da OS</small>
                    <strong>{formatCurrencyBRL(Number(form.total || 0) + Number(form.travelCost || 0))}</strong>
                  </div>
                </div>
                <div className="md:col-span-12 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-sm font-medium">Itens da OS (servicos e materiais)</label>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => addDraftItem('SERVICE')}>
                        + Servico
                      </Button>
                      <Button type="button" size="sm" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => addDraftItem('MATERIAL')}>
                        + Material
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(form.items || []).map((item: DraftOrderItem, index: number) => (
                      <div key={item.id} className="rounded-xl border border-app-border bg-app-surface p-3">
                        <div className="grid gap-2 md:grid-cols-12">
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs text-muted-foreground block">Tipo</label>
                            <Select
                              value={item.itemType}
                              onChange={e => updateDraftItem(item.id, current => ({
                                ...current,
                                itemType: e.target.value === 'MATERIAL' ? 'MATERIAL' : 'SERVICE',
                                serviceId: '',
                                materialId: '',
                                description: '',
                                unitPrice: 0,
                                unitPriceInput: '0,00'
                              }))}
                            >
                              <option value="SERVICE">Servico</option>
                              <option value="MATERIAL">Material</option>
                            </Select>
                          </div>

                          <div className="md:col-span-4 space-y-1">
                            <label className="text-xs text-muted-foreground block">{item.itemType === 'MATERIAL' ? 'Material' : 'Servico'}</label>
                            {item.itemType === 'MATERIAL' ? (
                              <Select
                                value={item.materialId || ''}
                                onChange={e => {
                                  const material = materials.find(entry => entry.id === e.target.value)
                                  updateDraftItem(item.id, current => ({
                                    ...current,
                                    materialId: e.target.value,
                                    serviceId: '',
                                    description: current.description || material?.name || '',
                                    unitPrice: Number(material?.unitPrice || 0),
                                    unitPriceInput: numberToCurrencyInput(material?.unitPrice || 0)
                                  }))
                                }}
                              >
                                <option value="">Selecione</option>
                                {materials.map(material => <option key={material.id} value={material.id}>{material.name}</option>)}
                              </Select>
                            ) : (
                              <Select
                                value={item.serviceId || ''}
                                onChange={e => {
                                  const service = services.find(entry => entry.id === e.target.value)
                                  updateDraftItem(item.id, current => ({
                                    ...current,
                                    serviceId: e.target.value,
                                    materialId: '',
                                    description: current.description || service?.name || '',
                                    unitPrice: Number(service?.price || 0),
                                    unitPriceInput: numberToCurrencyInput(service?.price || 0)
                                  }))
                                }}
                              >
                                <option value="">Selecione</option>
                                {services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
                              </Select>
                            )}
                          </div>

                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs text-muted-foreground block">Qtd</label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.quantity}
                              onChange={e => {
                                const quantity = Math.max(Number(e.target.value || 0), 0)
                                updateDraftItem(item.id, current => ({ ...current, quantity }))
                              }}
                            />
                          </div>

                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs text-muted-foreground block">Valor unit.</label>
                            <Input
                              inputMode="numeric"
                              value={item.unitPriceInput}
                              onChange={e => {
                                const masked = formatCurrencyInput(e.target.value)
                                updateDraftItem(item.id, current => ({
                                  ...current,
                                  unitPriceInput: masked,
                                  unitPrice: parseCurrencyInput(masked)
                                }))
                              }}
                            />
                          </div>

                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs text-muted-foreground block">Total</label>
                            <Input value={formatCurrencyBRL(item.total || 0)} readOnly />
                          </div>

                          <div className="md:col-span-12 space-y-1">
                            <label className="text-xs text-muted-foreground block">Descricao</label>
                            <div className="flex gap-2">
                              <Input
                                value={item.description || ''}
                                onChange={e => updateDraftItem(item.id, current => ({ ...current, description: e.target.value }))}
                                placeholder={`Item ${index + 1}`}
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => removeDraftItem(item.id)}
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-12 space-y-2">
                  <label className="text-sm font-medium">Descricao</label>
                  <Textarea rows={4} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setCreateModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={saving}>{saving ? 'Salvando...' : 'Criar OS'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {detailsModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setDetailsModalOpen(false)}>
          <Card className="modal-card modal-card-xxl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-3 mb-3">
              <div>
                <h5 className="mb-1 text-lg font-semibold">Detalhes da Ordem de Servico</h5>
                <small className="text-muted-foreground">Visualizacao completa da OS no mesmo modal.</small>
              </div>
              <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setDetailsModalOpen(false)}>
                Fechar
              </Button>
            </div>

            {detailsLoading ? (
              <Loader label="Carregando detalhes da OS..." />
            ) : detailsOrder ? (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="min-w-0">
                    <h6 className="text-xl font-semibold break-words">{detailsOrder.title || 'OS sem titulo'}</h6>
                    <small className="text-muted-foreground block">ID: {detailsOrder.id}</small>
                    <small className="text-muted-foreground block">Comentarios: {detailsComments.length} | Eventos: {detailsTimeline.length} | Faturas: {(detailsOrder.invoices || []).length}</small>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityPill(detailsOrder.priority)}`}>{priorityLabel(detailsOrder.priority)}</span>
                    <span className="inline-flex rounded-full border border-app-border bg-app-surface-alt px-2.5 py-0.5 text-xs font-semibold text-app-text">{statusLabel(detailsOrder.status)}</span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-12">
                  <div className="md:col-span-12 space-y-1">
                    <label className="text-sm text-muted-foreground">Descricao</label>
                    {detailsOrder.description?.trim() ? (
                      <p className="mb-0 whitespace-pre-wrap">{detailsOrder.description}</p>
                    ) : (
                      <small className="text-muted-foreground">Sem descricao informada.</small>
                    )}
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="text-sm text-muted-foreground">Cliente</label>
                    <strong className="block">{detailsOrder.customer?.name || 'Sem cliente'}</strong>
                    <small className="text-muted-foreground block">Email: {detailsOrder.customer?.email || '-'}</small>
                    <small className="text-muted-foreground block">Telefone: {formatPhone(detailsOrder.customer?.phone) || '-'}</small>
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="text-sm text-muted-foreground">Responsavel</label>
                    <strong className="block">{detailsOrder.responsibleEmployee?.name || 'Sem responsavel'}</strong>
                    <small className="text-muted-foreground block">Email: {detailsOrder.responsibleEmployee?.email || '-'}</small>
                    <small className="text-muted-foreground block">Telefone: {formatPhone(detailsOrder.responsibleEmployee?.phone) || '-'}</small>
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="text-sm text-muted-foreground">Veiculo</label>
                    <strong className="block">{detailsOrder.vehicle?.plate || 'Sem veiculo'}</strong>
                    <small className="text-muted-foreground block">Modelo: {detailsOrder.vehicle?.model || '-'}</small>
                    <small className="text-muted-foreground block">Marca: {detailsOrder.vehicle?.brand || '-'}</small>
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="text-sm text-muted-foreground">Financeiro e datas</label>
                    <strong className="block">{formatCurrencyBRL(detailsOrder.total || 0)}</strong>
                    <small className="text-muted-foreground block">Subtotal itens: {formatCurrencyBRL(Math.max(Number(detailsOrder.total || 0) - Number(detailsOrder.travelCost || 0), 0))}</small>
                    <small className="text-muted-foreground block">Deslocamento: {formatCurrencyBRL(detailsOrder.travelCost || 0)}</small>
                    <small className="text-muted-foreground block">Criada em: {formatDateTime(detailsOrder.createdAt)}</small>
                    <small className="text-muted-foreground block">Atualizada em: {formatDateTime(detailsOrder.updatedAt)}</small>
                  </div>

                  <div className="md:col-span-8 space-y-2">
                    <label className="text-sm text-muted-foreground">Itens da OS</label>
                    <div className="rounded-xl border border-app-border bg-app-surface overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Descricao</TableHead>
                            <TableHead>Qtd</TableHead>
                            <TableHead>Unit.</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(detailsOrder.items || []).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground">Sem itens detalhados.</TableCell>
                            </TableRow>
                          )}
                          {(detailsOrder.items || []).map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.itemType === 'MATERIAL' ? 'Material' : 'Servico'}</TableCell>
                              <TableCell>{item.description || item.service?.name || item.material?.name || '-'}</TableCell>
                              <TableCell>{Number(item.quantity || 0).toLocaleString('pt-BR')}</TableCell>
                              <TableCell>{formatCurrencyBRL(item.unitPrice || 0)}</TableCell>
                              <TableCell>{formatCurrencyBRL(item.total || 0)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-app-border pb-2">
                  <Button
                    size="sm"
                    variant={detailsTab === 'resumo' ? 'default' : 'outline'}
                    className={detailsTab === 'resumo' ? 'bg-app-accent hover:bg-app-accent/80 text-white border-app-accent' : 'bg-transparent border-app-border hover:bg-app-surface-alt text-app-text'}
                    onClick={() => setDetailsTab('resumo')}
                  >
                    Resumo
                  </Button>
                  <Button
                    size="sm"
                    variant={detailsTab === 'comentarios' ? 'default' : 'outline'}
                    className={detailsTab === 'comentarios' ? 'bg-app-accent hover:bg-app-accent/80 text-white border-app-accent' : 'bg-transparent border-app-border hover:bg-app-surface-alt text-app-text'}
                    onClick={() => setDetailsTab('comentarios')}
                  >
                    Comentarios ({detailsComments.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={detailsTab === 'timeline' ? 'default' : 'outline'}
                    className={detailsTab === 'timeline' ? 'bg-app-accent hover:bg-app-accent/80 text-white border-app-accent' : 'bg-transparent border-app-border hover:bg-app-surface-alt text-app-text'}
                    onClick={() => setDetailsTab('timeline')}
                  >
                    Timeline ({detailsTimeline.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={detailsTab === 'faturas' ? 'default' : 'outline'}
                    className={detailsTab === 'faturas' ? 'bg-app-accent hover:bg-app-accent/80 text-white border-app-accent' : 'bg-transparent border-app-border hover:bg-app-surface-alt text-app-text'}
                    onClick={() => setDetailsTab('faturas')}
                  >
                    Faturas ({(detailsOrder?.invoices || []).length})
                  </Button>
                </div>

                {detailsTab === 'resumo' && (
                  <div className="grid gap-3 md:grid-cols-7">
                    <Card className="bg-app-surface border-app-border">
                      <CardContent className="p-3">
                        <small className="text-muted-foreground block">Status atual</small>
                        <strong>{statusLabel(detailsOrder.status)}</strong>
                      </CardContent>
                    </Card>
                    <Card className="bg-app-surface border-app-border">
                      <CardContent className="p-3">
                        <small className="text-muted-foreground block">Prioridade</small>
                        <strong>{priorityLabel(detailsOrder.priority)}</strong>
                      </CardContent>
                    </Card>
                    <Card className="bg-app-surface border-app-border">
                      <CardContent className="p-3">
                        <small className="text-muted-foreground block">Total OS</small>
                        <strong>{formatCurrencyBRL(detailsOrder.total || 0)}</strong>
                      </CardContent>
                    </Card>
                    <Card className="bg-app-surface border-app-border">
                      <CardContent className="p-3">
                        <small className="text-muted-foreground block">Deslocamento</small>
                        <strong>{formatCurrencyBRL(detailsOrder.travelCost || 0)}</strong>
                      </CardContent>
                    </Card>
                    <Card className="bg-app-surface border-app-border">
                      <CardContent className="p-3">
                        <small className="text-muted-foreground block">Comentarios</small>
                        <strong>{detailsComments.length}</strong>
                      </CardContent>
                    </Card>
                    <Card className="bg-app-surface border-app-border">
                      <CardContent className="p-3">
                        <small className="text-muted-foreground block">Itens</small>
                        <strong>{(detailsOrder.items || []).length}</strong>
                      </CardContent>
                    </Card>
                    <Card className="bg-app-surface border-app-border">
                      <CardContent className="p-3">
                        <small className="text-muted-foreground block">Faturas</small>
                        <strong>{(detailsOrder.invoices || []).length}</strong>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {detailsTab === 'comentarios' && (
                  <div className="space-y-3">
                    <div className="timeline-modal-scroll">
                      <div className="space-y-2">
                        {detailsComments.length === 0 && <small className="text-muted-foreground">Nenhum comentario registrado.</small>}

                        {detailsComments.map(comment => (
                          <div key={comment.id} className="rounded-xl border border-app-border bg-app-surface p-3">
                            <div className="flex items-start gap-2">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-app-border bg-app-surface-alt text-xs font-semibold">
                                {comment.author?.name ? comment.author.name.split(' ').map((part: string) => part[0]).join('').slice(0, 2).toUpperCase() : '?'}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap justify-between gap-2">
                                  <strong>{comment.author?.name || 'Usuario'}</strong>
                                  <small className="text-muted-foreground">{formatDateTime(comment.createdAt)}</small>
                                </div>
                                <div className="mt-1">{highlightMentions(comment.message || '')}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={sendDetailsComment} className="space-y-2 border-t border-app-border pt-3">
                      <Textarea
                        rows={3}
                        value={detailsCommentMessage}
                        onChange={e => setDetailsCommentMessage(e.target.value)}
                        placeholder="Digite um comentario. Ex: @joao validar OS."
                      />
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent"
                          disabled={detailsCommentSending || !detailsCommentMessage.trim()}
                        >
                          {detailsCommentSending ? 'Enviando...' : 'Enviar comentario'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {detailsTab === 'timeline' && (
                  <div className="timeline-modal-scroll">
                    <div className="space-y-2">
                      {detailsTimeline.length === 0 && <small className="text-muted-foreground">Nenhum evento de timeline registrado.</small>}

                      {detailsTimeline.map(item => (
                        <div key={item.id} className="rounded-xl border border-app-border bg-app-surface p-3">
                          <div className="flex flex-wrap justify-between gap-2">
                            <strong>{item.actor?.name || 'Sistema'}</strong>
                            <small className="text-muted-foreground">{formatDateTime(item.createdAt)}</small>
                          </div>
                          <small className="text-muted-foreground block mt-1">{item.type === 'audit' ? timelineActionLabel(item.action) : 'Comentario'}</small>
                          <p className="mt-1 mb-0">{item.type === 'comment' ? item.message : localizeStatusTokens(item.message)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailsTab === 'faturas' && (
                  <div className="space-y-3">
                    <Card className="bg-app-surface border-app-border">
                      <CardContent className="p-3">
                        <form onSubmit={createDetailsInvoice} className="grid gap-3 md:grid-cols-12">
                          <div className="md:col-span-3 space-y-1">
                            <label className="text-xs text-muted-foreground block">Vencimento</label>
                            <Input type="date" value={detailsInvoiceForm.dueDate} onChange={e => setDetailsInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))} />
                          </div>
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs text-muted-foreground block">Desconto</label>
                            <Input
                              inputMode="numeric"
                              value={detailsInvoiceForm.discountInput}
                              onChange={e => setDetailsInvoiceForm(prev => ({ ...prev, discountInput: formatCurrencyInput(e.target.value) }))}
                            />
                          </div>
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs text-muted-foreground block">Juros</label>
                            <Input
                              inputMode="numeric"
                              value={detailsInvoiceForm.interestInput}
                              onChange={e => setDetailsInvoiceForm(prev => ({ ...prev, interestInput: formatCurrencyInput(e.target.value) }))}
                            />
                          </div>
                          <div className="md:col-span-5 space-y-1">
                            <label className="text-xs text-muted-foreground block">Observacoes</label>
                            <Input value={detailsInvoiceForm.notes} onChange={e => setDetailsInvoiceForm(prev => ({ ...prev, notes: e.target.value }))} />
                          </div>
                          <div className="md:col-span-12">
                            <label className="inline-flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={detailsInvoiceForm.createBoleto}
                                onChange={e => setDetailsInvoiceForm(prev => ({ ...prev, createBoleto: e.target.checked }))}
                              />
                              Gerar boleto junto da fatura
                            </label>
                          </div>
                          {detailsInvoiceForm.createBoleto && (
                            <>
                              <div className="md:col-span-4 space-y-1">
                                <label className="text-xs text-muted-foreground block">Banco</label>
                                <Input value={detailsInvoiceForm.bankName} onChange={e => setDetailsInvoiceForm(prev => ({ ...prev, bankName: e.target.value }))} />
                              </div>
                              <div className="md:col-span-4 space-y-1">
                                <label className="text-xs text-muted-foreground block">Codigo de barras</label>
                                <Input value={detailsInvoiceForm.barcode} onChange={e => setDetailsInvoiceForm(prev => ({ ...prev, barcode: e.target.value }))} />
                              </div>
                              <div className="md:col-span-4 space-y-1">
                                <label className="text-xs text-muted-foreground block">Linha digitavel</label>
                                <Input value={detailsInvoiceForm.digitableLine} onChange={e => setDetailsInvoiceForm(prev => ({ ...prev, digitableLine: e.target.value }))} />
                              </div>
                            </>
                          )}
                          <div className="md:col-span-12 flex justify-end">
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={detailsInvoiceSaving}>
                              {detailsInvoiceSaving ? 'Gerando...' : 'Gerar fatura'}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>

                    <div className="space-y-2">
                      {(detailsOrder.invoices || []).length === 0 && <small className="text-muted-foreground">Nenhuma fatura registrada para esta OS.</small>}

                      {(detailsOrder.invoices || []).map((invoice: any) => (
                        <Card key={invoice.id} className="bg-app-surface border-app-border">
                          <CardContent className="p-3 space-y-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <strong className="block">{invoice.code || invoice.id}</strong>
                                <small className="text-muted-foreground block">Status: {invoice.status}</small>
                                <small className="text-muted-foreground block">Vencimento: {formatDateTime(invoice.dueDate)}</small>
                              </div>
                              <strong>{formatCurrencyBRL(invoice.total || 0)}</strong>
                            </div>
                            {invoice.boleto ? (
                              <div className="rounded-lg border border-app-border bg-app-surface-alt p-2">
                                <small className="text-muted-foreground block">Boleto: {invoice.boleto.status}</small>
                                <small className="text-muted-foreground block">Banco: {invoice.boleto.bankName || '-'}</small>
                                <small className="text-muted-foreground block">Codigo: {invoice.boleto.barcode || '-'}</small>
                                <small className="text-muted-foreground block">Linha: {invoice.boleto.digitableLine || '-'}</small>
                              </div>
                            ) : (
                              <small className="text-muted-foreground">Sem boleto vinculado.</small>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <small className="text-muted-foreground">Nao foi possivel carregar os detalhes da OS.</small>
            )}
          </Card>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
