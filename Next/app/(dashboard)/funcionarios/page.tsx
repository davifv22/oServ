"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

  async function exportEmployeesPdf() {
    if (list.length === 0) {
      setToast({ message: 'Nenhum funcionário para exportar', type: 'info' })
      return
    }

    await exportListPdf(
      'Funcionários',
      ['Nome', 'Email', 'Telefone', 'Cargo', 'Acesso'],
      ['name', 'email', 'phone', 'position', 'access'],
      list.map(employee => ({
        name: employee.name,
        email: employee.email || '-',
        phone: employee.phone || '-',
        position: employee.position || '-',
        access: employee.hasAccess ? 'Sim' : 'Não'
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
      phone: employee.phone || '',
      position: employee.position || '',
      hasAccess: Boolean(employee.hasAccess),
      userId: employee.userId || null,
      accessPassword: ''
    })
    setModal(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/employees', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
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
          <h2 className="text-2xl font-bold">Funcionários</h2>
          <p className="text-muted-foreground">Gerencie funcionários e acesso ao sistema.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void exportEmployeesPdf()}>Exportar PDF</Button>
          <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={openNew}>Novo funcionário</Button>
        </div>
      </div>

      {loading ? (
        <Loader label="Carregando funcionários..." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum funcionário cadastrado.</TableCell>
                  </TableRow>
                )}
                {list.map(employee => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email || '-'}</TableCell>
                    <TableCell>{employee.phone || '-'}</TableCell>
                    <TableCell>{employee.position || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={employee.hasAccess ? "default" : "secondary"}>
                        {employee.hasAccess ? 'Sim' : 'Não'}
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
          </CardContent>
        </Card>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModal(false)}>
          <Card className="w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>{form.id ? 'Editar funcionário' : 'Novo funcionário'}</CardTitle>
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
                  onChange={e => setForm({ ...form, phone: e.target.value })}
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
                      placeholder={shouldRequirePassword ? 'Senha de acesso (mínimo 6 caracteres)' : 'Nova senha (opcional)'}
                      value={form.accessPassword}
                      onChange={e => setForm({ ...form, accessPassword: e.target.value })}
                      required={shouldRequirePassword}
                      minLength={shouldRequirePassword ? 6 : undefined}
                    />
                    <p className="text-sm text-muted-foreground">
                      {shouldRequirePassword
                        ? 'Este funcionário ainda não possui login. Defina a senha para criar o acesso.'
                        : 'Preencha apenas se quiser redefinir a senha de login do funcionário.'}
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
