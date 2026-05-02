"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'
import { exportListPdf } from '@/lib/pdf'

export default function Clientes() {
  const [list, setList] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<any>(null)

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
      ['Nome', 'Email', 'Telefone'],
      ['name', 'email', 'phone'],
      list.map(customer => ({
        name: customer.name,
        email: customer.email || '-',
        phone: customer.phone || '-'
      })),
      'clientes.pdf'
    )
  }

  function openNew() {
    setForm({})
    setModal(true)
  }

  function openEdit(customer: any) {
    setForm(customer)
    setModal(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/customers', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!response.ok) throw new Error('Erro ao salvar cliente')

      setToast({ message: 'Cliente salvo com sucesso', type: 'success' })
      setModal(false)
      setForm({})
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
          <p className="text-muted-foreground">Gerencie os clientes usados nas ordens de serviço.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum cliente cadastrado.</TableCell>
                  </TableRow>
                )}
                {list.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2 bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => openEdit(customer)}>Editar</Button>
                      <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => remove(customer.id)}>Excluir</Button>
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
              <CardTitle>{form.id ? 'Editar cliente' : 'Novo cliente'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={save} className="space-y-4">
                <Input placeholder="Nome" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                <Input placeholder="Telefone" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
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
