'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'
import { DataTable } from '@/components/data-table'
import { Plus, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth-context'
import type { ColumnDef } from '@tanstack/react-table'

interface Espaco {
  id: number
  nome: string
  codigo: string
}

interface Usuario {
  id: number
  nome: string
}

interface Reserva {
  id: number
  espaco_id: number
  espaco?: Espaco
  solicitante_id: number
  solicitante?: Usuario
  aprovador_id?: number
  aprovador?: Usuario
  data_reserva: string
  hora_inicio: string
  hora_fim: string
  finalidade: string
  observacoes?: string
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada'
}

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [espacos, setEspacos] = useState<Espaco[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    espaco_id: '',
    data_reserva: '',
    hora_inicio: '',
    hora_fim: '',
    finalidade: '',
    observacoes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [reservasData, espacosData, usuariosData] = await Promise.all([
        apiClient.get<Reserva[]>('/reservas/?limit=1000'),
        apiClient.get<Espaco[]>('/espacos/?limit=1000'),
        apiClient.get<Usuario[]>('/usuarios/?limit=1000'),
      ])
      setReservas(reservasData)
      setEspacos(espacosData)
      setUsuarios(usuariosData)
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
      await apiClient.post(`/reservas/?solicitante_id=${user?.id}`, {
        ...formData,
        espaco_id: Number(formData.espaco_id),
      })
      toast({
        title: 'Sucesso',
        description: 'Reserva criada com sucesso',
      })
      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar reserva',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateStatus(id: number, status: string) {
    try {
      await apiClient.put(`/reservas/${id}/status/?status=${status}&aprovador_id=${user?.id}`)
      toast({
        title: 'Sucesso',
        description: `Reserva ${status} com sucesso`,
      })
      loadData()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status da reserva',
        variant: 'destructive',
      })
    }
  }

  function resetForm() {
    setFormData({
      espaco_id: '',
      data_reserva: '',
      hora_inicio: '',
      hora_fim: '',
      finalidade: '',
      observacoes: '',
    })
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case 'aprovada':
        return 'default'
      case 'pendente':
        return 'secondary'
      case 'rejeitada':
      case 'cancelada':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const columns: ColumnDef<Reserva>[] = [
    {
      accessorKey: 'espaco.nome',
      header: 'Espaço',
      cell: ({ row }) => row.original.espaco?.nome || '-',
    },
    {
      accessorKey: 'data_reserva',
      header: 'Data',
      cell: ({ row }) => new Date(row.original.data_reserva).toLocaleDateString('pt-BR'),
    },
    {
      accessorKey: 'hora_inicio',
      header: 'Início',
    },
    {
      accessorKey: 'hora_fim',
      header: 'Fim',
    },
    {
      accessorKey: 'solicitante.nome',
      header: 'Solicitante',
      cell: ({ row }) => row.original.solicitante?.nome || '-',
    },
    {
      accessorKey: 'finalidade',
      header: 'Finalidade',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original.status)}>
          {row.original.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        if (row.original.status !== 'pendente') return null
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleUpdateStatus(row.original.id, 'aprovada')}
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleUpdateStatus(row.original.id, 'rejeitada')}
            >
              <XCircle className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground mt-2">
            {'Gerencie as reservas de espaços'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Criar Reserva</DialogTitle>
              <DialogDescription>
                {'Preencha os dados da nova reserva'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="espaco">Espaço*</Label>
                <Select
                  value={formData.espaco_id}
                  onValueChange={(value) => setFormData({ ...formData, espaco_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um espaço" />
                  </SelectTrigger>
                  <SelectContent>
                    {espacos.map((espaco) => (
                      <SelectItem key={espaco.id} value={espaco.id.toString()}>
                        {espaco.codigo} - {espaco.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_reserva">Data da Reserva*</Label>
                <Input
                  id="data_reserva"
                  type="date"
                  required
                  value={formData.data_reserva}
                  onChange={(e) => setFormData({ ...formData, data_reserva: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hora_inicio">Hora Início*</Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    required
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_fim">Hora Fim*</Label>
                  <Input
                    id="hora_fim"
                    type="time"
                    required
                    value={formData.hora_fim}
                    onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalidade">Finalidade*</Label>
                <Input
                  id="finalidade"
                  required
                  placeholder="Ex: Reunião pedagógica"
                  value={formData.finalidade}
                  onChange={(e) => setFormData({ ...formData, finalidade: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações adicionais..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
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
          <CardTitle>Lista de Reservas</CardTitle>
          <CardDescription>
            {'Visualize e gerencie todas as reservas de espaços'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable columns={columns} data={reservas} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
