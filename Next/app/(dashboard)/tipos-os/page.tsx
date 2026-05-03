"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrencyBRL, formatCurrencyInput, numberToCurrencyInput, parseCurrencyInput } from '@/lib/br'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

type DraftItem = {
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

type OrderTypeForm = {
  id?: string
  name: string
  description: string
  defaultPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  items: DraftItem[]
}

type OrderTypeRow = {
  id: string
  name: string
  description?: string | null
  defaultPriority: string
  createdAt?: string
  updatedAt?: string
  items?: Array<{
    id: string
    itemType: 'SERVICE' | 'MATERIAL'
    serviceId?: string | null
    materialId?: string | null
    description?: string | null
    quantity?: number
    unitPrice?: number
    total?: number
    service?: { id: string; name: string } | null
    material?: { id: string; name: string; unit?: string } | null
  }>
}

function createItem(itemType: 'SERVICE' | 'MATERIAL' = 'SERVICE'): DraftItem {
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

function calcItemTotal(item: DraftItem) {
  return Number((Number(item.quantity || 0) * Number(item.unitPrice || 0)).toFixed(2))
}

function calcItemsTotal(items: DraftItem[]) {
  return Number(items.reduce((sum, item) => sum + Number(item.total || 0), 0).toFixed(2))
}

const EMPTY_FORM: OrderTypeForm = {
  name: '',
  description: '',
  defaultPriority: 'MEDIUM',
  items: [createItem('SERVICE')]
}

const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente'
}

export default function TiposOsPage() {
  const [list, setList] = useState<OrderTypeRow[]>([])
  const [services, setServices] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<OrderTypeForm>(EMPTY_FORM)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null)
  const [sortKey, setSortKey] = useState<'name' | 'defaultPriority' | 'itemsCount' | 'updatedAt'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [limitInput, setLimitInput] = useState('50')
  const [page, setPage] = useState(1)

  const rowLimit = useMemo(() => {
    const parsed = Number(limitInput)
    if (!Number.isFinite(parsed) || parsed <= 0) return 50
    return Math.floor(parsed)
  }, [limitInput])

  const sortedList = useMemo(() => {
    return [...list].sort((a, b) => {
      if (sortKey === 'updatedAt') {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime()
        const diff = aTime - bTime
        return sortDir === 'asc' ? diff : -diff
      }

      if (sortKey === 'itemsCount') {
        const aCount = Number(a.items?.length || 0)
        const bCount = Number(b.items?.length || 0)
        const diff = aCount - bCount
        return sortDir === 'asc' ? diff : -diff
      }

      const aValue = String(a?.[sortKey] || '').toLowerCase()
      const bValue = String(b?.[sortKey] || '').toLowerCase()
      const comp = aValue.localeCompare(bValue, 'pt-BR', { sensitivity: 'base' })
      return sortDir === 'asc' ? comp : -comp
    })
  }, [list, sortDir, sortKey])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(sortedList.length / rowLimit)), [sortedList.length, rowLimit])

  useEffect(() => {
    setPage(1)
  }, [sortKey, sortDir, rowLimit])

  useEffect(() => {
    setPage(prev => Math.min(prev, totalPages))
  }, [totalPages])

  const paginatedList = useMemo(() => {
    const start = (page - 1) * rowLimit
    return sortedList.slice(start, start + rowLimit)
  }, [page, rowLimit, sortedList])

  const pageStart = sortedList.length === 0 ? 0 : (page - 1) * rowLimit + 1
  const pageEnd = Math.min(page * rowLimit, sortedList.length)

  async function load() {
    setLoading(true)

    try {
      const [typesRes, servicesRes, materialsRes] = await Promise.all([
        fetch('/api/order-types', { cache: 'no-store' }),
        fetch('/api/services', { cache: 'no-store' }),
        fetch('/api/materials', { cache: 'no-store' })
      ])

      if (!typesRes.ok || !servicesRes.ok || !materialsRes.ok) {
        throw new Error('Erro ao carregar dados')
      }

      const [typesPayload, servicesPayload, materialsPayload] = await Promise.all([
        typesRes.json() as Promise<OrderTypeRow[]>,
        servicesRes.json(),
        materialsRes.json()
      ])

      setList(typesPayload)
      setServices(servicesPayload)
      setMaterials(materialsPayload)
    } catch {
      setToast({ message: 'Erro ao carregar tipos de OS', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  function toggleSort(nextKey: 'name' | 'defaultPriority' | 'itemsCount' | 'updatedAt') {
    if (sortKey === nextKey) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextKey)
    setSortDir(nextKey === 'updatedAt' ? 'desc' : 'asc')
  }

  function sortIndicator(key: 'name' | 'defaultPriority' | 'itemsCount' | 'updatedAt') {
    if (sortKey !== key) return '-'
    return sortDir === 'asc' ? '^' : 'v'
  }

  function openNew() {
    setForm({ ...EMPTY_FORM, items: [createItem('SERVICE')] })
    setModal(true)
  }

  function openEdit(entry: OrderTypeRow) {
    const mappedItems: DraftItem[] = (entry.items || []).map(item => {
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

    setForm({
      id: entry.id,
      name: entry.name || '',
      description: entry.description || '',
      defaultPriority: (entry.defaultPriority as OrderTypeForm['defaultPriority']) || 'MEDIUM',
      items: mappedItems.length > 0 ? mappedItems : [createItem('SERVICE')]
    })

    setModal(true)
  }

  function syncItems(nextItems: DraftItem[]) {
    setForm(prev => ({ ...prev, items: nextItems }))
  }

  function addItem(itemType: 'SERVICE' | 'MATERIAL') {
    syncItems([...(form.items || []), createItem(itemType)])
  }

  function removeItem(itemId: string) {
    const filtered = (form.items || []).filter(item => item.id !== itemId)
    syncItems(filtered.length > 0 ? filtered : [createItem('SERVICE')])
  }

  function updateItem(itemId: string, updater: (item: DraftItem) => DraftItem) {
    const nextItems = (form.items || []).map(item => {
      if (item.id !== itemId) return item
      const next = updater(item)
      return { ...next, total: calcItemTotal(next) }
    })

    syncItems(nextItems)
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()

    const name = String(form.name || '').trim()
    if (!name) {
      setToast({ message: 'Informe o nome do tipo de OS', type: 'error' })
      return
    }

    const itemsPayload = (form.items || [])
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
      setToast({ message: 'Adicione pelo menos um servico ou material no Tipo de OS', type: 'error' })
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/order-types', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          name,
          description: form.description || null,
          defaultPriority: form.defaultPriority,
          items: itemsPayload
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Erro ao salvar tipo de OS')
      }

      setToast({ message: 'Tipo de OS salvo com sucesso', type: 'success' })
      setModal(false)
      setForm({ ...EMPTY_FORM, items: [createItem('SERVICE')] })
      await load()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar tipo de OS'
      setToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Deseja excluir este tipo de OS?')) return

    try {
      const response = await fetch(`/api/order-types?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erro ao excluir tipo de OS')
      setToast({ message: 'Tipo de OS removido', type: 'info' })
      await load()
    } catch {
      setToast({ message: 'Erro ao excluir tipo de OS', type: 'error' })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Tipos de OS</h2>
          <p className="text-muted-foreground">Cadastre modelos com servicos e materiais pre-definidos para acelerar a criacao da OS.</p>
        </div>
        <div className="flex gap-2 flex-wrap items-end">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block">Limite</label>
            <Select value={limitInput} onChange={e => setLimitInput(e.target.value)}>
              <option value="50">50</option>
              <option value="150">150</option>
              <option value="200">200</option>
            </Select>
          </div>
          <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={openNew}>Novo tipo</Button>
        </div>
      </div>

      {loading ? (
        <Loader label="Carregando tipos de OS..." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('name')}>
                      Nome <span>{sortIndicator('name')}</span>
                    </button>
                  </TableHead>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('defaultPriority')}>
                      Prioridade <span>{sortIndicator('defaultPriority')}</span>
                    </button>
                  </TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('itemsCount')}>
                      Itens <span>{sortIndicator('itemsCount')}</span>
                    </button>
                  </TableHead>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('updatedAt')}>
                      Atualizado <span>{sortIndicator('updatedAt')}</span>
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum tipo de OS cadastrado.</TableCell>
                  </TableRow>
                )}
                {paginatedList.map(entry => {
                  const items = entry.items || []
                  const templateTotal = calcItemsTotal(
                    items.map(item => ({
                      id: item.id,
                      itemType: item.itemType,
                      serviceId: item.serviceId || '',
                      materialId: item.materialId || '',
                      description: item.description || '',
                      quantity: Number(item.quantity || 0),
                      unitPrice: Number(item.unitPrice || 0),
                      unitPriceInput: numberToCurrencyInput(item.unitPrice || 0),
                      total: Number(item.total || 0)
                    }))
                  )

                  return (
                    <TableRow key={entry.id}>
                      <TableCell><strong>{entry.name}</strong></TableCell>
                      <TableCell>{PRIORITY_LABEL[entry.defaultPriority] || entry.defaultPriority}</TableCell>
                      <TableCell>{entry.description || '-'}</TableCell>
                      <TableCell>
                        <strong>{items.length}</strong>
                        <small className="block text-muted-foreground">{formatCurrencyBRL(templateTotal)}</small>
                      </TableCell>
                      <TableCell>{new Date(entry.updatedAt || entry.createdAt || '').toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2 bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => openEdit(entry)}>Editar</Button>
                        <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => remove(entry.id)}>Excluir</Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-app-border px-4 py-3">
              <small className="text-muted-foreground">Exibindo {pageStart}-{pageEnd} de {sortedList.length} registros</small>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page <= 1}>Anterior</Button>
                <small className="text-muted-foreground">Pagina {page} de {totalPages}</small>
                <Button type="button" variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page >= totalPages}>Proxima</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {modal && (
        <div className="modal-backdrop-custom" onClick={() => setModal(false)}>
          <Card className="modal-card modal-card-xxl" onClick={event => event.stopPropagation()}>
            <form onSubmit={save} className="space-y-4">
              <h5 className="text-lg font-semibold">{form.id ? 'Editar tipo de OS' : 'Novo tipo de OS'}</h5>

              <div className="grid gap-3 md:grid-cols-12">
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs text-muted-foreground block">Nome</label>
                  <Input value={form.name} onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))} />
                </div>
                <div className="md:col-span-3 space-y-1">
                  <label className="text-xs text-muted-foreground block">Prioridade padrao</label>
                  <Select value={form.defaultPriority} onChange={event => setForm(prev => ({ ...prev, defaultPriority: event.target.value as OrderTypeForm['defaultPriority'] }))}>
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </Select>
                </div>
                <div className="md:col-span-5 space-y-1">
                  <label className="text-xs text-muted-foreground block">Descricao</label>
                  <Textarea rows={2} value={form.description} onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-sm font-medium">Itens do tipo (servicos e materiais)</label>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => addItem('SERVICE')}>+ Servico</Button>
                    <Button type="button" size="sm" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => addItem('MATERIAL')}>+ Material</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {(form.items || []).map((item, index) => (
                    <div key={item.id} className="rounded-xl border border-app-border bg-app-surface p-3">
                      <div className="grid gap-2 md:grid-cols-12">
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs text-muted-foreground block">Tipo</label>
                          <Select
                            value={item.itemType}
                            onChange={event => updateItem(item.id, current => ({
                              ...current,
                              itemType: event.target.value === 'MATERIAL' ? 'MATERIAL' : 'SERVICE',
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
                          <label className="text-xs text-muted-foreground block">Item</label>
                          {item.itemType === 'MATERIAL' ? (
                            <Select
                              value={item.materialId}
                              onChange={event => {
                                const material = materials.find((entry: any) => entry.id === event.target.value)
                                updateItem(item.id, current => ({
                                  ...current,
                                  materialId: event.target.value,
                                  serviceId: '',
                                  description: current.description || material?.name || '',
                                  unitPrice: Number(material?.unitPrice || 0),
                                  unitPriceInput: numberToCurrencyInput(material?.unitPrice || 0)
                                }))
                              }}
                            >
                              <option value="">Selecione</option>
                              {materials.map(material => (
                                <option key={material.id} value={material.id}>{material.name}</option>
                              ))}
                            </Select>
                          ) : (
                            <Select
                              value={item.serviceId}
                              onChange={event => {
                                const service = services.find((entry: any) => entry.id === event.target.value)
                                updateItem(item.id, current => ({
                                  ...current,
                                  serviceId: event.target.value,
                                  materialId: '',
                                  description: current.description || service?.name || '',
                                  unitPrice: Number(service?.price || 0),
                                  unitPriceInput: numberToCurrencyInput(service?.price || 0)
                                }))
                              }}
                            >
                              <option value="">Selecione</option>
                              {services.map(service => (
                                <option key={service.id} value={service.id}>{service.name}</option>
                              ))}
                            </Select>
                          )}
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs text-muted-foreground block">Qtd</label>
                          <Input type="number" min="0" step="0.01" value={item.quantity} onChange={event => updateItem(item.id, current => ({ ...current, quantity: Math.max(Number(event.target.value || 0), 0) }))} />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs text-muted-foreground block">Unit.</label>
                          <Input
                            inputMode="numeric"
                            value={item.unitPriceInput}
                            onChange={event => {
                              const masked = formatCurrencyInput(event.target.value)
                              updateItem(item.id, current => ({ ...current, unitPriceInput: masked, unitPrice: parseCurrencyInput(masked) }))
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
                            <Input value={item.description} onChange={event => updateItem(item.id, current => ({ ...current, description: event.target.value }))} placeholder={`Item ${index + 1}`} />
                            <Button type="button" size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => removeItem(item.id)}>Remover</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-app-border bg-app-surface p-3 flex justify-between items-center">
                <small className="text-muted-foreground">Total estimado do template</small>
                <strong>{formatCurrencyBRL(calcItemsTotal(form.items || []))}</strong>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setModal(false)}>Cancelar</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Salvar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

