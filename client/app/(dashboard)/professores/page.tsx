'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api-client'
import { DataTable } from '@/components/data-table'
import { Plus, Pencil, Trash2, Loader2, Timer, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Professor {
  id: number
  departamento: string
  especializacao?: string
  carga_horaria_semanal: number
  observacoes?: string
  usuario: {
    id: number
    nome: string
    username: string
    email?: string
    telefone?: string
    role: string
    ativo: boolean
  }
}

export default function ProfessoresPage() {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCargaOpen, setIsCargaOpen] = useState(false)
  const [isDispOpen, setIsDispOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Professor | null>(null)
  const [editingCarga, setEditingCarga] = useState<{ id: number; carga: number } | null>(null)
  const [editDispRows, setEditDispRows] = useState<Array<{ dia_semana: string; hora_inicio: string; hora_fim: string }>>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    departamento: '',
    especializacao: '',
    carga_horaria_semanal: 40,
    observacoes: '',
    usuario: {
      nome: '',
      username: '',
      email: '',
      telefone: '',
      senha: '',
      role: 'PROFESSOR',
      ativo: true,
    },
    disponibilidades: [] as Array<{ dia_semana: string; hora_inicio: string; hora_fim: string }>,
  })

  useEffect(() => {
    loadProfessores()
  }, [])

  // Auto-generate username as first.last when name changes
  useEffect(() => {
    const nome = formData.usuario.nome.trim()
    if (!nome) return
    const parts = nome.split(/\s+/)
    const first = parts[0] || ''
    const last = parts.length > 1 ? parts[parts.length - 1] : ''
    const baseUser = (first + '.' + last).toLowerCase().normalize('NFD').replace(/[^a-z\.]/g, '')
    if (!formData.usuario.username) {
      setFormData({
        ...formData,
        usuario: { ...formData.usuario, username: baseUser },
      })
    }
  }, [formData.usuario.nome])

  async function loadProfessores() {
    try {
      const data = await apiClient.get<Professor[]>('/professores/?limit=1000')
      setProfessores(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar professores',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Auto-generate username and email if not provided
      let nome = formData.usuario.nome.trim()
      const parts = nome.split(/\s+/)
      const first = parts[0] || ''
      const last = parts.length > 1 ? parts[parts.length - 1] : ''
      const baseUser = (first + '.' + last).toLowerCase().normalize('NFD').replace(/[^a-z\.]/g, '')
      const usuarioPayload = {
        ...formData.usuario,
        username: formData.usuario.username || baseUser,
        email: formData.usuario.email || `${baseUser || 'user'}@temp.local`,
        telefone: undefined,
      }

      const profPayload = {
        departamento: formData.departamento,
        especializacao: undefined,
        carga_horaria_semanal: formData.carga_horaria_semanal,
        observacoes: formData.observacoes,
        usuario: usuarioPayload,
      }

      const created = await apiClient.post<Professor>('/professores/', profPayload)

      // Persist disponibilidades
      const professorId = created.id
      for (const d of formData.disponibilidades) {
        await apiClient.post('/professor-disponibilidades/', {
          professor_id: professorId,
          dia_semana: d.dia_semana,
          hora_inicio: d.hora_inicio,
          hora_fim: d.hora_fim,
        })
      }
      toast({
        title: 'Sucesso',
        description: 'Professor criado com sucesso',
      })
      setIsDialogOpen(false)
      resetForm()
      loadProfessores()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error?.message || 'Erro ao criar professor',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiClient.delete(`/professores/${id}/`)
      toast({
        title: 'Sucesso',
        description: 'Professor excluído com sucesso',
      })
      loadProfessores()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir professor',
        variant: 'destructive',
      })
    } finally {
      setDeleteId(null)
    }
  }

  async function openDisponibilidade(p: Professor) {
    setIsDispOpen(true)
    // carregar disponibilidades existentes
    try {
      const dados = await apiClient.get<any[]>(`/professor-disponibilidades/por-professor/${p.id}`)
      setEditDispRows(
        ['segunda','terca','quarta','quinta','sexta','sabado'].map((dia)=>{
          const found = dados.find((d:any)=> d.dia_semana === dia)
          return { dia_semana: dia, hora_inicio: found?.hora_inicio || '', hora_fim: found?.hora_fim || '' }
        })
      )
      setEditing(p)
    } catch (e) {
      setEditDispRows(['segunda','terca','quarta','quinta','sexta','sabado'].map((dia)=>({ dia_semana: dia, hora_inicio: '', hora_fim: '' })))
      setEditing(p)
    }
  }

  async function saveDisponibilidade() {
    if (!editing) return
    setIsSaving(true)
    try {
      // apagar todas disponibilidades existentes e recriar simples
      const existentes = await apiClient.get<any[]>(`/professor-disponibilidades/por-professor/${editing.id}`)
      for (const d of existentes) {
        await apiClient.delete(`/professor-disponibilidades/${d.id}`)
      }
      for (const r of editDispRows) {
        if (r.hora_inicio && r.hora_fim) {
          await apiClient.post('/professor-disponibilidades/', {
            professor_id: editing.id,
            dia_semana: r.dia_semana,
            hora_inicio: r.hora_inicio,
            hora_fim: r.hora_fim,
          })
        }
      }
      toast({ title: 'Sucesso', description: 'Disponibilidade atualizada' })
      setIsDispOpen(false)
      setEditing(null)
    } catch (error:any) {
      toast({ title: 'Erro', description: error?.message || 'Erro ao salvar disponibilidade', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setIsSaving(true)
    try {
      const payload = {
        departamento: editing.departamento,
        especializacao: editing.especializacao,
        carga_horaria_semanal: editing.carga_horaria_semanal,
        observacoes: editing.observacoes,
      }
      await apiClient.put(`/professores/${editing.id}/`, payload)
      toast({ title: 'Sucesso', description: 'Professor atualizado com sucesso' })
      setIsEditOpen(false)
      setEditing(null)
      loadProfessores()
    } catch (error: any) {
      toast({ title: 'Erro', description: error?.message || 'Erro ao atualizar professor', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  function resetForm() {
    setFormData({
      departamento: '',
      especializacao: '',
      carga_horaria_semanal: 40,
      observacoes: '',
      usuario: {
        nome: '',
        username: '',
        email: '',
        telefone: '',
        senha: '',
        role: 'PROFESSOR',
        ativo: true,
      },
      disponibilidades: [],
    })
  }

  const columns: ColumnDef<Professor>[] = [
    {
      accessorKey: 'usuario.nome',
      header: 'Nome',
    // Removed Especialização and Email columns per request
    },
    {
      accessorKey: 'carga_horaria_semanal',
      header: 'Carga Horária',
      cell: ({ row }) => `${row.original.carga_horaria_semanal}h`,
    },
    {
      accessorKey: 'usuario.email',
      header: 'Email',
    },
    {
      accessorKey: 'usuario.ativo',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.usuario.ativo ? 'default' : 'secondary'}>
          {row.original.usuario.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditing(row.original)
              setIsEditOpen(true)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingCarga({ id: row.original.id, carga: row.original.carga_horaria_semanal })
              setIsCargaOpen(true)
            }}
            aria-label="Editar carga horária"
          >
            <Timer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openDisponibilidade(row.original)}
            aria-label="Disponibilidade"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Professores</h1>
          <p className="text-muted-foreground mt-2">
            {'Gerencie os professores da instituição'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Professor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Professor</DialogTitle>
              <DialogDescription>
                {'Preencha os dados do professor e do usuário'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Dados do Usuário</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo*</Label>
                    <Input
                      id="nome"
                      required
                      value={formData.usuario.nome}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usuario: { ...formData.usuario, nome: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuário*</Label>
                    <Input
                      id="username"
                      required
                      value={formData.usuario.username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usuario: { ...formData.usuario, username: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha*</Label>
                    <Input
                      id="senha"
                      type="password"
                      required
                      value={formData.usuario.senha}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usuario: { ...formData.usuario, senha: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Dados do Professor</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento*</Label>
                    <Input
                      id="departamento"
                      required
                      value={formData.departamento}
                      onChange={(e) =>
                        setFormData({ ...formData, departamento: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carga_horaria">Carga Horária Semanal*</Label>
                    <Input
                      id="carga_horaria"
                      type="number"
                      required
                      value={formData.carga_horaria_semanal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          carga_horaria_semanal: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Disponibilidade Semanal</h4>
                  <p className="text-muted-foreground text-xs">Adicione períodos em que o professor está disponível.</p>
                  {['segunda','terca','quarta','quinta','sexta','sabado'].map((dia) => (
                    <div key={dia} className="grid grid-cols-3 gap-3 items-end">
                      <div className="col-span-1"><Label>{dia[0].toUpperCase()+dia.slice(1)}</Label></div>
                      <div className="space-y-2">
                        <Label>Início</Label>
                        <Input type="time" onChange={(e)=>{
                          const idx = formData.disponibilidades.findIndex(d=>d.dia_semana===dia)
                          const novo = { dia_semana: dia, hora_inicio: e.target.value, hora_fim: formData.disponibilidades[idx]?.hora_fim || '' }
                          setFormData({ ...formData, disponibilidades: [
                            ...formData.disponibilidades.filter(d=>d.dia_semana!==dia),
                            novo,
                          ]})
                        }} />
                      </div>
                      <div className="space-y-2">
                        <Label>Fim</Label>
                        <Input type="time" onChange={(e)=>{
                          const idx = formData.disponibilidades.findIndex(d=>d.dia_semana===dia)
                          const novo = { dia_semana: dia, hora_inicio: formData.disponibilidades[idx]?.hora_inicio || '', hora_fim: e.target.value }
                          setFormData({ ...formData, disponibilidades: [
                            ...formData.disponibilidades.filter(d=>d.dia_semana!==dia),
                            novo,
                          ]})
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Professores</CardTitle>
          <CardDescription>
            {'Visualize e gerencie todos os professores cadastrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable columns={columns} data={professores} />
          )}
        </CardContent>
      </Card>

      {/* Editar Professor */}
      <Dialog open={isEditOpen} onOpenChange={(open)=>{ setIsEditOpen(open); if(!open) setEditing(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Professor</DialogTitle>
            <DialogDescription>Atualize os dados do professor</DialogDescription>
          </DialogHeader>
          {editing && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departamento*</Label>
                  <Input
                    value={editing.departamento}
                    onChange={(e)=> setEditing({ ...editing, departamento: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carga Horária Semanal*</Label>
                  <Input
                    type="number"
                    value={editing.carga_horaria_semanal}
                    onChange={(e)=> setEditing({ ...editing, carga_horaria_semanal: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={editing.observacoes || ''}
                  onChange={(e)=> setEditing({ ...editing, observacoes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={()=> setIsEditOpen(false)} disabled={isSaving}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : 'Salvar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Editar Carga Horária */}
      <Dialog open={isCargaOpen} onOpenChange={(open)=>{ setIsCargaOpen(open); if(!open) setEditingCarga(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Carga Horária</DialogTitle>
            <DialogDescription>Atualize apenas a carga horária semanal</DialogDescription>
          </DialogHeader>
          {editingCarga && (
            <form onSubmit={async (e)=>{
              e.preventDefault()
              setIsSaving(true)
              try {
                await apiClient.put(`/professores/${editingCarga.id}/`, { carga_horaria_semanal: editingCarga.carga })
                toast({ title: 'Sucesso', description: 'Carga horária atualizada' })
                setIsCargaOpen(false)
                setEditingCarga(null)
                loadProfessores()
              } catch (error:any) {
                toast({ title: 'Erro', description: error?.message || 'Erro ao atualizar carga horária', variant: 'destructive' })
              } finally { setIsSaving(false) }
            }} className="space-y-4">
              <div className="space-y-2">
                <Label>Carga Horária Semanal*</Label>
                <Input type="number" value={editingCarga.carga} onChange={(e)=> setEditingCarga({ ...editingCarga, carga: Number(e.target.value) })} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={()=> setIsCargaOpen(false)} disabled={isSaving}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>) : 'Salvar'}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Disponibilidade do Professor */}
      <Dialog open={isDispOpen} onOpenChange={(open)=>{ setIsDispOpen(open); if(!open) { setEditing(null); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Disponibilidade</DialogTitle>
            <DialogDescription>Marque quando o professor está na escola</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              {editDispRows.map((row, idx)=> (
                <div key={row.dia_semana} className="grid grid-cols-3 gap-3 items-end">
                  <div className="col-span-1"><Label>{row.dia_semana[0].toUpperCase()+row.dia_semana.slice(1)}</Label></div>
                  <div className="space-y-2">
                    <Label>Início</Label>
                    <Input type="time" value={row.hora_inicio} onChange={(e)=>{
                      const copy = [...editDispRows]
                      copy[idx] = { ...copy[idx], hora_inicio: e.target.value }
                      setEditDispRows(copy)
                    }} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fim</Label>
                    <Input type="time" value={row.hora_fim} onChange={(e)=>{
                      const copy = [...editDispRows]
                      copy[idx] = { ...copy[idx], hora_fim: e.target.value }
                      setEditDispRows(copy)
                    }} />
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={()=> setIsDispOpen(false)} disabled={isSaving}>Cancelar</Button>
                <Button onClick={saveDisponibilidade} disabled={isSaving}>{isSaving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>) : 'Salvar'}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {'Tem certeza que deseja excluir este professor? Esta ação não pode ser desfeita.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
