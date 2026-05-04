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

type MaterialForm = {
  id?: string
  name: string
  unit: string
  unitPriceInput: string
}

const EMPTY_FORM: MaterialForm = {
  name: '',
  unit: 'UN',
  unitPriceInput: '0,00'
}

export default function MateriaisPage() {
  const [list, setList] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<MaterialForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<any>(null)
  const [sortKey, setSortKey] = useState<'name' | 'unit' | 'unitPrice'>('name')
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
      if (sortKey === 'unitPrice') {
        const diff = Number(a?.unitPrice || 0) - Number(b?.unitPrice || 0)
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
      const response = await fetch('/api/materials')
      if (!response.ok) throw new Error('Erro ao carregar materiais')
      setList(await response.json())
    } catch {
      setToast({ message: 'Erro ao carregar materiais', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  function toggleSort(nextKey: 'name' | 'unit' | 'unitPrice') {
    if (sortKey === nextKey) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextKey)
    setSortDir('asc')
  }

  function sortIndicator(key: 'name' | 'unit' | 'unitPrice') {
    if (sortKey !== key) return '?'
    return sortDir === 'asc' ? '?' : '?'
  }

  function openNew() {
    setForm(EMPTY_FORM)
    setModal(true)
  }

  function openEdit(material: any) {
    setForm({
      id: material.id,
      name: material.name || '',
      unit: material.unit || 'UN',
      unitPriceInput: numberToCurrencyInput(material.unitPrice || 0)
    })
    setModal(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()

    if (!String(form.name || '').trim()) {
      setToast({ message: 'Informe o nome do material', type: 'error' })
      return
    }

    const unitPrice = parseCurrencyInput(form.unitPriceInput)
    if (unitPrice < 0) {
      setToast({ message: 'Informe um valor valido', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/materials', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          name: String(form.name || '').trim(),
          unit: String(form.unit || 'UN').trim() || 'UN',
          unitPrice
        })
      })

      if (!response.ok) throw new Error('Erro ao salvar material')

      setToast({ message: 'Material salvo com sucesso', type: 'success' })
      setModal(false)
      setForm(EMPTY_FORM)
      await load()
    } catch {
      setToast({ message: 'Erro ao salvar material', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Deseja excluir este material?')) return

    try {
      const response = await fetch(`/api/materials?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erro ao excluir material')
      setToast({ message: 'Material removido com sucesso', type: 'info' })
      await load()
    } catch {
      setToast({ message: 'Erro ao excluir material', type: 'error' })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Materiais</h2>
          <p className="text-muted-foreground">Cadastro de materiais para composicao das ordens de servico.</p>
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
          <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={openNew}>Novo material</Button>
        </div>
      </div>

      {loading ? (
        <Loader label="Carregando materiais..." />
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
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('unit')}>
                      Unidade <span>{sortIndicator('unit')}</span>
                    </button>
                  </TableHead>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('unitPrice')}>
                      Valor unitario <span>{sortIndicator('unitPrice')}</span>
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum material cadastrado.</TableCell>
                  </TableRow>
                )}

                {paginatedList.map(material => (
                  <TableRow key={material.id}>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.unit || '-'}</TableCell>
                    <TableCell>{formatCurrencyBRL(material.unitPrice || 0)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2 bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => openEdit(material)}>Editar</Button>
                      <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => remove(material.id)}>Excluir</Button>
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
          <Card className="modal-card" onClick={e => e.stopPropagation()}>
            <form onSubmit={save} className="space-y-4">
              <h5 className="text-lg font-semibold">{form.id ? 'Editar material' : 'Novo material'}</h5>
              <Input placeholder="Nome do material" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Unidade (UN, KG, L...)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
              <Input inputMode="numeric" placeholder="0,00" value={form.unitPriceInput} onChange={e => setForm({ ...form, unitPriceInput: formatCurrencyInput(e.target.value) })} />

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
