'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { apiClient } from '@/lib/api-client'
import { DataTable } from '@/components/data-table'
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react'
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

interface Disciplina {
  id: number
  nome: string
  codigo: string
  carga_horaria_semanal: number
  descricao?: string
  ativa: boolean
}

interface Turma {
  id: number
  nome: string
  ano: string
  turno_id: number
  curso?: string
  ativa: boolean
}

interface TurmaDisciplina {
  id: number
  turma_id: number
  disciplina_id: number
}

export default function DisciplinasPage() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [disciplinasTurmas, setDisciplinasTurmas] = useState<Map<number, number[]>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const { toast } = useToast()

  const [turmaFiltro, setTurmaFiltro] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    carga_horaria_semanal: 4,
    descricao: '',
    ativa: true,
    turma_ids: [] as number[],
  })

  useEffect(() => {
    loadDisciplinas()
    loadTurmas()
    loadDisciplinasTurmas()
  }, [])

  async function loadDisciplinas() {
    try {
      const data = await apiClient.get<Disciplina[]>('/disciplinas/?limit=1000')
      setDisciplinas(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar disciplinas',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function loadTurmas() {
    try {
      const data = await apiClient.get<Turma[]>('/turmas/?limit=1000&ativas_apenas=true')
      setTurmas(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar turmas',
        variant: 'destructive',
      })
    }
  }

  async function loadDisciplinasTurmas() {
    try {
      const disciplinasData = await apiClient.get<Disciplina[]>('/disciplinas/?limit=1000')
      const mapa = new Map<number, number[]>()
      
      for (const disciplina of disciplinasData) {
        const turmasDisciplina = await apiClient.get<TurmaDisciplina[]>(`/disciplinas/${disciplina.id}/turmas/`)
        const turmaIds = turmasDisciplina.map(td => td.turma_id)
        mapa.set(disciplina.id, turmaIds)
      }
      
      setDisciplinasTurmas(mapa)
    } catch (error) {
      console.error('Erro ao carregar associações de disciplinas e turmas:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (editingId) {
        await apiClient.put(`/disciplinas/${editingId}/`, formData)
        toast({
          title: 'Sucesso',
          description: 'Disciplina atualizada com sucesso',
        })
      } else {
        await apiClient.post('/disciplinas/', formData)
        toast({
          title: 'Sucesso',
          description: 'Disciplina criada com sucesso',
        })
      }
      setIsDialogOpen(false)
      resetForm()
      loadDisciplinas()
      loadDisciplinasTurmas()
    } catch (error) {
      toast({
        title: 'Erro',
        description: editingId ? 'Erro ao atualizar disciplina' : 'Erro ao criar disciplina',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleEdit(disciplina: Disciplina) {
    setEditingId(disciplina.id)
    const turmasAssociadas = disciplinasTurmas.get(disciplina.id) || []
    setFormData({
      nome: disciplina.nome,
      codigo: disciplina.codigo || '',
      carga_horaria_semanal: disciplina.carga_horaria_semanal,
      descricao: disciplina.descricao || '',
      ativa: disciplina.ativa,
      turma_ids: turmasAssociadas,
    })
    setIsDialogOpen(true)
  }

  async function handleDelete(id: number) {
    try {
      await apiClient.delete(`/disciplinas/${id}/`)
      toast({
        title: 'Sucesso',
        description: 'Disciplina excluída com sucesso',
      })
      loadDisciplinas()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir disciplina',
        variant: 'destructive',
      })
    } finally {
      setDeleteId(null)
    }
  }

  function resetForm() {
    setEditingId(null)
    setFormData({
      nome: '',
      codigo: '',
      carga_horaria_semanal: 4,
      descricao: '',
      ativa: true,
      turma_ids: [],
    })
  }

  const columns: ColumnDef<Disciplina>[] = [
    {
      accessorKey: 'nome',
      header: 'Nome',
      meta: { className: 'w-[70%] truncate' },
    },
    {
      accessorKey: 'carga_horaria_semanal',
      header: 'Carga Horária',
      meta: { className: 'w-[20%] whitespace-nowrap' },
      cell: ({ row }) => `${row.original.carga_horaria_semanal}h/sem`,
    },
    {
      id: 'actions',
      header: 'Ações',
      meta: { className: 'w-[10%] whitespace-nowrap' },
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleEdit(row.original)}
          >
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

  // Aplica filtro por turma selecionada
  const disciplinasFiltradas = React.useMemo(() => {
    if (turmaFiltro === null) return disciplinas
    return disciplinas.filter(d => disciplinasTurmas.get(d.id)?.includes(turmaFiltro) ?? false)
  }, [disciplinas, turmaFiltro, disciplinasTurmas])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disciplinas</h1>
          <p className="text-muted-foreground mt-2">
            {'Gerencie as disciplinas oferecidas pela instituição'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Disciplina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Disciplina' : 'Cadastrar Disciplina'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Atualize os dados da disciplina' : 'Preencha os dados da nova disciplina'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código*</Label>
                  <Input
                    id="codigo"
                    required
                    placeholder="Ex: MAT001"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome*</Label>
                  <Input
                    id="nome"
                    required
                    placeholder="Ex: Matemática"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carga_horaria">Carga Horária Semanal*</Label>
                <Input
                  id="carga_horaria"
                  type="number"
                  min="1"
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

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva a disciplina..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativa"
                  checked={formData.ativa}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ativa: checked })
                  }
                />
                <Label htmlFor="ativa">Disciplina ativa</Label>
              </div>

              <div className="space-y-2">
                <Label>Atribuir a Turmas *</Label>
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2 bg-muted/50">
                  {turmas.length > 0 ? (
                    turmas.map(turma => (
                      <div key={turma.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`turma-${turma.id}`}
                          checked={formData.turma_ids.includes(turma.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                turma_ids: [...formData.turma_ids, turma.id]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                turma_ids: formData.turma_ids.filter(id => id !== turma.id)
                              })
                            }
                          }}
                        />
                        <Label htmlFor={`turma-${turma.id}`} className="cursor-pointer text-sm font-normal">
                          {turma.nome} ({turma.ano} ano)
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhuma turma disponível</p>
                  )}
                </div>
                {formData.turma_ids.length === 0 && (
                  <p className="text-xs text-amber-600">Selecione pelo menos uma turma</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
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
                      {editingId ? 'Atualizando...' : 'Salvando...'}
                    </>
                  ) : (
                    editingId ? 'Atualizar' : 'Salvar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Disciplinas</CardTitle>
          <CardDescription>
            {'Visualize e gerencie todas as disciplinas cadastradas'}
          </CardDescription>
          {/* Filtro por turma */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Button
              variant={turmaFiltro === null ? 'default' : 'outline'}
              onClick={() => setTurmaFiltro(null)}
            >
              Todas as turmas
            </Button>
            {turmas.map(turma => (
              <Button
                key={turma.id}
                variant={turmaFiltro === turma.id ? 'default' : 'outline'}
                onClick={() => setTurmaFiltro(turma.id)}
              >
                {turma.nome} ({turma.ano})
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable columns={columns} data={disciplinasFiltradas} />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {'Tem certeza que deseja excluir esta disciplina? Esta ação não pode ser desfeita.'}
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
