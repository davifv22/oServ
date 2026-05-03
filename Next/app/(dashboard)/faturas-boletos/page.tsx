"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'
import { exportBoletoPdf, exportInvoicePdf } from '@/lib/pdf'

type InvoiceRow = {
  id: string
  companyId: string
  serviceOrderId: string
  code: string | null
  issueDate: string
  dueDate: string | null
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELED'
  subtotal: number
  discount: number
  interest: number
  total: number
  notes: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
  boleto: {
    id: string
    status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELED'
    bankName: string | null
    barcode: string | null
    digitableLine: string | null
    dueDate: string | null
    paidAt: string | null
  } | null
  serviceOrder: {
    id: string
    title: string
    status: string
    customer: { name: string } | null
    responsibleEmployee: { name: string } | null
  } | null
}

type ServiceOrderLite = {
  id: string
  title?: string
  status?: string
  total?: number
  customer?: { name?: string } | null
  responsibleEmployee?: { name?: string } | null
  createdAt?: string
  updatedAt?: string
}

type InvoiceFormState = {
  serviceOrderId: string
  code: string
  dueDate: string
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELED'
  notes: string
  subtotal: string
  discount: string
  interest: string
  total: string
  boletoEnabled: boolean
  boletoStatus: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELED'
  boletoDueDate: string
  bankName: string
  barcode: string
  digitableLine: string
  skipExisting: boolean
}

const INVOICE_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Rascunho',
  ISSUED: 'Emitida',
  PAID: 'Paga',
  OVERDUE: 'Vencida',
  CANCELED: 'Cancelada'
}

const BOLETO_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  EXPIRED: 'Expirado',
  CANCELED: 'Cancelado'
}

const SERVICE_ORDER_STATUS_LABEL: Record<string, string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em andamento',
  WAITING_CUSTOMER: 'Aguardando cliente',
  FINISHED: 'Finalizada',
  CANCELED: 'Cancelada'
}

const EMPTY_FORM: InvoiceFormState = {
  serviceOrderId: '',
  code: '',
  dueDate: '',
  status: 'ISSUED',
  notes: '',
  subtotal: '',
  discount: '0',
  interest: '0',
  total: '',
  boletoEnabled: true,
  boletoStatus: 'PENDING',
  boletoDueDate: '',
  bankName: '',
  barcode: '',
  digitableLine: '',
  skipExisting: true
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

function formatDateTime(value?: string | null) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString('pt-BR')
}

