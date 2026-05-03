"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

type VehicleForm = {
  id?: string
  plate: string
  brand: string
  model: string
  modelYear: string
  color: string
  mileage: string
  notes: string
}

const EMPTY_FORM: VehicleForm = {
  plate: '',
  brand: '',
  model: '',
  modelYear: '',
  color: '',
  mileage: '',
  notes: ''
}

export default function VeiculosPage() {
  const [list, setList] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<VehicleForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<any>(null)
  const [sortKey, setSortKey] = useState<'plate' | 'model' | 'brand'>('plate')
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
      const vehiclesRes = await fetch('/api/vehicles')

      if (!vehiclesRes.ok) {
        throw new Error('Erro ao carregar dados')
      }

      setList(await vehiclesRes.json())
    } catch {
      setToast({ message: 'Erro ao carregar veiculos', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  function toggleSort(nextKey: 'plate' | 'model' | 'brand') {
    if (sortKey === nextKey) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextKey)
    setSortDir('asc')
  }

  function sortIndicator(key: 'plate' | 'model' | 'brand') {
    if (sortKey !== key) return '?'
    return sortDir === 'asc' ? '?' : '?'
  }

  function openNew() {
    setForm(EMPTY_FORM)
    setModal(true)
  }

  function openEdit(vehicle: any) {
    setForm({
      id: vehicle.id,
      plate: vehicle.plate || '',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      modelYear: vehicle.modelYear ? String(vehicle.modelYear) : '',
      color: vehicle.color || '',
      mileage: vehicle.mileage ? String(vehicle.mileage) : '',
      notes: vehicle.notes || ''
    })
    setModal(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()

    if (!String(form.plate || '').trim()) {
      setToast({ message: 'Informe a placa do veiculo', type: 'error' })
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/vehicles', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          plate: String(form.plate || '').toUpperCase().trim(),
          brand: form.brand || null,
          model: form.model || null,
          modelYear: form.modelYear ? Number(form.modelYear) : null,
          color: form.color || null,
          mileage: form.mileage ? Number(form.mileage) : null,
          notes: form.notes || null
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Erro ao salvar veiculo')
      }

      setToast({ message: 'Veiculo salvo com sucesso', type: 'success' })
      setModal(false)
      setForm(EMPTY_FORM)
      await load()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar veiculo'
      setToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Deseja excluir este veiculo?')) return

    try {
      const response = await fetch(`/api/vehicles?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erro ao excluir veiculo')
      setToast({ message: 'Veiculo removido com sucesso', type: 'info' })
      await load()
    } catch {
      setToast({ message: 'Erro ao excluir veiculo', type: 'error' })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Veiculos</h2>
          <p className="text-muted-foreground">Cadastro da frota para operacoes de deslocamento nas OS.</p>
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
          <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={openNew}>Novo veiculo</Button>
        </div>
      </div>

      {loading ? (
        <Loader label="Carregando veiculos..." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('plate')}>
                      Placa <span>{sortIndicator('plate')}</span>
                    </button>
                  </TableHead>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('model')}>
                      Modelo <span>{sortIndicator('model')}</span>
                    </button>
                  </TableHead>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('brand')}>
                      Marca <span>{sortIndicator('brand')}</span>
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum veiculo cadastrado.</TableCell>
                  </TableRow>
                )}

                {paginatedList.map(vehicle => (
                  <TableRow key={vehicle.id}>
                    <TableCell>{vehicle.plate}</TableCell>
                    <TableCell>{vehicle.model || '-'}</TableCell>
                    <TableCell>{vehicle.brand || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2 bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => openEdit(vehicle)}>Editar</Button>
                      <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => remove(vehicle.id)}>Excluir</Button>
                    </TableCell>
                  </TableRow>
                ))}
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
          <Card className="modal-card modal-card-lg" onClick={e => e.stopPropagation()}>
            <form onSubmit={save} className="space-y-4">
              <h5 className="text-lg font-semibold">{form.id ? 'Editar veiculo' : 'Novo veiculo'}</h5>

              <div className="grid gap-3 md:grid-cols-12">
                <div className="md:col-span-6 space-y-1">
                  <label className="text-xs text-muted-foreground block">Placa</label>
                  <Input value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value.toUpperCase() })} />
                </div>
                <div className="md:col-span-6 space-y-1">
                  <label className="text-xs text-muted-foreground block">Marca</label>
                  <Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
                </div>
                <div className="md:col-span-6 space-y-1">
                  <label className="text-xs text-muted-foreground block">Modelo</label>
                  <Input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs text-muted-foreground block">Ano</label>
                  <Input type="number" value={form.modelYear} onChange={e => setForm({ ...form, modelYear: e.target.value })} />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs text-muted-foreground block">Cor</label>
                  <Input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs text-muted-foreground block">Quilometragem</label>
                  <Input type="number" value={form.mileage} onChange={e => setForm({ ...form, mileage: e.target.value })} />
                </div>
                <div className="md:col-span-12 space-y-1">
                  <label className="text-xs text-muted-foreground block">Observacoes</label>
                  <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
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
