'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { apiClient } from '@/lib/api-client'
import { DataTable } from '@/components/data-table'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import type { ColumnDef } from '@tantml/react-table'
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

interface Turno {
  id: number
  nome: string
}

interface Turma {
  id: number
  nome: string
  ano: string
  turno_id: number
  turno?: Turno
  curso: string
  ativa: boolean
}

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: '',
    ano: '',
    turno_id: '',
    curso: '',
    ativa: true,
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [turmasData, turnosData] = await Promise.all([
        apiClient.get<Turma[]>('/turmas?limit=1000'),
        apiClient.get<Turno[]>('/turnos?limit=1000'),
      ])
      setTurmas(turmasData)
      setTurnos(turnosData)
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
      await apiClient.post('/turmas', {
        ...formData,
        turno_id: Number(formData.turno_id),
      })
      toast({
        title: 'Sucesso',
        description: 'Turma criada com sucesso',
      })
      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar turma',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiClient.delete(`/turmas/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Turma excluída com sucesso',
      })
      loadData()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir turma',
        variant: 'destructive',
      })
    } finally {
      setDeleteId(null)
    }
  }

  function resetForm() {
    setFormData({
      nome: '',
      ano: '',
      turno_id: '',
      curso: '',
      ativa: true,
    })
  }

  const columns: ColumnDef<Turma>[] = [
    {
      accessorKey: 'nome',
      header: 'Nome',
    },
    {
      accessorKey: 'ano',
      header: 'Ano',
    },
    {
      accessorKey: 'curso',
      header: 'Curso',
    },
    {
      accessorKey: 'turno.nome',
      header: 'Turno',
      cell: ({ row }) => row.original.turno?.nome || '-',
    },
    {
      accessorKey: 'ativa',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.ativa ? 'default' : 'secondary'}>
          {row.original.ativa ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
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
          <h1 className="text-3xl font-bold tracking-tight">Turmas</h1>
          <p className="text-muted-foreground mt-2">
            {'Gerencie as turmas da instituição'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Turma</DialogTitle>
              <DialogDescription>
                {'Preencha os dados da nova turma'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome*</Label>
                  <Input
                    id="nome"
                    required
                    placeholder="Ex: 1º Ano A"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ano">Ano*</Label>
                  <Input
                    id="ano"
                    required
                    placeholder="Ex: 1º"
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="curso">Curso*</Label>
                <Input
                  id="curso"
                  required
                  placeholder="Ex: Ensino Médio"
                  value={formData.curso}
                  onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="turno">Turno*</Label>
                <Select
                  value={formData.turno_id}
                  onValueChange={(value) => setFormData({ ...formData, turno_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um turno" />
                  </SelectTrigger>
                  <SelectContent>
                    {turnos.map((turno) => (
                      <SelectItem key={turno.id} value={turno.id.toString()}>
                        {turno.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativa"
                  checked={formData.ativa}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ativa: checked })
                  }
                />
                <Label htmlFor="ativa">Turma ativa</Label>
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
          <CardTitle>Lista de Turmas</CardTitle>
          <CardDescription>
            {'Visualize e gerencie todas as turmas cadastradas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable columns={columns} data={turmas} />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {'Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.'}
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
