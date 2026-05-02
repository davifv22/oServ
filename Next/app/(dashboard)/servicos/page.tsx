"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatCurrencyBRL, formatCurrencyInput, numberToCurrencyInput, parseCurrencyInput } from '@/lib/br'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'
import { exportListPdf } from '@/lib/pdf'

type ServiceForm = {
  id?: string
  name: string
  priceInput: string
}

const EMPTY_FORM: ServiceForm = {
  name: '',
  priceInput: '0,00'
}

export default function Servicos() {
  const [list, setList] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<any>(null)
  const [sortKey, setSortKey] = useState<'name' | 'price'>('name')
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
      if (sortKey === 'price') {
        const aPrice = Number(a?.price || 0)
        const bPrice = Number(b?.price || 0)
        return sortDir === 'asc' ? aPrice - bPrice : bPrice - aPrice
      }

      const aValue = String(a?.name || '').toLowerCase()
      const bValue = String(b?.name || '').toLowerCase()
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

  function toggleSort(nextKey: 'name' | 'price') {
    if (sortKey === nextKey) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextKey)
    setSortDir('asc')
  }

  function sortIndicator(key: 'name' | 'price') {
    if (sortKey !== key) return '↕'
    return sortDir === 'asc' ? '↑' : '↓'
  }

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/services')
      if (!res.ok) throw new Error('Erro ao carregar servicos')
      setList(await res.json())
    } catch {
      setToast({ message: 'Erro ao carregar servicos', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function exportServicesPdf() {
    if (list.length === 0) {
      setToast({ message: 'Nenhum servico para exportar', type: 'info' })
      return
    }

    await exportListPdf(
      'Servicos',
      ['Servico', 'Preco'],
      ['name', 'price'],
      list.map(item => ({
        name: item.name,
        price: formatCurrencyBRL(item.price || 0)
      })),
      'servicos.pdf'
    )
  }

  function openNew() {
    setForm(EMPTY_FORM)
    setModal(true)
  }

  function openEdit(service: any) {
    setForm({
      id: service.id,
      name: service.name || '',
      priceInput: numberToCurrencyInput(service.price || 0)
    })
    setModal(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()

    if (!String(form.name || '').trim()) {
      setToast({ message: 'Informe o nome do servico', type: 'error' })
      return
    }

    const parsedPrice = parseCurrencyInput(form.priceInput)
    if (parsedPrice < 0) {
      setToast({ message: 'Informe um valor valido', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const payload = {
        id: form.id,
        name: String(form.name || '').trim(),
        price: parsedPrice
      }

      const res = await fetch('/api/services', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Erro ao salvar servico')

      setToast({ message: 'Servico salvo com sucesso', type: 'success' })
      setModal(false)
      setForm(EMPTY_FORM)
      await load()
    } catch {
      setToast({ message: 'Erro ao salvar servico', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Deseja excluir este servico?')) return

    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir servico')
      setToast({ message: 'Servico removido com sucesso', type: 'info' })
      await load()
    } catch {
      setToast({ message: 'Erro ao excluir servico', type: 'error' })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Servicos</h2>
          <p className="text-muted-foreground">Cadastro dos servicos usados nas ordens de servico.</p>
        </div>
        <div className="flex gap-2 flex-wrap items-end">
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground block">Limite</label>
              <Select value={limitInput} onChange={e => setLimitInput(e.target.value)}>
                <option value="50">50</option>
                <option value="150">150</option>
                <option value="200">200</option>
              </Select>
            </div>
          </div>
          <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void exportServicesPdf()}>Exportar PDF</Button>
          <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={openNew}>Novo servico</Button>
        </div>
      </div>

      {loading ? (
        <Loader label="Carregando servicos..." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('name')}>
                      Servico <span>{sortIndicator('name')}</span>
                    </button>
                  </TableHead>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('price')}>
                      Preco <span>{sortIndicator('price')}</span>
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">Nenhum servico cadastrado.</TableCell>
                  </TableRow>
                )}
                {paginatedList.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{formatCurrencyBRL(item.price)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2 bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => openEdit(item)}>Editar</Button>
                      <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => remove(item.id)}>Excluir</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-app-border px-4 py-3">
              <small className="text-muted-foreground">
                Exibindo {pageStart}-{pageEnd} de {sortedList.length} registros
              </small>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                <small className="text-muted-foreground">Pagina {page} de {totalPages}</small>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text"
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page >= totalPages}
                >
                  Proxima
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModal(false)}>
          <Card className="w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <CardContent className="pt-6">
              <form onSubmit={save} className="space-y-4">
                <Input placeholder="Nome do servico" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                <Input
                  inputMode="numeric"
                  placeholder="0,00"
                  value={form.priceInput}
                  onChange={e => setForm({ ...form, priceInput: formatCurrencyInput(e.target.value) })}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => setModal(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Salvar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
