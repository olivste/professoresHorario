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
import { Switch } from '@/components/ui/switch'
import { apiClient } from '@/lib/api-client'
import { DataTable } from '@/components/data-table'
import { Plus, Loader2, Trash2, Wand2 } from 'lucide-react'
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

interface Turno {
  id: number
  nome: string
}

interface PeriodoAula {
  id: number
  turno_id: number
  turno?: Turno
  numero_aula: number
  hora_inicio: string
  hora_fim: string
  tipo: 'AULA' | 'INTERVALO' | 'ALMOCO'
  descricao?: string
  ativo: boolean
}

export default function PeriodosAulaPage() {
  const [periodos, setPeriodos] = useState<PeriodoAula[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAutoGenOpen, setIsAutoGenOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    turno_id: '',
    numero_aula: 1,
    hora_inicio: '',
    hora_fim: '',
    tipo: 'AULA' as 'AULA' | 'INTERVALO' | 'ALMOCO',
    descricao: '',
    ativo: true,
  })

  const [autoGenData, setAutoGenData] = useState({
    turno_id: '',
    quantidade_aulas: 5,
    duracao_aula_minutos: 50,
    intervalo_minutos: 20,
    horario_intervalo: 2,
    descricao_intervalo: 'Intervalo',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [periodosData, turnosData] = await Promise.all([
        apiClient.get<PeriodoAula[]>('/periodos-aula?limit=1000'),
        apiClient.get<Turno[]>('/turnos?limit=1000'),
      ])
      setPeriodos(periodosData)
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
      await apiClient.post('/periodos-aula', {
        ...formData,
        turno_id: Number(formData.turno_id),
      })
      toast({
        title: 'Sucesso',
        description: 'Período criado com sucesso',
      })
      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar período',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAutoGen(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      const params = new URLSearchParams({
        turno_id: autoGenData.turno_id,
        quantidade_aulas: autoGenData.quantidade_aulas.toString(),
        duracao_aula_minutos: autoGenData.duracao_aula_minutos.toString(),
        intervalo_minutos: autoGenData.intervalo_minutos.toString(),
        horario_intervalo: autoGenData.horario_intervalo.toString(),
        descricao_intervalo: autoGenData.descricao_intervalo,
      })
      
      await apiClient.post(`/periodos-aula/auto-gerar?${params}`, {})
      toast({
        title: 'Sucesso',
        description: 'Períodos gerados automaticamente',
      })
      setIsAutoGenOpen(false)
      resetAutoGenForm()
      loadData()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar períodos automaticamente',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiClient.delete(`/periodos-aula/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Período excluído com sucesso',
      })
      loadData()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir período',
        variant: 'destructive',
      })
    } finally {
      setDeleteId(null)
    }
  }

  function resetForm() {
    setFormData({
      turno_id: '',
      numero_aula: 1,
      hora_inicio: '',
      hora_fim: '',
      tipo: 'AULA',
      descricao: '',
      ativo: true,
    })
  }

  function resetAutoGenForm() {
    setAutoGenData({
      turno_id: '',
      quantidade_aulas: 5,
      duracao_aula_minutos: 50,
      intervalo_minutos: 20,
      horario_intervalo: 2,
      descricao_intervalo: 'Intervalo',
    })
  }

  const columns: ColumnDef<PeriodoAula>[] = [
    {
      accessorKey: 'turno.nome',
      header: 'Turno',
      cell: ({ row }) => row.original.turno?.nome || '-',
    },
    {
      accessorKey: 'numero_aula',
      header: 'Nº Aula',
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
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.tipo === 'AULA'
              ? 'default'
              : row.original.tipo === 'INTERVALO'
              ? 'secondary'
              : 'outline'
          }
        >
          {row.original.tipo}
        </Badge>
      ),
    },
    {
      accessorKey: 'descricao',
      header: 'Descrição',
      cell: ({ row }) => row.original.descricao || '-',
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
          <h1 className="text-3xl font-bold tracking-tight">Períodos de Aula</h1>
          <p className="text-muted-foreground mt-2">
            {'Gerencie os períodos de aula de cada turno'}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAutoGenOpen} onOpenChange={setIsAutoGenOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Wand2 className="h-4 w-4 mr-2" />
                Gerar Automático
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Gerar Períodos Automaticamente</DialogTitle>
                <DialogDescription>
                  {'Configure e gere os períodos automaticamente para um turno'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAutoGen} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auto_turno">Turno*</Label>
                  <Select
                    value={autoGenData.turno_id}
                    onValueChange={(value) =>
                      setAutoGenData({ ...autoGenData, turno_id: value })
                    }
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade de Aulas*</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      required
                      value={autoGenData.quantidade_aulas}
                      onChange={(e) =>
                        setAutoGenData({
                          ...autoGenData,
                          quantidade_aulas: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duracao">Duração (min)*</Label>
                    <Input
                      id="duracao"
                      type="number"
                      min="1"
                      required
                      value={autoGenData.duracao_aula_minutos}
                      onChange={(e) =>
                        setAutoGenData({
                          ...autoGenData,
                          duracao_aula_minutos: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="intervalo_min">Intervalo (min)*</Label>
                    <Input
                      id="intervalo_min"
                      type="number"
                      min="0"
                      required
                      value={autoGenData.intervalo_minutos}
                      onChange={(e) =>
                        setAutoGenData({
                          ...autoGenData,
                          intervalo_minutos: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horario_intervalo">Após Aula Nº*</Label>
                    <Input
                      id="horario_intervalo"
                      type="number"
                      min="1"
                      required
                      value={autoGenData.horario_intervalo}
                      onChange={(e) =>
                        setAutoGenData({
                          ...autoGenData,
                          horario_intervalo: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc_intervalo">Descrição do Intervalo</Label>
                  <Input
                    id="desc_intervalo"
                    value={autoGenData.descricao_intervalo}
                    onChange={(e) =>
                      setAutoGenData({
                        ...autoGenData,
                        descricao_intervalo: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAutoGenOpen(false)}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      'Gerar'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Período
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Período</DialogTitle>
                <DialogDescription>
                  {'Preencha os dados do novo período de aula'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero_aula">Número da Aula*</Label>
                    <Input
                      id="numero_aula"
                      type="number"
                      min="1"
                      required
                      value={formData.numero_aula}
                      onChange={(e) =>
                        setFormData({ ...formData, numero_aula: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo*</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AULA">Aula</SelectItem>
                        <SelectItem value="INTERVALO">Intervalo</SelectItem>
                        <SelectItem value="ALMOCO">Almoço</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Ex: 1ª Aula"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, ativo: checked })
                    }
                  />
                  <Label htmlFor="ativo">Período ativo</Label>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Períodos de Aula</CardTitle>
          <CardDescription>
            {'Visualize e gerencie todos os períodos cadastrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable columns={columns} data={periodos} />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {'Tem certeza que deseja excluir este período? Esta ação não pode ser desfeita.'}
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
