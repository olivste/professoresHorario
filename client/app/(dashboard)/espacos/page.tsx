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
import { apiClient } from '@/lib/api-client'
import { DataTable } from '@/components/data-table'
import { Plus, Loader2, Trash2 } from 'lucide-react'
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

interface Espaco {
  id: number
  nome: string
  codigo: string
  capacidade: number
  descricao?: string
  ativo: boolean
  requer_aprovacao: boolean
}

export default function EspacosPage() {
  const [espacos, setEspacos] = useState<Espaco[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    capacidade: 30,
    descricao: '',
    ativo: true,
    requer_aprovacao: false,
  })

  useEffect(() => {
    loadEspacos()
  }, [])

  async function loadEspacos() {
    try {
      const data = await apiClient.get<Espaco[]>('/espacos?limit=1000')
      setEspacos(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar espaços',
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
      await apiClient.post('/espacos', formData)
      toast({
        title: 'Sucesso',
        description: 'Espaço criado com sucesso',
      })
      setIsDialogOpen(false)
      resetForm()
      loadEspacos()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar espaço',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiClient.delete(`/espacos/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Espaço excluído com sucesso',
      })
      loadEspacos()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir espaço',
        variant: 'destructive',
      })
    } finally {
      setDeleteId(null)
    }
  }

  function resetForm() {
    setFormData({
      nome: '',
      codigo: '',
      capacidade: 30,
      descricao: '',
      ativo: true,
      requer_aprovacao: false,
    })
  }

  const columns: ColumnDef<Espaco>[] = [
    {
      accessorKey: 'codigo',
      header: 'Código',
    },
    {
      accessorKey: 'nome',
      header: 'Nome',
    },
    {
      accessorKey: 'capacidade',
      header: 'Capacidade',
      cell: ({ row }) => `${row.original.capacidade} pessoas`,
    },
    {
      accessorKey: 'descricao',
      header: 'Descrição',
      cell: ({ row }) => row.original.descricao || '-',
    },
    {
      accessorKey: 'requer_aprovacao',
      header: 'Aprovação',
      cell: ({ row }) => (
        <Badge variant={row.original.requer_aprovacao ? 'default' : 'secondary'}>
          {row.original.requer_aprovacao ? 'Necessária' : 'Não requer'}
        </Badge>
      ),
    },
    {
      accessorKey: 'ativo',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.ativo ? 'default' : 'secondary'}>
          {row.original.ativo ? 'Ativo' : 'Inativo'}
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
          <h1 className="text-3xl font-bold tracking-tight">Espaços</h1>
          <p className="text-muted-foreground mt-2">
            {'Gerencie os espaços disponíveis na instituição'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Espaço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Espaço</DialogTitle>
              <DialogDescription>
                {'Preencha os dados do novo espaço'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código*</Label>
                  <Input
                    id="codigo"
                    required
                    placeholder="Ex: AUD-01"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome*</Label>
                  <Input
                    id="nome"
                    required
                    placeholder="Ex: Auditório Principal"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidade">Capacidade*</Label>
                <Input
                  id="capacidade"
                  type="number"
                  min="1"
                  required
                  value={formData.capacidade}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacidade: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o espaço..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requer_aprovacao"
                    checked={formData.requer_aprovacao}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, requer_aprovacao: checked })
                    }
                  />
                  <Label htmlFor="requer_aprovacao">Requer aprovação para reserva</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, ativo: checked })
                    }
                  />
                  <Label htmlFor="ativo">Espaço ativo</Label>
                </div>
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
          <CardTitle>Lista de Espaços</CardTitle>
          <CardDescription>
            {'Visualize e gerencie todos os espaços cadastrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable columns={columns} data={espacos} />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {'Tem certeza que deseja excluir este espaço? Esta ação não pode ser desfeita.'}
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
