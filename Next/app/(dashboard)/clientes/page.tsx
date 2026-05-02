"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatDocument, formatPhone, isValidDocument, isValidPhone, maskCpfCnpj, maskPhone, normalizeDocument, normalizePhone } from '@/lib/br'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'
import { exportListPdf } from '@/lib/pdf'

type CustomerForm = {
  id?: string
  name: string
  document: string
  email: string
  phone: string
}

const EMPTY_FORM: CustomerForm = {
  name: '',
  document: '',
  email: '',
  phone: ''
}

export default function Clientes() {
  const [list, setList] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<any>(null)
  const [sortKey, setSortKey] = useState<'name' | 'document' | 'email' | 'phone'>('name')
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

  function toggleSort(nextKey: 'name' | 'document' | 'email' | 'phone') {
    if (sortKey === nextKey) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextKey)
    setSortDir('asc')
  }

  function sortIndicator(key: 'name' | 'document' | 'email' | 'phone') {
    if (sortKey !== key) return '↕'
    return sortDir === 'asc' ? '↑' : '↓'
  }

  async function load() {
    setLoading(true)
    try {
      const response = await fetch('/api/customers')
      if (!response.ok) throw new Error('Erro ao carregar clientes')
      setList(await response.json())
    } catch {
      setToast({ message: 'Erro ao carregar clientes', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function exportClientsPdf() {
    if (list.length === 0) {
      setToast({ message: 'Nenhum cliente para exportar', type: 'info' })
      return
    }

    await exportListPdf(
      'Clientes',
      ['Nome', 'Documento', 'Email', 'Telefone'],
      ['name', 'document', 'email', 'phone'],
      list.map(customer => ({
        name: customer.name,
        document: formatDocument(customer.document) || '-',
        email: customer.email || '-',
        phone: formatPhone(customer.phone) || '-'
      })),
      'clientes.pdf'
    )
  }

  function openNew() {
    setForm(EMPTY_FORM)
    setModal(true)
  }

  function openEdit(customer: any) {
    setForm({
      id: customer.id,
      name: customer.name || '',
      document: formatDocument(customer.document || ''),
      email: customer.email || '',
      phone: formatPhone(customer.phone || '')
    })
    setModal(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()

    if (!String(form.name || '').trim()) {
      setToast({ message: 'Informe o nome do cliente', type: 'error' })
      return
    }

    if (form.document && !isValidDocument(form.document)) {
      setToast({ message: 'Documento invalido. Informe um CPF ou CNPJ valido.', type: 'error' })
      return
    }

    if (form.phone && !isValidPhone(form.phone)) {
      setToast({ message: 'Telefone invalido. Informe DDD e numero corretos.', type: 'error' })
      return
    }

    const payload = {
      ...form,
      name: String(form.name || '').trim(),
      document: normalizeDocument(form.document),
      email: String(form.email || '').trim(),
      phone: normalizePhone(form.phone)
    }

    setLoading(true)

    try {
      const response = await fetch('/api/customers', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Erro ao salvar cliente')

      setToast({ message: 'Cliente salvo com sucesso', type: 'success' })
      setModal(false)
      setForm(EMPTY_FORM)
      await load()
    } catch {
      setToast({ message: 'Erro ao salvar cliente', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Deseja excluir este cliente?')) return

    try {
      const response = await fetch(`/api/customers?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erro ao excluir cliente')
      setToast({ message: 'Cliente removido com sucesso', type: 'info' })
      await load()
    } catch {
      setToast({ message: 'Erro ao excluir cliente', type: 'error' })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Clientes</h2>
          <p className="text-muted-foreground">Gerencie os clientes usados nas ordens de servico.</p>
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
          <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void exportClientsPdf()}>Exportar PDF</Button>
          <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={openNew}>Novo cliente</Button>
        </div>
      </div>

      {loading ? (
        <Loader label="Carregando clientes..." />
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
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('document')}>
                      Documento <span>{sortIndicator('document')}</span>
                    </button>
                  </TableHead>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('email')}>
                      Email <span>{sortIndicator('email')}</span>
                    </button>
                  </TableHead>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('phone')}>
                      Telefone <span>{sortIndicator('phone')}</span>
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum cliente cadastrado.</TableCell>
                  </TableRow>
                )}
                {paginatedList.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{formatDocument(customer.document) || '-'}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>{formatPhone(customer.phone) || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2 bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => openEdit(customer)}>Editar</Button>
                      <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => remove(customer.id)}>Excluir</Button>
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
            <CardHeader>
              <CardTitle>{form.id ? 'Editar cliente' : 'Novo cliente'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={save} className="space-y-4">
                <Input placeholder="Nome" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="CPF/CNPJ" value={form.document || ''} onChange={e => setForm({ ...form, document: maskCpfCnpj(e.target.value) })} />
                <Input placeholder="Email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                <Input placeholder="Telefone" value={form.phone || ''} onChange={e => setForm({ ...form, phone: maskPhone(e.target.value) })} />
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
