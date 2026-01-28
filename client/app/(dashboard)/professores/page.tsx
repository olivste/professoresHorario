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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
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
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
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
          <Button variant="ghost" size="icon" disabled>
            <Pencil className="h-4 w-4" />
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
