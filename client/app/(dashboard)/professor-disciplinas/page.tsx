'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api-client'
import { DataTable } from '@/components/data-table'
import { Plus, Loader2, Trash2 } from 'lucide-react'
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
  usuario: { nome: string }
}

interface Disciplina {
  id: number
  nome: string
  codigo: string
}

interface ProfessorDisciplina {
  id: number
  professor_id: number
  professor?: Professor
  disciplina_id: number
  disciplina?: Disciplina
  carga_horaria: number
}

export default function ProfessorDisciplinasPage() {
  const [vinculos, setVinculos] = useState<ProfessorDisciplina[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    professor_id: '',
    disciplina_id: '',
    carga_horaria: 2,
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [vinculosData, professoresData, disciplinasData] = await Promise.all([
        apiClient.get<ProfessorDisciplina[]>('/professor-disciplinas/?limit=1000'),
        apiClient.get<Professor[]>('/professores/?limit=1000'),
        apiClient.get<Disciplina[]>('/disciplinas/?limit=1000'),
      ])
      setVinculos(vinculosData)
      setProfessores(professoresData)
      setDisciplinas(disciplinasData)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
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
      await apiClient.post('/professor-disciplinas/', {
        ...formData,
        professor_id: Number(formData.professor_id),
        disciplina_id: Number(formData.disciplina_id),
      })
      toast({
        title: 'Sucesso',
        description: 'Vínculo criado com sucesso',
      })
      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar vínculo',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiClient.delete(`/professor-disciplinas/${id}/`)
      toast({
        title: 'Sucesso',
        description: 'Vínculo excluído com sucesso',
      })
      loadData()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir vínculo',
        variant: 'destructive',
      })
    } finally {
      setDeleteId(null)
    }
  }

  function resetForm() {
    setFormData({
      professor_id: '',
      disciplina_id: '',
      carga_horaria: 2,
    })
  }

  const columns: ColumnDef<ProfessorDisciplina>[] = [
    {
      accessorKey: 'professor.usuario.nome',
      header: 'Professor',
      cell: ({ row }) => row.original.professor?.usuario?.nome || '-',
    },
    {
      accessorKey: 'disciplina.codigo',
      header: 'Código',
      cell: ({ row }) => row.original.disciplina?.codigo || '-',
    },
    {
      accessorKey: 'disciplina.nome',
      header: 'Disciplina',
      cell: ({ row }) => row.original.disciplina?.nome || '-',
    },
    {
      accessorKey: 'carga_horaria',
      header: 'Carga Horária',
      cell: ({ row }) => `${row.original.carga_horaria}h`,
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDeleteId(row.original.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vínculos Professor-Disciplina</h1>
          <p className="text-muted-foreground mt-2">
            {'Gerencie os vínculos entre professores e disciplinas'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Vínculo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Criar Vínculo</DialogTitle>
              <DialogDescription>
                {'Vincule um professor a uma disciplina'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="professor">Professor*</Label>
                <Select
                  value={formData.professor_id}
                  onValueChange={(value) => setFormData({ ...formData, professor_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {professores.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id.toString()}>
                        {prof.usuario?.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="disciplina">Disciplina*</Label>
                <Select
                  value={formData.disciplina_id}
                  onValueChange={(value) => setFormData({ ...formData, disciplina_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplinas.map((disc) => (
                      <SelectItem key={disc.id} value={disc.id.toString()}>
                        {disc.codigo} - {disc.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carga_horaria">Carga Horária*</Label>
                <Input
                  id="carga_horaria"
                  type="number"
                  min="1"
                  required
                  value={formData.carga_horaria}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      carga_horaria: Number(e.target.value),
                    })
                  }
                />
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
          <CardTitle>Lista de Vínculos</CardTitle>
          <CardDescription>
            {'Visualize e gerencie todos os vínculos entre professores e disciplinas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable columns={columns} data={vinculos} />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {'Tem certeza que deseja excluir este vínculo? Esta ação não pode ser desfeita.'}
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
