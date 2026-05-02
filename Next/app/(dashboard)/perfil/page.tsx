"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Loader from '@/components/Loader'
import Toast from '@/components/Toast'

function getInitials(name?: string) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Perfil() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [profile, setProfile] = useState({ name: '', email: '', avatarUrl: '' })
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' })

  function emitProfileUpdated(nextProfile: { name: string; email: string; avatarUrl: string }) {
    window.dispatchEvent(new CustomEvent('oserv:profile-updated', { detail: nextProfile }))
  }

  async function load() {
    setLoading(true)
    try {
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Erro ao carregar perfil')
      const data = await response.json()
      const nextProfile = {
        name: data.name || '',
        email: data.email || '',
        avatarUrl: data.avatarUrl || ''
      }
      setProfile(nextProfile)
      emitProfileUpdated(nextProfile)
    } catch {
      setToast({ message: 'Erro ao carregar perfil', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email
        })
      })

      if (!response.ok) throw new Error('Erro ao salvar perfil')

      setToast({ message: 'Perfil atualizado com sucesso', type: 'success' })
      emitProfileUpdated(profile)
      await load()
    } catch {
      setToast({ message: 'Erro ao atualizar perfil', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function changePassword(e: React.FormEvent) {
    e.preventDefault()

    if (password.next !== password.confirm) {
      setToast({ message: 'As senhas nao conferem', type: 'error' })
      return
    }

    setPassword({ current: '', next: '', confirm: '' })
    setToast({ message: 'Alteracao de senha sera conectada ao backend na proxima etapa', type: 'info' })
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erro ao enviar foto')

      setProfile(prev => {
        const nextProfile = { ...prev, avatarUrl: data.avatarUrl || '' }
        emitProfileUpdated(nextProfile)
        return nextProfile
      })
      setToast({ message: 'Foto de usuario atualizada com sucesso', type: 'success' })
    } catch (error: any) {
      setToast({ message: error?.message || 'Erro ao enviar foto de usuario', type: 'error' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function removeAvatar() {
    setUploadingAvatar(true)

    try {
      const response = await fetch('/api/profile/avatar', { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erro ao remover foto')

      setProfile(prev => {
        const nextProfile = { ...prev, avatarUrl: data.avatarUrl || '' }
        emitProfileUpdated(nextProfile)
        return nextProfile
      })
      setToast({ message: 'Foto de usuario removida', type: 'info' })
    } catch (error: any) {
      setToast({ message: error?.message || 'Erro ao remover foto de usuario', type: 'error' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Perfil</h2>
        <p className="text-muted-foreground">Gerencie seus dados pessoais e seguranca da conta.</p>
      </div>

      {loading ? <Loader label="Carregando perfil..." /> : (
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>Dados pessoais</CardTitle>
                <p className="text-sm text-muted-foreground">Essas informacoes sao usadas dentro do sistema e nos registros de acoes.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome</label>
                      <Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Salvar perfil</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alterar senha</CardTitle>
                <p className="text-sm text-muted-foreground">Use uma senha forte para manter sua conta segura.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={changePassword} className="space-y-3">
                  <Input type="password" placeholder="Senha atual" value={password.current} onChange={e => setPassword({ ...password, current: e.target.value })} />
                  <Input type="password" placeholder="Nova senha" value={password.next} onChange={e => setPassword({ ...password, next: e.target.value })} />
                  <Input type="password" placeholder="Confirmar nova senha" value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} />

                  <div className="flex justify-end">
                    <Button type="submit" className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent">Alterar senha</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Foto do usuario</CardTitle>
                <p className="text-sm text-muted-foreground">A foto aparece no cabecalho para identificar a sessao ativa.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="profile-avatar-wrap">
                  {profile.avatarUrl ? (
                    <img className="profile-avatar-preview" src={profile.avatarUrl} alt="Foto do usuario" />
                  ) : (
                    <span className="profile-avatar-fallback">{getInitials(profile.name)}</span>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <label className="inline-flex items-center px-3 py-2 text-sm font-medium text-app-text bg-transparent border border-app-border rounded-md cursor-pointer hover:bg-app-surface-alt transition-colors">
                    {uploadingAvatar ? 'Enviando...' : 'Trocar foto'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingAvatar}
                      onChange={event => {
                        const file = event.target.files?.[0]
                        if (file) void uploadAvatar(file)
                        event.currentTarget.value = ''
                      }}
                    />
                  </label>

                  <Button variant="outline" size="sm" className="bg-transparent border-app-border hover:bg-app-surface-alt text-app-text" onClick={() => void removeAvatar()} disabled={uploadingAvatar || !profile.avatarUrl}>
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seguranca da sessao</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Sua sessao e protegida por cookie seguro e expiracao automatica.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permissao</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Seu nivel de acesso sera exibido aqui conforme o perfil do usuario.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
