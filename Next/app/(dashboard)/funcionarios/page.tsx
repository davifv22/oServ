"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { formatPhone, isValidPhone, maskPhone, normalizePhone } from '@/lib/br'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'
import { exportListPdf } from '@/lib/pdf'

type EmployeeRow = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  position?: string | null
  hasAccess: boolean
  userId?: string | null
}

type EmployeeForm = {
  id?: string
  name: string
  email: string
  phone: string
  position: string
  hasAccess: boolean
  userId?: string | null
  accessPassword: string
}

const EMPTY_FORM: EmployeeForm = {
  name: '',
  email: '',
  phone: '',
  position: '',
  hasAccess: false,
  userId: null,
  accessPassword: ''
}

export default function Funcionarios() {
  const [list, setList] = useState<EmployeeRow[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<EmployeeForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null)
  const [sortKey, setSortKey] = useState<'name' | 'email' | 'phone' | 'position' | 'hasAccess'>('name')
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
      if (sortKey === 'hasAccess') {
        const aValue = a.hasAccess ? 1 : 0
        const bValue = b.hasAccess ? 1 : 0
        return sortDir === 'asc' ? aValue - bValue : bValue - aValue
      }

      const aValue = String((a as any)?.[sortKey] || '').toLowerCase()
      const bValue = String((b as any)?.[sortKey] || '').toLowerCase()
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

  function toggleSort(nextKey: 'name' | 'email' | 'phone' | 'position' | 'hasAccess') {
    if (sortKey === nextKey) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextKey)
    setSortDir('asc')
  }

  function sortIndicator(key: 'name' | 'email' | 'phone' | 'position' | 'hasAccess') {
    if (sortKey !== key) return '↕'
    return sortDir === 'asc' ? '↑' : '↓'
  }

  async function exportEmployeesPdf() {
    if (list.length === 0) {
      setToast({ message: 'Nenhum funcionario para exportar', type: 'info' })
      return
    }

    await exportListPdf(
      'Funcionarios',
      ['Nome', 'Email', 'Telefone', 'Cargo', 'Acesso'],
      ['name', 'email', 'phone', 'position', 'access'],
      list.map(employee => ({
        name: employee.name,
        email: employee.email || '-',
        phone: formatPhone(employee.phone) || '-',
        position: employee.position || '-',
        access: employee.hasAccess ? 'Sim' : 'Nao'
      })),
      'funcionarios.pdf'
    )
  }

  async function load() {
    setLoading(true)
    try {
      const response = await fetch('/api/employees')
      if (!response.ok) throw new Error('Erro ao carregar funcionarios')
      setList(await response.json())
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar funcionarios'
      setToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function openNew() {
    setForm(EMPTY_FORM)
    setModal(true)
  }

  function openEdit(employee: EmployeeRow) {
    setForm({
      id: employee.id,
      name: employee.name || '',
      email: employee.email || '',
      phone: formatPhone(employee.phone || ''),
      position: employee.position || '',
      hasAccess: Boolean(employee.hasAccess),
      userId: employee.userId || null,
      accessPassword: ''
    })
    setModal(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()

    if (form.phone && !isValidPhone(form.phone)) {
      setToast({ message: 'Telefone invalido. Informe DDD e numero corretos.', type: 'error' })
      return
    }

    const payload = {
      ...form,
      phone: normalizePhone(form.phone)
    }

    setLoading(true)

    try {
      const response = await fetch('/api/employees', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao salvar funcionario')
      }

      setToast({ message: 'Funcionario salvo com sucesso', type: 'success' })
      setModal(false)
      setForm(EMPTY_FORM)
      await load()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar funcionario'
      setToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Deseja excluir este funcionario?')) return

    try {
      const response = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' })
      const data = await response.json().catch(() => null)

      if (!response.ok) throw new Error(data?.error || 'Erro ao excluir funcionario')

      setToast({ message: 'Funcionario removido com sucesso', type: 'info' })
      await load()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir funcionario'
      setToast({ message, type: 'error' })
    }
  }

  const shouldShowPassword = Boolean(form.hasAccess)
  const shouldRequirePassword = Boolean(form.hasAccess && !form.userId)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Funcionarios</h2>
          <p className="text-muted-foreground">Gerencie funcionarios e acesso ao sistema.</p>
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
          <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void exportEmployeesPdf()}>Exportar PDF</Button>
          <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={openNew}>Novo funcionario</Button>
        </div>
      </div>

      {loading ? (
        <Loader label="Carregando funcionarios..." />
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
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('email')}>
                      Email <span>{sortIndicator('email')}</span>
                    </button>
                  </TableHead>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('phone')}>
                      Telefone <span>{sortIndicator('phone')}</span>
                    </button>
                  </TableHead>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('position')}>
                      Cargo <span>{sortIndicator('position')}</span>
                    </button>
                  </TableHead>
                  <TableHead>
                    <button type="button" className="table-sort-button" onClick={() => toggleSort('hasAccess')}>
                      Acesso <span>{sortIndicator('hasAccess')}</span>
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum funcionario cadastrado.</TableCell>
                  </TableRow>
                )}
                {paginatedList.map(employee => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email || '-'}</TableCell>
                    <TableCell>{formatPhone(employee.phone) || '-'}</TableCell>
                    <TableCell>{employee.position || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={employee.hasAccess ? "default" : "secondary"}>
                        {employee.hasAccess ? 'Sim' : 'Nao'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2 bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => openEdit(employee)}>Editar</Button>
                      <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => remove(employee.id)}>Excluir</Button>
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
              <CardTitle>{form.id ? 'Editar funcionario' : 'Novo funcionario'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={save} className="space-y-4">
                <Input
                  placeholder="Nome"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required={Boolean(form.hasAccess)}
                />
                <Input
                  placeholder="Telefone"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: maskPhone(e.target.value) })}
                />
                <Input
                  placeholder="Cargo"
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasAccess"
                    checked={Boolean(form.hasAccess)}
                    onChange={e => setForm({ ...form, hasAccess: e.target.checked, accessPassword: '' })}
                    className="rounded"
                  />
                  <label htmlFor="hasAccess" className="text-sm">Permitir acesso ao sistema</label>
                </div>

                {shouldShowPassword && (
                  <>
                    <Input
                      type="password"
                      placeholder={shouldRequirePassword ? 'Senha de acesso (minimo 6 caracteres)' : 'Nova senha (opcional)'}
                      value={form.accessPassword}
                      onChange={e => setForm({ ...form, accessPassword: e.target.value })}
                      required={shouldRequirePassword}
                      minLength={shouldRequirePassword ? 6 : undefined}
                    />
                    <p className="text-sm text-muted-foreground">
                      {shouldRequirePassword
                        ? 'Este funcionario ainda nao possui login. Defina a senha para criar o acesso.'
                        : 'Preencha apenas se quiser redefinir a senha de login do funcionario.'}
                    </p>
                  </>
                )}

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
