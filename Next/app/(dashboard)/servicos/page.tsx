"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'
import { exportListPdf } from '@/lib/pdf'

export default function Servicos() {
  const [list, setList] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>({ name: '', price: 0 })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<any>(null)

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
      setToast({ message: 'Nenhum serviço para exportar', type: 'info' })
      return
    }

    await exportListPdf(
      'Serviços',
      ['Serviço', 'Preço'],
      ['name', 'price'],
      list.map(item => ({
        name: item.name,
        price: `R$ ${Number(item.price || 0).toFixed(2).replace('.', ',')}`
      })),
      'servicos.pdf'
    )
  }

  function openNew() {
    setForm({ name: '', price: 0 })
    setModal(true)
  }

  function openEdit(service: any) {
    setForm(service)
    setModal(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/services', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!res.ok) throw new Error('Erro ao salvar serviço')

      setToast({ message: 'Serviço salvo com sucesso', type: 'success' })
      setModal(false)
      setForm({ name: '', price: 0 })
      await load()
    } catch {
      setToast({ message: 'Erro ao salvar serviço', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Deseja excluir este serviço?')) return

    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir serviço')
      setToast({ message: 'Serviço removido com sucesso', type: 'info' })
      await load()
    } catch {
      setToast({ message: 'Erro ao excluir serviço', type: 'error' })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Serviços</h2>
          <p className="text-muted-foreground">Cadastro dos serviços usados nas ordens de serviço.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void exportServicesPdf()}>Exportar PDF</Button>
          <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" onClick={openNew}>Novo serviço</Button>
        </div>
      </div>

      {loading ? (
        <Loader label="Carregando serviços..." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">Nenhum serviço cadastrado.</TableCell>
                  </TableRow>
                )}
                {list.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>R$ {Number(item.price).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2 bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => openEdit(item)}>Editar</Button>
                      <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => remove(item.id)}>Excluir</Button>
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
              <CardTitle>{form.id ? 'Editar serviço' : 'Novo serviço'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={save} className="space-y-4">
                <Input placeholder="Nome do serviço" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                <Input type="number" placeholder="Preço" value={form.price || 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
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