function formatDateInput(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function invoiceStatusBadgeClass(status: string) {
  if (status === 'DRAFT') return 'border-slate-400/30 bg-slate-500/20 text-slate-100'
  if (status === 'ISSUED') return 'border-cyan-400/30 bg-cyan-500/20 text-cyan-100'
  if (status === 'PAID') return 'border-emerald-400/30 bg-emerald-500/20 text-emerald-100'
  if (status === 'OVERDUE') return 'border-amber-400/30 bg-amber-500/20 text-amber-100'
  if (status === 'CANCELED') return 'border-red-400/30 bg-red-500/20 text-red-100'
  return 'border-slate-400/30 bg-slate-500/20 text-slate-100'
}

function boletoStatusBadgeClass(status: string) {
  if (status === 'PENDING') return 'border-amber-400/30 bg-amber-500/20 text-amber-100'
  if (status === 'PAID') return 'border-emerald-400/30 bg-emerald-500/20 text-emerald-100'
  if (status === 'EXPIRED') return 'border-red-400/30 bg-red-500/20 text-red-100'
  if (status === 'CANCELED') return 'border-slate-400/30 bg-slate-500/20 text-slate-100'
  return 'border-slate-400/30 bg-slate-500/20 text-slate-100'
}

function pillClassName(tone: string) {
  return `inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${tone}`
}

function parseOptionalNumber(value: string) {
  const text = String(value || '').trim().replace(',', '.')
  if (!text) return undefined
  const parsed = Number(text)
  if (!Number.isFinite(parsed)) return undefined
  return parsed
}

export default function FaturasBoletosPage() {
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [invoiceRows, setInvoiceRows] = useState<InvoiceRow[]>([])
  const [allInvoiceRows, setAllInvoiceRows] = useState<InvoiceRow[]>([])
  const [orders, setOrders] = useState<ServiceOrderLite[]>([])
  const [invoiceDeletingId, setInvoiceDeletingId] = useState<string | null>(null)
  const [invoiceSaving, setInvoiceSaving] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [printingInvoiceId, setPrintingInvoiceId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null)
  const [tableLimitInput, setTableLimitInput] = useState('50')
  const [tablePage, setTablePage] = useState(1)

  const [invoiceFilters, setInvoiceFilters] = useState({
    status: '',
    boletoStatus: '',
    q: ''
  })

  const [bulkFilters, setBulkFilters] = useState({
    status: '',
    q: '',
    onlyWithoutInvoices: true
  })

  const [singleModalOpen, setSingleModalOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<InvoiceRow | null>(null)
  const [editInvoiceForm, setEditInvoiceForm] = useState<InvoiceFormState>(EMPTY_FORM)
  const [createInvoiceForm, setCreateInvoiceForm] = useState<InvoiceFormState>(EMPTY_FORM)
  const [selectedBulkOrderIds, setSelectedBulkOrderIds] = useState<string[]>([])
  const filtersInitializedRef = useRef(false)
  const loadErrorShownRef = useRef(false)

  async function loadInvoices(silent = false) {
    if (silent) setSyncing(true)
    else setInvoiceLoading(true)

    try {
      const params = new URLSearchParams()
      if (invoiceFilters.status) params.set('status', invoiceFilters.status)
      if (invoiceFilters.boletoStatus) params.set('boletoStatus', invoiceFilters.boletoStatus)
      if (invoiceFilters.q.trim()) params.set('q', invoiceFilters.q.trim())

      const query = params.toString()
      const response = await fetch(`/api/invoices${query ? `?${query}` : ''}`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Erro ao carregar faturas')
      }

      setInvoiceRows(await response.json())
      loadErrorShownRef.current = false
    } catch {
      if (!loadErrorShownRef.current) {
        setToast({ message: 'Nao foi possivel carregar faturas e boletos.', type: 'error' })
        loadErrorShownRef.current = true
      }
    } finally {
      if (silent) setSyncing(false)
      else setInvoiceLoading(false)
    }
  }

  async function loadInvoiceIndex(silent = false) {
    if (!silent) setLoading(true)

    try {
      const response = await fetch('/api/invoices', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Erro ao carregar indice')
      }
      setAllInvoiceRows(await response.json())
    } catch {
      if (!loadErrorShownRef.current) {
        setToast({ message: 'Nao foi possivel carregar o indice de faturas.', type: 'error' })
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function loadOrders(silent = false) {
    if (!silent) setOrdersLoading(true)

    try {
      const response = await fetch('/api/service-orders', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Erro ao carregar ordens')
      }

      const payload = await response.json() as ServiceOrderLite[]
      setOrders(payload)
    } catch {
      setToast({ message: 'Nao foi possivel carregar ordens de servico.', type: 'error' })
    } finally {
      if (!silent) setOrdersLoading(false)
    }
  }

  async function refreshAll() {
    setSyncing(true)
    try {
      await Promise.all([loadInvoices(true), loadInvoiceIndex(true), loadOrders(true)])
    } finally {
      setSyncing(false)
    }
  }

  function ensureOrdersLoaded() {
    if (orders.length === 0 && !ordersLoading) {
      void loadOrders(false)
    }
  }

  function openSingleModal() {
    setCreateInvoiceForm({ ...EMPTY_FORM })
    setSingleModalOpen(true)
    ensureOrdersLoaded()
  }

  function openBulkModal() {
    setCreateInvoiceForm(prev => ({ ...prev, ...EMPTY_FORM }))
    setSelectedBulkOrderIds([])
    setBulkModalOpen(true)
    ensureOrdersLoaded()
  }

  function openEditInvoice(invoice: InvoiceRow) {
    setEditingInvoice(invoice)
    setEditInvoiceForm({
      serviceOrderId: invoice.serviceOrderId,
      code: invoice.code || '',
      dueDate: formatDateInput(invoice.dueDate),
      status: invoice.status,
      notes: invoice.notes || '',
      subtotal: String(Number(invoice.subtotal || 0)),
      discount: String(Number(invoice.discount || 0)),
      interest: String(Number(invoice.interest || 0)),
      total: String(Number(invoice.total || 0)),
      boletoEnabled: Boolean(invoice.boleto),
      boletoStatus: invoice.boleto?.status || 'PENDING',
      boletoDueDate: formatDateInput(invoice.boleto?.dueDate || invoice.dueDate),
      bankName: invoice.boleto?.bankName || '',
      barcode: invoice.boleto?.barcode || '',
      digitableLine: invoice.boleto?.digitableLine || '',
      skipExisting: true
    })
  }

  async function saveInvoiceEdit() {
    if (!editingInvoice || invoiceSaving) return

    setInvoiceSaving(true)
    try {
      const response = await fetch('/api/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: editingInvoice.id,
          code: editInvoiceForm.code || null,
          dueDate: editInvoiceForm.dueDate || null,
          status: editInvoiceForm.status,
          notes: editInvoiceForm.notes || null,
          subtotal: parseOptionalNumber(editInvoiceForm.subtotal) ?? 0,
          discount: parseOptionalNumber(editInvoiceForm.discount) ?? 0,
          interest: parseOptionalNumber(editInvoiceForm.interest) ?? 0,
          total: parseOptionalNumber(editInvoiceForm.total) ?? 0,
          boleto: editInvoiceForm.boletoEnabled
            ? {
                status: editInvoiceForm.boletoStatus,
                dueDate: editInvoiceForm.boletoDueDate || editInvoiceForm.dueDate || null,
                bankName: editInvoiceForm.bankName || null,
                barcode: editInvoiceForm.barcode || null,
                digitableLine: editInvoiceForm.digitableLine || null
              }
            : undefined
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar fatura')
      }

      setToast({ message: 'Fatura atualizada com sucesso.', type: 'success' })
      setEditingInvoice(null)
      await refreshAll()
    } catch {
      setToast({ message: 'Erro ao atualizar fatura.', type: 'error' })
    } finally {
      setInvoiceSaving(false)
    }
  }

  async function deleteInvoice(invoice: InvoiceRow) {
    if (invoiceDeletingId) return
    if (!window.confirm(`Excluir fatura ${invoice.code || invoice.id}? Esta acao nao pode ser desfeita.`)) return

    setInvoiceDeletingId(invoice.id)
    try {
      const response = await fetch('/api/invoices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id })
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir fatura')
      }

      setToast({ message: 'Fatura excluida com sucesso.', type: 'success' })
      await refreshAll()
    } catch {
      setToast({ message: 'Erro ao excluir fatura.', type: 'error' })
    } finally {
      setInvoiceDeletingId(null)
    }
  }

  async function printInvoice(invoice: InvoiceRow) {
    if (printingInvoiceId) return
    setPrintingInvoiceId(invoice.id)
    try {
      await exportInvoicePdf(invoice, `fatura-${invoice.code || invoice.id}.pdf`)
    } catch (error) {
      setToast({ message: 'Erro ao gerar PDF da fatura.', type: 'error' })
    } finally {
      setPrintingInvoiceId(null)
    }
  }

  async function printBoleto(invoice: InvoiceRow) {
    if (printingInvoiceId) return
    if (!invoice.boleto) {
      setToast({ message: 'Nenhum boleto disponivel para esta fatura.', type: 'error' })
      return
    }

    setPrintingInvoiceId(invoice.id)
    try {
      await exportBoletoPdf(invoice, `boleto-${invoice.code || invoice.id}.pdf`)
    } catch (error) {
      setToast({ message: 'Erro ao gerar PDF do boleto.', type: 'error' })
    } finally {
      setPrintingInvoiceId(null)
    }
  }

  async function createSingleInvoice() {
    if (!createInvoiceForm.serviceOrderId) {
      setToast({ message: 'Selecione a OS para gerar a fatura.', type: 'error' })
      return
    }
    if (createSaving) return

    setCreateSaving(true)
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          serviceOrderId: createInvoiceForm.serviceOrderId,
          code: createInvoiceForm.code || null,
          dueDate: createInvoiceForm.dueDate || null,
          status: createInvoiceForm.status,
          notes: createInvoiceForm.notes || null,
          subtotal: parseOptionalNumber(createInvoiceForm.subtotal),
          discount: parseOptionalNumber(createInvoiceForm.discount),
          interest: parseOptionalNumber(createInvoiceForm.interest),
          total: parseOptionalNumber(createInvoiceForm.total),
          createBoleto: createInvoiceForm.boletoEnabled,
          boleto: createInvoiceForm.boletoEnabled
            ? {
                status: createInvoiceForm.boletoStatus,
                dueDate: createInvoiceForm.boletoDueDate || createInvoiceForm.dueDate || null,
                bankName: createInvoiceForm.bankName || null,
                barcode: createInvoiceForm.barcode || null,
                digitableLine: createInvoiceForm.digitableLine || null
              }
            : undefined
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Erro ao gerar fatura')
      }

      setSingleModalOpen(false)
      setToast({ message: 'Fatura gerada com sucesso.', type: 'success' })
      await refreshAll()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao gerar fatura'
      setToast({ message, type: 'error' })
    } finally {
      setCreateSaving(false)
    }
  }

  async function createBulkInvoices() {
    if (selectedBulkOrderIds.length === 0) {
      setToast({ message: 'Selecione pelo menos uma OS para gerar em massa.', type: 'error' })
      return
    }
    if (createSaving) return

    setCreateSaving(true)
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'bulk',
          serviceOrderIds: selectedBulkOrderIds,
          skipExisting: createInvoiceForm.skipExisting,
          code: createInvoiceForm.code || null,
          dueDate: createInvoiceForm.dueDate || null,
          status: createInvoiceForm.status,
          notes: createInvoiceForm.notes || null,
          subtotal: parseOptionalNumber(createInvoiceForm.subtotal),
          discount: parseOptionalNumber(createInvoiceForm.discount),
          interest: parseOptionalNumber(createInvoiceForm.interest),
          total: parseOptionalNumber(createInvoiceForm.total),
          createBoleto: createInvoiceForm.boletoEnabled,
          boleto: createInvoiceForm.boletoEnabled
            ? {
                status: createInvoiceForm.boletoStatus,
                dueDate: createInvoiceForm.boletoDueDate || createInvoiceForm.dueDate || null,
                bankName: createInvoiceForm.bankName || null,
                barcode: createInvoiceForm.barcode || null,
                digitableLine: createInvoiceForm.digitableLine || null
              }
            : undefined
        })
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Erro na geracao em massa')
      }

      setToast({
        message: `Geracao em massa concluida: ${payload.createdCount || 0} criadas, ${payload.skippedCount || 0} ignoradas, ${payload.failedCount || 0} falhas.`,
        type: payload.failedCount > 0 ? 'info' : 'success'
      })
      setBulkModalOpen(false)
      await refreshAll()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro na geracao em massa'
      setToast({ message, type: 'error' })
    } finally {
      setCreateSaving(false)
    }
  }

  function toggleBulkSelection(orderId: string) {
    setSelectedBulkOrderIds(prev => (
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    ))
  }

  function selectAllBulkCandidates() {
    setSelectedBulkOrderIds(bulkCandidateOrders.map(order => order.id))
  }

  function clearBulkSelection() {
    setSelectedBulkOrderIds([])
  }

  useEffect(() => {
    void loadInvoices(false)
    void loadInvoiceIndex(false)
    void loadOrders(false)

    const interval = setInterval(() => {
      void refreshAll()
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!filtersInitializedRef.current) {
      filtersInitializedRef.current = true
      return
    }

    void loadInvoices(true)
  }, [invoiceFilters.status, invoiceFilters.boletoStatus, invoiceFilters.q])

  const orderIdsWithInvoices = useMemo(() => new Set(allInvoiceRows.map(invoice => invoice.serviceOrderId)), [allInvoiceRows])

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime()
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime()
      return bTime - aTime
    })
  }, [orders])

  const bulkCandidateOrders = useMemo(() => {
    return sortedOrders.filter(order => {
      const matchesStatus = !bulkFilters.status || order.status === bulkFilters.status
      const search = bulkFilters.q.toLowerCase().trim()
      const haystack = `${order.title || ''} ${order.customer?.name || ''} ${order.responsibleEmployee?.name || ''}`.toLowerCase()
      const matchesQuery = !search || haystack.includes(search)
      const hasInvoice = orderIdsWithInvoices.has(order.id)
      const matchesInvoiceRule = !bulkFilters.onlyWithoutInvoices || !hasInvoice
      return matchesStatus && matchesQuery && matchesInvoiceRule
    })
  }, [sortedOrders, bulkFilters, orderIdsWithInvoices])

  const summary = useMemo(() => {
    const invoiceCount = allInvoiceRows.length
    const invoiceAmount = allInvoiceRows.reduce((sum, item) => sum + Number(item.total || 0), 0)
    const openCount = allInvoiceRows.filter(item => item.status === 'ISSUED' || item.status === 'DRAFT' || item.status === 'OVERDUE').length
    const paidCount = allInvoiceRows.filter(item => item.status === 'PAID').length
    const boletoCount = allInvoiceRows.filter(item => item.boleto).length
    return {
      invoiceCount,
      invoiceAmount,
      openCount,
      paidCount,
      boletoCount
    }
  }, [allInvoiceRows])

  const rowLimit = useMemo(() => {
    const parsed = Number(tableLimitInput)
    if (!Number.isFinite(parsed) || parsed <= 0) return 50
    return Math.floor(parsed)
  }, [tableLimitInput])

  const tableTotalPages = useMemo(() => Math.max(1, Math.ceil(invoiceRows.length / rowLimit)), [invoiceRows.length, rowLimit])

  useEffect(() => {
    setTablePage(1)
  }, [invoiceFilters.status, invoiceFilters.boletoStatus, invoiceFilters.q, rowLimit])

  useEffect(() => {
    setTablePage(prev => Math.min(prev, tableTotalPages))
  }, [tableTotalPages])

  const paginatedInvoiceRows = useMemo(() => {
    const start = (tablePage - 1) * rowLimit
    return invoiceRows.slice(start, start + rowLimit)
  }, [invoiceRows, rowLimit, tablePage])

  const tablePageStart = invoiceRows.length === 0 ? 0 : (tablePage - 1) * rowLimit + 1
  const tablePageEnd = Math.min(tablePage * rowLimit, invoiceRows.length)

  if (loading && !allInvoiceRows.length) {
    return <Loader label="Carregando gestao de faturas e boletos..." />
  }

  return (
    <div className="space-y-3">
      <Card className="finance-hero-card">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div>
              <span className="finance-chip">Operacao financeira</span>
              <h2 className="mt-2 mb-1 text-3xl font-bold">Faturas e Boletos</h2>
              <p className="text-muted-foreground mb-1">Geracao individual, em massa, consulta, edicao e exclusao.</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => openSingleModal()}>
                <i className="fa-solid fa-file-circle-plus mr-2" />
                Gerar fatura
              </Button>
              <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => openBulkModal()}>
                <i className="fa-solid fa-layer-group mr-2" />
                Geracao em massa
              </Button>
              <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void refreshAll()} disabled={syncing}>
                <i className={`fa-solid ${syncing ? 'fa-rotate fa-spin' : 'fa-rotate-right'} mr-2`} />
                {syncing ? 'Sincronizando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="dashboard-kpi-grid">
        <Card className="dashboard-kpi-card"><CardContent className="p-3"><span>Total de faturas</span><strong>{summary.invoiceCount}</strong><small>Base consolidada da empresa</small></CardContent></Card>
        <Card className="dashboard-kpi-card"><CardContent className="p-3"><span>Total faturado</span><strong>{formatCurrency(summary.invoiceAmount)}</strong><small>Soma de todas as faturas</small></CardContent></Card>
        <Card className="dashboard-kpi-card"><CardContent className="p-3"><span>Faturas em aberto</span><strong>{summary.openCount}</strong><small>Rascunho, emitida e vencida</small></CardContent></Card>
        <Card className="dashboard-kpi-card"><CardContent className="p-3"><span>Faturas pagas</span><strong>{summary.paidCount}</strong><small>Total recebido</small></CardContent></Card>
        <Card className="dashboard-kpi-card"><CardContent className="p-3"><span>Com boleto</span><strong>{summary.boletoCount}</strong><small>Cobrancas com boleto vinculado</small></CardContent></Card>
      </section>

      <Card className="dashboard-table-card">
        <CardContent className="p-4 md:p-5 space-y-3">
          <div className="dashboard-card-head">
            <h5 className="mb-1 text-lg font-semibold">Consulta de faturas e boletos</h5>
            <small className="text-muted-foreground">Use os filtros para localizar e editar rapidamente.</small>
          </div>

          <div className="grid gap-2 md:grid-cols-12">
            <div className="md:col-span-4">
              <Input
                placeholder="Buscar por OS, cliente, codigo, boleto..."
                value={invoiceFilters.q}
                onChange={event => setInvoiceFilters(prev => ({ ...prev, q: event.target.value }))}
              />
            </div>
            <div className="md:col-span-3">
              <Select
                value={invoiceFilters.status}
                onChange={event => setInvoiceFilters(prev => ({ ...prev, status: event.target.value }))}
              >
                <option value="">Todos status de fatura</option>
                {Object.entries(INVOICE_STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-3">
              <Select
                value={invoiceFilters.boletoStatus}
                onChange={event => setInvoiceFilters(prev => ({ ...prev, boletoStatus: event.target.value }))}
              >
                <option value="">Todos status de boleto</option>
                {Object.entries(BOLETO_STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={tableLimitInput} onChange={event => setTableLimitInput(event.target.value)}>
                <option value="50">Limite 50</option>
                <option value="150">Limite 150</option>
                <option value="200">Limite 200</option>
              </Select>
            </div>
            <div className="md:col-span-2 md:col-start-11">
              <Button
                variant="outline"
                className="w-full bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                onClick={() => void loadInvoices(true)}
                disabled={syncing}
              >
                <i className={`fa-solid ${syncing ? 'fa-rotate fa-spin' : 'fa-rotate-right'} mr-2`} />
                Atualizar
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura / OS</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status fatura</TableHead>
                <TableHead>Status boleto</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">Carregando faturas...</TableCell>
                </TableRow>
              )}

              {!invoiceLoading && invoiceRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">Nenhuma fatura encontrada para os filtros atuais.</TableCell>
                </TableRow>
              )}

              {!invoiceLoading && paginatedInvoiceRows.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <strong className="block">{invoice.code || invoice.id.slice(0, 8)}</strong>
                    <small className="text-muted-foreground block">
                      <a href={`/ordens-servico/${invoice.serviceOrderId}`} className="dashboard-order-link">
                        {invoice.serviceOrder?.title || `OS ${invoice.serviceOrderId.slice(0, 8)}`}
                      </a>
                    </small>
                  </TableCell>
                  <TableCell>{invoice.serviceOrder?.customer?.name || 'Sem cliente'}</TableCell>
                  <TableCell>{formatDateTime(invoice.dueDate || invoice.createdAt)}</TableCell>
                  <TableCell>
                    <span className={pillClassName(invoiceStatusBadgeClass(invoice.status))}>
                      {INVOICE_STATUS_LABEL[invoice.status] || invoice.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {invoice.boleto ? (
                      <span className={pillClassName(boletoStatusBadgeClass(invoice.boleto.status))}>
                        {BOLETO_STATUS_LABEL[invoice.boleto.status] || invoice.boleto.status}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Sem boleto</span>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(invoice.total)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2 flex-wrap justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                        onClick={() => void printInvoice(invoice)}
                        disabled={printingInvoiceId === invoice.id}
                      >
                        {printingInvoiceId === invoice.id ? 'Imprimindo...' : 'Imprimir'}
                      </Button>
                      {invoice.boleto && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                          onClick={() => void printBoleto(invoice)}
                          disabled={printingInvoiceId === invoice.id}
                        >
                          Boleto
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                        onClick={() => openEditInvoice(invoice)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => void deleteInvoice(invoice)}
                        disabled={invoiceDeletingId === invoice.id}
                      >
                        {invoiceDeletingId === invoice.id ? 'Excluindo...' : 'Excluir'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-app-border px-1 pt-3">
            <small className="text-muted-foreground">
              Exibindo {tablePageStart}-{tablePageEnd} de {invoiceRows.length} registros
            </small>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                onClick={() => setTablePage(prev => Math.max(prev - 1, 1))}
                disabled={tablePage <= 1 || invoiceLoading}
              >
                Anterior
              </Button>
              <small className="text-muted-foreground">Pagina {tablePage} de {tableTotalPages}</small>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                onClick={() => setTablePage(prev => Math.min(prev + 1, tableTotalPages))}
                disabled={tablePage >= tableTotalPages || invoiceLoading}
              >
                Proxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {singleModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => { if (!createSaving) setSingleModalOpen(false) }}>
          <Card className="modal-card modal-card-lg" onClick={event => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h5 className="mb-1 text-lg font-semibold">Gerar fatura</h5>
                <small className="text-muted-foreground">Crie uma fatura (com boleto opcional) para uma OS.</small>
              </div>
              <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setSingleModalOpen(false)} disabled={createSaving}>Fechar</Button>
            </div>

            <div className="grid gap-3 md:grid-cols-12">
              <div className="md:col-span-12 space-y-1">
                <label className="text-xs text-muted-foreground">Ordem de servico</label>
                <Select value={createInvoiceForm.serviceOrderId} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, serviceOrderId: event.target.value }))}>
                  <option value="">Selecione uma OS</option>
                  {sortedOrders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.title || 'OS sem titulo'} | {(SERVICE_ORDER_STATUS_LABEL[order.status || ''] || order.status || '-') } | {order.customer?.name || 'Sem cliente'}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs text-muted-foreground">Codigo</label>
                <Input value={createInvoiceForm.code} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, code: event.target.value }))} />
              </div>
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs text-muted-foreground">Status da fatura</label>
                <Select value={createInvoiceForm.status} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, status: event.target.value as InvoiceFormState['status'] }))}>
                  {Object.entries(INVOICE_STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs text-muted-foreground">Vencimento</label>
                <Input type="date" value={createInvoiceForm.dueDate} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, dueDate: event.target.value }))} />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-muted-foreground">Subtotal (opcional)</label>
                <Input type="number" step="0.01" value={createInvoiceForm.subtotal} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, subtotal: event.target.value }))} />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-muted-foreground">Desconto</label>
                <Input type="number" step="0.01" value={createInvoiceForm.discount} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, discount: event.target.value }))} />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-muted-foreground">Juros</label>
                <Input type="number" step="0.01" value={createInvoiceForm.interest} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, interest: event.target.value }))} />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-muted-foreground">Total (opcional)</label>
                <Input type="number" step="0.01" value={createInvoiceForm.total} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, total: event.target.value }))} />
              </div>

              <div className="md:col-span-12 space-y-1">
                <label className="text-xs text-muted-foreground">Observacoes</label>
                <Input value={createInvoiceForm.notes} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, notes: event.target.value }))} />
              </div>

              <div className="md:col-span-12">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={createInvoiceForm.boletoEnabled}
                    onChange={event => setCreateInvoiceForm(prev => ({ ...prev, boletoEnabled: event.target.checked }))}
                  />
                  Gerar boleto junto da fatura
                </label>
              </div>

              {createInvoiceForm.boletoEnabled && (
                <>
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs text-muted-foreground">Status do boleto</label>
                    <Select value={createInvoiceForm.boletoStatus} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, boletoStatus: event.target.value as InvoiceFormState['boletoStatus'] }))}>
                      {Object.entries(BOLETO_STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs text-muted-foreground">Vencimento do boleto</label>
                    <Input type="date" value={createInvoiceForm.boletoDueDate} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, boletoDueDate: event.target.value }))} />
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs text-muted-foreground">Banco</label>
                    <Input value={createInvoiceForm.bankName} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, bankName: event.target.value }))} />
                  </div>
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-xs text-muted-foreground">Codigo de barras</label>
                    <Input value={createInvoiceForm.barcode} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, barcode: event.target.value }))} />
                  </div>
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-xs text-muted-foreground">Linha digitavel</label>
                    <Input value={createInvoiceForm.digitableLine} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, digitableLine: event.target.value }))} />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setSingleModalOpen(false)} disabled={createSaving}>Cancelar</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => void createSingleInvoice()} disabled={createSaving || ordersLoading}>
                {createSaving ? 'Gerando...' : 'Gerar fatura'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {bulkModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => { if (!createSaving) setBulkModalOpen(false) }}>
          <Card className="modal-card modal-card-lg" onClick={event => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h5 className="mb-1 text-lg font-semibold">Geracao em massa</h5>
                <small className="text-muted-foreground">Selecione as OS e gere varias faturas de uma vez.</small>
              </div>
              <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setBulkModalOpen(false)} disabled={createSaving}>Fechar</Button>
            </div>

            <div className="grid gap-2 md:grid-cols-12 mb-3">
              <div className="md:col-span-5">
                <Input
                  placeholder="Buscar OS por titulo, cliente ou responsavel"
                  value={bulkFilters.q}
                  onChange={event => setBulkFilters(prev => ({ ...prev, q: event.target.value }))}
                />
              </div>
              <div className="md:col-span-3">
                <Select value={bulkFilters.status} onChange={event => setBulkFilters(prev => ({ ...prev, status: event.target.value }))}>
                  <option value="">Todos status de OS</option>
                  {Object.entries(SERVICE_ORDER_STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-4 flex items-center">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={bulkFilters.onlyWithoutInvoices}
                    onChange={event => setBulkFilters(prev => ({ ...prev, onlyWithoutInvoices: event.target.checked }))}
                  />
                  Mostrar apenas OS sem fatura
                </label>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-2 items-center mb-2">
              <small className="text-muted-foreground">Selecionadas: {selectedBulkOrderIds.length} | Filtradas: {bulkCandidateOrders.length}</small>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={selectAllBulkCandidates}>Selecionar filtradas</Button>
                <Button type="button" size="sm" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={clearBulkSelection}>Limpar</Button>
              </div>
            </div>

            <div className="timeline-modal-scroll border border-app-border rounded-xl p-2 mb-3">
              <div className="space-y-2">
                {bulkCandidateOrders.length === 0 && <small className="text-muted-foreground">Nenhuma OS encontrada para os filtros atuais.</small>}
                {bulkCandidateOrders.map(order => {
                  const checked = selectedBulkOrderIds.includes(order.id)
                  const hasInvoice = orderIdsWithInvoices.has(order.id)
                  return (
                    <label key={order.id} className="flex items-start gap-2 rounded-lg border border-app-border bg-app-surface p-2 cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={() => toggleBulkSelection(order.id)} />
                      <div className="min-w-0 flex-1">
                        <strong className="block truncate">{order.title || 'OS sem titulo'}</strong>
                        <small className="text-muted-foreground block truncate">Cliente: {order.customer?.name || 'Sem cliente'} | Responsavel: {order.responsibleEmployee?.name || 'Sem responsavel'}</small>
                        <small className="text-muted-foreground block">Status: {SERVICE_ORDER_STATUS_LABEL[order.status || ''] || order.status || '-'} | Total OS: {formatCurrency(Number(order.total || 0))}</small>
                        {hasInvoice && <small className="text-amber-300 block">Ja possui fatura cadastrada.</small>}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-12">
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs text-muted-foreground">Codigo base (opcional)</label>
                <Input value={createInvoiceForm.code} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, code: event.target.value }))} />
              </div>
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs text-muted-foreground">Status da fatura</label>
                <Select value={createInvoiceForm.status} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, status: event.target.value as InvoiceFormState['status'] }))}>
                  {Object.entries(INVOICE_STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs text-muted-foreground">Vencimento padrao</label>
                <Input type="date" value={createInvoiceForm.dueDate} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, dueDate: event.target.value }))} />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-muted-foreground">Subtotal padrao (opcional)</label>
                <Input type="number" step="0.01" value={createInvoiceForm.subtotal} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, subtotal: event.target.value }))} />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-muted-foreground">Desconto padrao</label>
                <Input type="number" step="0.01" value={createInvoiceForm.discount} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, discount: event.target.value }))} />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-muted-foreground">Juros padrao</label>
                <Input type="number" step="0.01" value={createInvoiceForm.interest} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, interest: event.target.value }))} />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-muted-foreground">Total padrao (opcional)</label>
                <Input type="number" step="0.01" value={createInvoiceForm.total} onChange={event => setCreateInvoiceForm(prev => ({ ...prev, total: event.target.value }))} />
              </div>

              <div className="md:col-span-12">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={createInvoiceForm.skipExisting}
                    onChange={event => setCreateInvoiceForm(prev => ({ ...prev, skipExisting: event.target.checked }))}
                  />
                  Ignorar OS que ja possuem fatura
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setBulkModalOpen(false)} disabled={createSaving}>Cancelar</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => void createBulkInvoices()} disabled={createSaving || ordersLoading}>
                {createSaving ? 'Gerando em massa...' : 'Gerar em massa'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {editingInvoice && (
        <div className="modal-backdrop-custom" onClick={() => { if (!invoiceSaving) setEditingInvoice(null) }}>
          <Card className="modal-card modal-card-lg" onClick={event => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h5 className="mb-1 text-lg font-semibold">Editar fatura</h5>
                <small className="text-muted-foreground">Atualize dados da fatura e boleto vinculado.</small>
              </div>
              <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setEditingInvoice(null)} disabled={invoiceSaving}>Fechar</Button>
            </div>

            <div className="grid gap-3 md:grid-cols-12">
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs text-muted-foreground">Codigo</label>
                <Input value={editInvoiceForm.code} onChange={event => setEditInvoiceForm(prev => ({ ...prev, code: event.target.value }))} />
              </div>
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs text-muted-foreground">Status da fatura</label>
                <Select value={editInvoiceForm.status} onChange={event => setEditInvoiceForm(prev => ({ ...prev, status: event.target.value as InvoiceFormState['status'] }))}>
                  {Object.entries(INVOICE_STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs text-muted-foreground">Vencimento da fatura</label>
                <Input type="date" value={editInvoiceForm.dueDate} onChange={event => setEditInvoiceForm(prev => ({ ...prev, dueDate: event.target.value }))} />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-muted-foreground">Subtotal</label>
                <Input type="number" step="0.01" value={editInvoiceForm.subtotal} onChange={event => setEditInvoiceForm(prev => ({ ...prev, subtotal: event.target.value }))} />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-muted-foreground">Desconto</label>
                <Input type="number" step="0.01" value={editInvoiceForm.discount} onChange={event => setEditInvoiceForm(prev => ({ ...prev, discount: event.target.value }))} />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-muted-foreground">Juros</label>
                <Input type="number" step="0.01" value={editInvoiceForm.interest} onChange={event => setEditInvoiceForm(prev => ({ ...prev, interest: event.target.value }))} />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-muted-foreground">Total final</label>
                <Input type="number" step="0.01" value={editInvoiceForm.total} onChange={event => setEditInvoiceForm(prev => ({ ...prev, total: event.target.value }))} />
              </div>

              <div className="md:col-span-12 space-y-1">
                <label className="text-xs text-muted-foreground">Observacoes</label>
                <Input value={editInvoiceForm.notes} onChange={event => setEditInvoiceForm(prev => ({ ...prev, notes: event.target.value }))} />
              </div>

              <div className="md:col-span-12">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editInvoiceForm.boletoEnabled}
                    onChange={event => setEditInvoiceForm(prev => ({ ...prev, boletoEnabled: event.target.checked }))}
                  />
                  Possui boleto vinculado
                </label>
              </div>

              {editInvoiceForm.boletoEnabled && (
                <>
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs text-muted-foreground">Status do boleto</label>
                    <Select value={editInvoiceForm.boletoStatus} onChange={event => setEditInvoiceForm(prev => ({ ...prev, boletoStatus: event.target.value as InvoiceFormState['boletoStatus'] }))}>
                      {Object.entries(BOLETO_STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs text-muted-foreground">Vencimento do boleto</label>
                    <Input type="date" value={editInvoiceForm.boletoDueDate} onChange={event => setEditInvoiceForm(prev => ({ ...prev, boletoDueDate: event.target.value }))} />
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs text-muted-foreground">Banco</label>
                    <Input value={editInvoiceForm.bankName} onChange={event => setEditInvoiceForm(prev => ({ ...prev, bankName: event.target.value }))} />
                  </div>
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-xs text-muted-foreground">Codigo de barras</label>
                    <Input value={editInvoiceForm.barcode} onChange={event => setEditInvoiceForm(prev => ({ ...prev, barcode: event.target.value }))} />
                  </div>
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-xs text-muted-foreground">Linha digitavel</label>
                    <Input value={editInvoiceForm.digitableLine} onChange={event => setEditInvoiceForm(prev => ({ ...prev, digitableLine: event.target.value }))} />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setEditingInvoice(null)} disabled={invoiceSaving}>Cancelar</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => void saveInvoiceEdit()} disabled={invoiceSaving}>
                {invoiceSaving ? 'Salvando...' : 'Salvar fatura'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
