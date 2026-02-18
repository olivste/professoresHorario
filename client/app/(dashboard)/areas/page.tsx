'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { apiClient } from '@/lib/api-client'
import { DataTable } from '@/components/data-table'
import { Plus, Loader2, Pencil, Trash2, Clock, Calendar } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AreaPlanejamento {
  id: number
  area_id: number
  dia_semana: string
  hora_inicio: string
  hora_fim: string
  descricao?: string
  created_at: string
  updated_at?: string
}

interface Area {
  id: number
  nome: string
  descricao?: string
  cor?: string
  ativa: boolean
  planejamentos: AreaPlanejamento[]
  created_at: string
  updated_at?: string
}

const DIAS_SEMANA = [
  { valor: 'segunda', label: 'Segunda-feira' },
  { valor: 'terca', label: 'Terça-feira' },
  { valor: 'quarta', label: 'Quarta-feira' },
  { valor: 'quinta', label: 'Quinta-feira' },
  { valor: 'sexta', label: 'Sexta-feira' },
  { valor: 'sabado', label: 'Sábado' },
]

const CORES_PADRAO = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#ec4899', // pink
]

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPlanejamentoDialogOpen, setIsPlanejamentoDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editingArea, setEditingArea] = useState<Area | null>(null)
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [editingPlanejamento, setEditingPlanejamento] = useState<AreaPlanejamento | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: CORES_PADRAO[0],
    ativa: true,
  })

  const [planejamentoFormData, setPlanejamentoFormData] = useState({
    dia_semana: 'segunda', // Não pode ser string vazia
    hora_inicio: '',
    hora_fim: '',
    descricao: '',
  })

  useEffect(() => {
    loadAreas()
  }, [])

  async function loadAreas() {
    try {
      setIsLoading(true)
      const data = await apiClient.get<Area[]>('/areas/?limit=1000')
      setAreas(data)
    } catch (error: any) {
      console.error('Erro ao carregar áreas:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível carregar as áreas',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpenDialog(area?: Area) {
    if (area) {
      setEditingArea(area)
      setFormData({
        nome: area.nome,
        descricao: area.descricao || '',
        cor: area.cor || CORES_PADRAO[0],
        ativa: area.ativa,
      })
    } else {
      setEditingArea(null)
      setFormData({
        nome: '',
        descricao: '',
        cor: CORES_PADRAO[0],
        ativa: true,
      })
    }
    setIsDialogOpen(true)
  }

  function handleOpenPlanejamentoDialog(area: Area, planejamento?: AreaPlanejamento) {
    setSelectedArea(area)
    
    if (planejamento) {
      // Editando planejamento existente
      setEditingPlanejamento(planejamento)
      setPlanejamentoFormData({
        dia_semana: planejamento.dia_semana,
        hora_inicio: planejamento.hora_inicio.substring(0, 5), // Remove segundos
        hora_fim: planejamento.hora_fim.substring(0, 5),
        descricao: planejamento.descricao || '',
      })
    } else {
      // Novo planejamento
      setEditingPlanejamento(null)
      setPlanejamentoFormData({
        dia_semana: 'segunda',
        hora_inicio: '',
        hora_fim: '',
        descricao: '',
      })
    }
    setIsPlanejamentoDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (editingArea) {
        await apiClient.put(`/areas/${editingArea.id}`, formData)
        toast({
          title: 'Sucesso',
          description: 'Área atualizada com sucesso',
        })
      } else {
        await apiClient.post('/areas/', formData)
        toast({
          title: 'Sucesso',
          description: 'Área criada com sucesso',
        })
      }
      setIsDialogOpen(false)
      loadAreas()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a área',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSubmitPlanejamento(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedArea) return

    setIsSaving(true)
    try {
      if (editingPlanejamento) {
        // Atualizando planejamento existente
        await apiClient.put(`/areas/${selectedArea.id}/planejamentos/${editingPlanejamento.id}`, planejamentoFormData)
        toast({
          title: 'Sucesso',
          description: 'Planejamento atualizado com sucesso',
        })
      } else {
        // Criando novo planejamento
        await apiClient.post(`/areas/${selectedArea.id}/planejamentos`, planejamentoFormData)
        toast({
          title: 'Sucesso',
          description: 'Planejamento adicionado com sucesso',
        })
      }
      setIsPlanejamentoDialogOpen(false)
      setEditingPlanejamento(null)
      loadAreas()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || `Não foi possível ${editingPlanejamento ? 'atualizar' : 'adicionar'} o planejamento`,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiClient.delete(`/areas/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Área excluída com sucesso',
      })
      setDeleteId(null)
      loadAreas()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir a área',
        variant: 'destructive',
      })
    }
  }

  async function handleDeletePlanejamento(areaId: number, planejamentoId: number) {
    try {
      await apiClient.delete(`/areas/${areaId}/planejamentos/${planejamentoId}`)
      toast({
        title: 'Sucesso',
        description: 'Planejamento removido com sucesso',
      })
      loadAreas()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível remover o planejamento',
        variant: 'destructive',
      })
    }
  }

  const columns: ColumnDef<Area>[] = [
    {
      accessorKey: 'cor',
      header: 'Cor',
      cell: ({ row }) => (
        <div 
          className="w-8 h-8 rounded-full border-2 border-gray-300" 
          style={{ backgroundColor: row.original.cor || '#666' }}
        />
      ),
    },
    {
      accessorKey: 'nome',
      header: 'Nome',
    },
    {
      accessorKey: 'descricao',
      header: 'Descrição',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.descricao || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'planejamentos',
      header: 'Planejamentos',
      cell: ({ row }) => {
        const planejamentos = row.original.planejamentos || []
        return (
          <div className="flex flex-wrap gap-1">
            {planejamentos.length > 0 ? (
              planejamentos.map((p) => (
                <Badge key={p.id} variant="outline" className="text-xs">
                  {p.dia_semana}: {p.hora_inicio} - {p.hora_fim}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">Nenhum</span>
            )}
          </div>
        )
      },
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
      id: 'acoes',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenPlanejamentoDialog(row.original)}
            title="Adicionar planejamento"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenDialog(row.original)}
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Áreas de Conhecimento</CardTitle>
              <CardDescription>
                Gerencie as áreas de conhecimento e seus horários de planejamento
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Área
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingArea ? 'Editar Área' : 'Nova Área'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingArea
                      ? 'Atualize as informações da área'
                      : 'Cadastre uma nova área de conhecimento'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Área*</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Matemática, Linguagens, Ciências"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descrição opcional da área"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cor">Cor de Identificação</Label>
                    <div className="flex gap-2 flex-wrap">
                      {CORES_PADRAO.map((cor) => (
                        <button
                          key={cor}
                          type="button"
                          className={`w-10 h-10 rounded-full border-2 ${
                            formData.cor === cor ? 'border-black ring-2 ring-offset-2 ring-black' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: cor }}
                          onClick={() => setFormData({ ...formData, cor })}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ativa"
                      checked={formData.ativa}
                      onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
                    />
                    <Label htmlFor="ativa">Área ativa</Label>
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
                      {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingArea ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <DataTable columns={columns} data={areas} />
          )}
        </CardContent>
      </Card>

      {/* Dialog para adicionar/editar planejamento */}
      <Dialog open={isPlanejamentoDialogOpen} onOpenChange={setIsPlanejamentoDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlanejamento ? 'Editar' : 'Gerenciar'} Horários de Planejamento
            </DialogTitle>
            <DialogDescription>
              Área: {selectedArea?.nome}
            </DialogDescription>
          </DialogHeader>

          {/* Lista de planejamentos existentes */}
          {!editingPlanejamento && selectedArea && selectedArea.planejamentos.length > 0 && (
            <div className="space-y-2 border-b pb-4 mb-4">
              <h4 className="text-sm font-medium">Horários configurados:</h4>
              <div className="space-y-2">
                {selectedArea.planejamentos.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {DIAS_SEMANA.find(d => d.valor === p.dia_semana)?.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.hora_inicio.substring(0, 5)} - {p.hora_fim.substring(0, 5)}
                        {p.descricao && ` • ${p.descricao}`}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenPlanejamentoDialog(selectedArea, p)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeletePlanejamento(selectedArea.id, p.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitPlanejamento} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dia_semana">Dia da Semana*</Label>
              <Select
                value={planejamentoFormData.dia_semana}
                onValueChange={(value) =>
                  setPlanejamentoFormData({ ...planejamentoFormData, dia_semana: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {DIAS_SEMANA.map((dia) => (
                    <SelectItem key={dia.valor} value={dia.valor}>
                      {dia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora Início*</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={planejamentoFormData.hora_inicio}
                  onChange={(e) =>
                    setPlanejamentoFormData({ ...planejamentoFormData, hora_inicio: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_fim">Hora Fim*</Label>
                <Input
                  id="hora_fim"
                  type="time"
                  value={planejamentoFormData.hora_fim}
                  onChange={(e) =>
                    setPlanejamentoFormData({ ...planejamentoFormData, hora_fim: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planejamento_descricao">Descrição</Label>
              <Textarea
                id="planejamento_descricao"
                value={planejamentoFormData.descricao}
                onChange={(e) =>
                  setPlanejamentoFormData({ ...planejamentoFormData, descricao: e.target.value })
                }
                placeholder="Observações sobre este horário de planejamento"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPlanejamentoDialogOpen(false)
                  setEditingPlanejamento(null)
                }}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingPlanejamento ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta área? Esta ação não pode ser desfeita.
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
