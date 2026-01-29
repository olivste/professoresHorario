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

interface Professor {
  id: number
  usuario: { nome: string }
}

interface Disciplina {
  id: number
  nome: string
  codigo: string
}

interface Turma {
  id: number
  nome: string
  turno_id: number
}

interface Turno {
  id: number
  nome: string
}

interface PeriodoAula {
  id: number
  turno_id: number
  numero_aula: number
  hora_inicio: string
  hora_fim: string
  tipo: 'AULA' | 'INTERVALO' | 'ALMOCO'
  descricao?: string
}

interface Horario {
  id: number
  professor_id: number
  professor?: Professor
  disciplina_id: number
  disciplina?: Disciplina
  turma_id: number
  turma?: Turma
  turno_id: number
  turno?: Turno
  dia_semana: string
  hora_inicio: string
  hora_fim: string
  sala: string
  observacoes?: string
}

const diasSemana = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
]

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [periodos, setPeriodos] = useState<PeriodoAula[]>([])
  const [profDiscLinks, setProfDiscLinks] = useState<Array<{ professor_id: number; disciplina_id: number }>>([])
  const [turmaDiscLinks, setTurmaDiscLinks] = useState<Array<{ turma_id: number; disciplina_id: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [selectedPeriodoId, setSelectedPeriodoId] = useState<string>('')
  // Sempre usar período para definir hora início/fim
  const [usarPeriodo] = useState<boolean>(true)
  const { toast } = useToast()

  // Filtros da grade
  const [filterDia, setFilterDia] = useState<string>('')
  const [filterTurnoId, setFilterTurnoId] = useState<string>('')
  const [filterTurmaId, setFilterTurmaId] = useState<string>('')
  const [filterProfessorId, setFilterProfessorId] = useState<string>('')

  const [formData, setFormData] = useState({
    professor_id: '',
    disciplina_id: '',
    turma_id: '',
    turno_id: '',
    dia_semana: '',
    hora_inicio: '',
    hora_fim: '',
    observacoes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [horariosData, professoresData, disciplinasData, turmasData, turnosData, periodosData, linksData, turmaLinksData] = await Promise.all([
        apiClient.get<Horario[]>('/horarios/?limit=1000'),
        apiClient.get<Professor[]>('/professores/?limit=1000'),
        apiClient.get<Disciplina[]>('/disciplinas/?limit=1000'),
        apiClient.get<Turma[]>('/turmas/?limit=1000'),
        apiClient.get<Turno[]>('/turnos/?limit=1000'),
        apiClient.get<PeriodoAula[]>('/periodos-aula/?limit=1000'),
        apiClient.get<any[]>('/professor-disciplinas/'),
        apiClient.get<any[]>('/turma-disciplinas/'),
      ])
      setHorarios(horariosData)
      setProfessores(professoresData)
      setDisciplinas(disciplinasData)
      setTurmas(turmasData)
      setTurnos(turnosData)
      setPeriodos(periodosData)
      setProfDiscLinks(
        linksData.map((l: any) => ({ professor_id: l.professor_id, disciplina_id: l.disciplina_id }))
      )
      setTurmaDiscLinks(
        turmaLinksData.map((l: any) => ({ turma_id: l.turma_id, disciplina_id: l.disciplina_id }))
      )
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

  // Atualiza hora início/fim ao selecionar um período
  useEffect(() => {
    const id = Number(selectedPeriodoId)
    const periodo = periodos.find((p) => p.id === id)
    if (periodo) {
      setFormData((prev) => ({
        ...prev,
        hora_inicio: periodo.hora_inicio,
        hora_fim: periodo.hora_fim,
      }))
    }
  }, [selectedPeriodoId, periodos])

  // Ao trocar o turno, limpa seleção de período e turma
  useEffect(() => {
    setSelectedPeriodoId('')
    setFormData((prev) => ({ ...prev, turma_id: '' }))
  }, [formData.turno_id])

  // Ao trocar a turma, limpar disciplina
  useEffect(() => {
    setFormData((prev) => ({ ...prev, disciplina_id: '' }))
  }, [formData.turma_id])

  // Ao trocar a disciplina, auto-seleciona professor quando houver único vínculo
  useEffect(() => {
    const discId = Number(formData.disciplina_id)
    if (!discId) return
    const profsDaDisc = profDiscLinks
      .filter((l) => l.disciplina_id === discId)
      .map((l) => l.professor_id)
    const unique = Array.from(new Set(profsDaDisc))
    // Se professor atual não está entre os elegíveis, limpar
    if (formData.professor_id && !unique.includes(Number(formData.professor_id))) {
      setFormData((prev) => ({ ...prev, professor_id: '' }))
    }
    // Auto-seleciona quando existe apenas um possível
    if (!formData.professor_id && unique.length === 1) {
      setFormData((prev) => ({ ...prev, professor_id: unique[0].toString() }))
    }
  }, [formData.disciplina_id, profDiscLinks])

  const periodosFiltrados = periodos.filter(
    (p) => p.turno_id === Number(formData.turno_id) && p.tipo === 'AULA'
  )

  const professoresFiltrados = (() => {
    const discId = Number(formData.disciplina_id)
    if (!discId || profDiscLinks.length === 0) return professores
    const allowedProfIds = new Set(
      profDiscLinks.filter((l) => l.disciplina_id === discId).map((l) => l.professor_id)
    )
    const result = professorsSafeFilter(professores, allowedProfIds)
    return result.length > 0 ? result : professores
  })()

  function professorsSafeFilter(list: Professor[], allowed: Set<number>) {
    return list.filter((p) => allowed.has(p.id))
  }

  const turmasFiltradas = (() => {
    const turnoId = Number(formData.turno_id)
    if (!turnoId) return []
    const profId = Number(formData.professor_id)
    const discId = Number(formData.disciplina_id)

    // Mapa turma -> conjunto de disciplinas
    const turmaParaDiscs = new Map<number, Set<number>>()
    for (const l of turmaDiscLinks) {
      const set = turmaParaDiscs.get(l.turma_id) || new Set<number>()
      set.add(l.disciplina_id)
      turmaParaDiscs.set(l.turma_id, set)
    }

    // Conjunto de disciplinas válidas pelo professor (se houver)
    const discsPorProf = profId
      ? new Set(
          profDiscLinks
            .filter((l) => l.professor_id === profId)
            .map((l) => l.disciplina_id)
        )
      : null

    // Se disciplina já escolhida, priorizar essa restrição
    const exigeDiscEspecifica = !!discId

    return turmas.filter((t) => {
      if (t.turno_id !== turnoId) return false
      const discs = turmaParaDiscs.get(t.id)
      if (!discs || discs.size === 0) return false

      if (exigeDiscEspecifica) {
        if (!discs.has(discId)) return false
        // Se também há professor escolhido, garantir que o professor lecione essa disciplina
        if (discsPorProf && !discsPorProf.has(discId)) return false
        return true
      }

      // Sem disciplina específica: intersecta com disciplinas do professor, se houver
      if (discsPorProf) {
        for (const d of discsPorProf) if (discs.has(d)) return true
        return false
      }

      // Apenas por turno
      return true
    })
  })()

  const disciplinasFiltradas = (() => {
    const profId = Number(formData.professor_id)
    const turmaId = Number(formData.turma_id)
    const allowedByProf = profId
      ? new Set(
          profDiscLinks
            .filter((l) => l.professor_id === profId)
            .map((l) => l.disciplina_id)
        )
      : null
    const allowedByTurma = turmaId
      ? new Set(
          turmaDiscLinks
            .filter((l) => l.turma_id === turmaId)
            .map((l) => l.disciplina_id)
        )
      : null

    return disciplinas.filter((d) => {
      // If any constraint exists, enforce it; otherwise allow all
      if (allowedByProf && !allowedByProf.has(d.id)) return false
      if (allowedByTurma && !allowedByTurma.has(d.id)) return false
      return true
    })
  })()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Exigir período selecionado para definir horas
      if (!selectedPeriodoId) {
        throw new Error('Selecione um período de aula')
      }
      // Client-side guard: ensure vínculos exist to avoid 400
      const profId = Number(formData.professor_id)
      const discId = Number(formData.disciplina_id)
      const turmaId = Number(formData.turma_id)
      const hasProfDisc = profDiscLinks.some((l) => l.professor_id === profId && l.disciplina_id === discId)
      const hasTurmaDisc = turmaDiscLinks.some((l) => l.turma_id === turmaId && l.disciplina_id === discId)
      if (!hasProfDisc) {
        throw new Error('Professor não vinculado à disciplina selecionada')
      }
      if (!hasTurmaDisc) {
        throw new Error('Disciplina não está vinculada à turma selecionada')
      }

      await apiClient.post('/horarios/', {
        ...formData,
        professor_id: Number(formData.professor_id),
        disciplina_id: Number(formData.disciplina_id),
        turma_id: Number(formData.turma_id),
        turno_id: Number(formData.turno_id),
      })
      toast({
        title: 'Sucesso',
        description: 'Horário criado com sucesso',
      })
      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error?.message || 'Erro ao criar horário',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiClient.delete(`/horarios/${id}/`)
      toast({
        title: 'Sucesso',
        description: 'Horário excluído com sucesso',
      })
      loadData()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir horário',
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
      turma_id: '',
      turno_id: '',
      dia_semana: '',
      hora_inicio: '',
      hora_fim: '',
      observacoes: '',
    })
  }

  const columns: ColumnDef<Horario>[] = [
    {
      accessorKey: 'dia_semana',
      header: 'Dia',
      meta: { className: 'w-36' },
      cell: ({ row }) => {
        const dia = diasSemana.find((d) => d.value === row.original.dia_semana)
        return (
          <Badge variant="outline">{dia?.label || row.original.dia_semana}</Badge>
        )
      },
    },
    {
      accessorKey: 'hora_inicio',
      header: 'Início',
      meta: { className: 'w-24' },
    },
    {
      accessorKey: 'hora_fim',
      header: 'Fim',
      meta: { className: 'w-24' },
    },
    {
      accessorKey: 'professor.usuario.nome',
      header: 'Professor',
      meta: { className: 'truncate' },
      cell: ({ row }) => row.original.professor?.usuario?.nome || '-',
    },
    {
      accessorKey: 'disciplina.nome',
      header: 'Disciplina',
      meta: { className: 'truncate' },
      cell: ({ row }) => row.original.disciplina?.nome || '-',
    },
    {
      accessorKey: 'turma.nome',
      header: 'Turma',
      meta: { className: 'w-40 truncate' },
      cell: ({ row }) => row.original.turma?.nome || '-',
    },
    {
      accessorKey: 'turno.nome',
      header: 'Turno',
      meta: { className: 'w-28' },
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.turno?.nome || '-'}</Badge>
      ),
    },
    {
      accessorKey: 'sala',
      header: 'Sala',
      meta: { className: 'w-24' },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <Button
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          size="icon"
          onClick={() => setDeleteId(row.original.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleção de Contexto */}
              <div className="rounded-lg border p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Contexto</h3>
                  <p className="text-xs text-muted-foreground">Escolha turno e dia.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="dia_semana">Dia da Semana*</Label>
                    <Select
                      value={formData.dia_semana}
                      onValueChange={(value) => setFormData({ ...formData, dia_semana: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um dia" />
                      </SelectTrigger>
                      <SelectContent>
                        {diasSemana.map((dia) => (
                          <SelectItem key={dia.value} value={dia.value}>
                            {dia.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Vínculos */}
              <div className="rounded-lg border p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Vínculos</h3>
                  <p className="text-xs text-muted-foreground">Selecione professor, disciplina e turma.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Horários</h1>
          <p className="text-muted-foreground mt-2">
            {'Gerencie os horários de aula'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Horário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Horário</DialogTitle>
              <DialogDescription>
                {'Preencha os dados do novo horário de aula'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="professor">Professor*</Label>
                  <Select
                    value={formData.professor_id}
                    onValueChange={(value) => {
                      // Ao trocar professor, limpar disciplina e turma selecionadas
                      setFormData({ ...formData, professor_id: value, disciplina_id: '', turma_id: '' })
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professoresFiltrados.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id.toString()}>
                          {prof.usuario?.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disciplina">Disciplina*</Label>
                  <p className="text-xs text-muted-foreground">Pode escolher a disciplina primeiro; filtramos e selecionamos o professor quando houver apenas um.</p>
                  <Select
                    value={formData.disciplina_id}
                    onValueChange={(value) => setFormData({ ...formData, disciplina_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={'Selecione uma disciplina'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 overflow-y-auto">
                      {disciplinasFiltradas.length === 0 ? (
                        <SelectItem value="__empty" disabled>
                          Nenhuma disciplina vinculada
                        </SelectItem>
                      ) : (
                        disciplinasFiltradas.map((disc) => (
                          <SelectItem key={disc.id} value={disc.id.toString()}>
                            {disc.codigo ? `${disc.codigo} - ${disc.nome}` : disc.nome}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="turma">Turma*</Label>
                  <Select
                    value={formData.turma_id}
                </div>
              </div>
                          {turno.nome}
              {/* Período */}
              <div className="rounded-lg border p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Período</h3>
                  <p className="text-xs text-muted-foreground">Selecionar período define automaticamente início e fim.</p>
                </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                <div className="space-y-2">
                  <Label htmlFor="dia_semana">Dia da Semana*</Label>
                  <Select
                    value={formData.dia_semana}
                    onValueChange={(value) => setFormData({ ...formData, dia_semana: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {diasSemana.map((dia) => (
                        <SelectItem key={dia.value} value={dia.value}>
                          {dia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sala removida conforme solicitação */}

                <div className="space-y-2">

                {selectedPeriodoId && (
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Início:</span> {formData.hora_inicio || '--:--'}
                    </div>
                    <div>
                      <span className="font-medium">Fim:</span> {formData.hora_fim || '--:--'}
                    </div>
                  </div>
                )}
              </div>
                  <Label htmlFor="periodo-select">Período de Aula*</Label>
                  <p className="text-xs text-muted-foreground">Selecionar período define automaticamente início e fim.</p>
                  <Select
                    value={selectedPeriodoId}
                    onValueChange={(value) => setSelectedPeriodoId(value)}
                    disabled={!formData.turno_id || periodosFiltrados.length === 0}
                  >
                    <SelectTrigger id="periodo-select">
                      <SelectValue placeholder={
                        !formData.turno_id
                          ? 'Selecione o turno primeiro'
                          : periodosFiltrados.length === 0
                          ? 'Nenhum período de aula disponível'
                          : 'Selecione um período'
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {periodosFiltrados.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.numero_aula}ª aula • {p.hora_inicio} — {p.hora_fim}
                          {p.descricao ? ` • ${p.descricao}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
          <CardTitle>Grade de Horários</CardTitle>
          <CardDescription>
            {'Visualize e gerencie todos os horários cadastrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Barra de filtros */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={filterDia} onValueChange={setFilterDia}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por dia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os dias</SelectItem>
                {diasSemana.map((d)=> (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTurnoId} onValueChange={setFilterTurnoId}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os turnos</SelectItem>
                {turnos.map((t)=> (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTurmaId} onValueChange={setFilterTurmaId}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as turmas</SelectItem>
                {turmas.map((turma)=> (
                  <SelectItem key={turma.id} value={turma.id.toString()}>{turma.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterProfessorId} onValueChange={setFilterProfessorId}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por professor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os professores</SelectItem>
                {professores.map((p)=> (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.usuario?.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(() => {
            const filtered = horarios.filter((h)=> {
              if (filterDia && h.dia_semana !== filterDia) return false
              if (filterTurnoId && h.turno_id !== Number(filterTurnoId)) return false
              if (filterTurmaId && h.turma_id !== Number(filterTurmaId)) return false
              if (filterProfessorId && h.professor_id !== Number(filterProfessorId)) return false
              return true
            })
            return isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DataTable columns={columns} data={filtered} />
            )
          })()}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {'Tem certeza que deseja excluir este horário? Esta ação não pode ser desfeita.'}
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
