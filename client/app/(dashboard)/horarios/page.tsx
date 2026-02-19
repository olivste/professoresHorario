'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api-client'
import { Loader2, X, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
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
}

interface Turma {
  id: number
  nome: string
  turno_id: number
  ano: string
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
  tipo: 'AULA' | 'INTERVALO' | 'ALMOCO' | 'RECREIO'
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
  dia_semana: string
  hora_inicio: string
  hora_fim: string
  observacoes?: string
}

interface ProfessorDisciplina {
  professor_id: number
  disciplina_id: number
  professor: Professor
  disciplina: Disciplina
}

const DIAS_SEMANA = [
  { value: 'segunda', label: 'SEG' },
  { value: 'terca', label: 'TER' },
  { value: 'quarta', label: 'QUA' },
  { value: 'quinta', label: 'QUI' },
  { value: 'sexta', label: 'SEX' },
]

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [periodos, setPeriodos] = useState<PeriodoAula[]>([])
  const [profDiscLinks, setProfDiscLinks] = useState<ProfessorDisciplina[]>([])
  const [turmaDiscLinks, setTurmaDiscLinks] = useState<Array<{ turma_id: number; disciplina_id: number }>>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTurma, setSelectedTurma] = useState<string>('')
  const [selectedTurno, setSelectedTurno] = useState<string>('')
  const [dragData, setDragData] = useState<{ profId: number; discId: number } | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [
        horariosData,
        professoresData,
        disciplinasData,
        turmasData,
        turnosData,
        periodosData,
        linksData,
        turmaLinksData
      ] = await Promise.all([
        apiClient.get<Horario[]>('/horarios/?limit=1000'),
        apiClient.get<Professor[]>('/professores/?limit=1000'),
        apiClient.get<Disciplina[]>('/disciplinas/?limit=1000'),
        apiClient.get<Turma[]>('/turmas/?limit=1000'),
        apiClient.get<Turno[]>('/turnos/?limit=1000'),
        apiClient.get<PeriodoAula[]>('/periodos-aula/?limit=1000'),
        apiClient.get<any[]>('/professor-disciplinas/?limit=1000'),
        apiClient.get<any[]>('/turma-disciplinas/?limit=1000'),
      ])
      
      setHorarios(horariosData)
      setProfessores(professoresData)
      setDisciplinas(disciplinasData)
      setTurmas(turmasData)
      setTurnos(turnosData)
      setPeriodos(periodosData)
      setProfDiscLinks(linksData)
      setTurmaDiscLinks(turmaLinksData)
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-select first turma when turno changes
  useEffect(() => {
    if (selectedTurno) {
      const turmasFiltradas = turmas.filter(t => t.turno_id === Number(selectedTurno))
      if (turmasFiltradas.length > 0) {
        setSelectedTurma(turmasFiltradas[0].id.toString())
      }
    }
  }, [selectedTurno, turmas])

  const turmaAtual = turmas.find(t => t.id === Number(selectedTurma))
  
  const periodosAulaFiltrados = useMemo(() => {
    if (!selectedTurno) return []
    return periodos
      .filter(p => p.turno_id === Number(selectedTurno) && p.tipo === 'AULA')
      .sort((a, b) => a.numero_aula - b.numero_aula)
  }, [periodos, selectedTurno])

  const turmasFiltradas = useMemo(() => {
    if (!selectedTurno) return []
    return turmas.filter(t => t.turno_id === Number(selectedTurno))
  }, [turmas, selectedTurno])

  // Get professor-disciplina combinations available for selected turma
  const profDiscDisponiveis = useMemo(() => {
    if (!selectedTurma) return []
    
    const turmaId = Number(selectedTurma)
    const disciplinasDaTurma = new Set(
      turmaDiscLinks.filter(l => l.turma_id === turmaId).map(l => l.disciplina_id)
    )
    
    return profDiscLinks.filter(pd => disciplinasDaTurma.has(pd.disciplina_id))
  }, [selectedTurma, profDiscLinks, turmaDiscLinks])

  const horariosFiltrados = useMemo(() => {
    if (!selectedTurma) return []
    return horarios.filter(h => h.turma_id === Number(selectedTurma))
  }, [horarios, selectedTurma])

  function handleDragStart(profId: number, discId: number) {
    setDragData({ profId, discId })
  }

  function handleDragEnd() {
    setDragData(null)
  }

  async function handleDrop(dia: string, periodo: PeriodoAula) {
    if (!dragData || !selectedTurma || !selectedTurno) return

    try {
      // Check if slot already has a horario
      const existente = horariosFiltrados.find(
        h => h.dia_semana === dia && h.hora_inicio === periodo.hora_inicio
      )
      
      if (existente) {
        toast({ 
          title: 'Atenção', 
          description: 'Já existe um horário neste período', 
          variant: 'destructive' 
        })
        return
      }

      await apiClient.post('/horarios/', {
        professor_id: dragData.profId,
        disciplina_id: dragData.discId,
        turma_id: Number(selectedTurma),
        turno_id: Number(selectedTurno),
        dia_semana: dia,
        hora_inicio: periodo.hora_inicio,
        hora_fim: periodo.hora_fim,
        observacoes: '',
      })

      toast({ title: 'Sucesso', description: 'Horário criado com sucesso' })
      loadData()
    } catch (error: any) {
      toast({ 
        title: 'Erro', 
        description: error?.response?.data?.detail || 'Erro ao criar horário', 
        variant: 'destructive' 
      })
    } finally {
      setDragData(null)
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiClient.delete(`/horarios/${id}/`)
      toast({ title: 'Sucesso', description: 'Horário excluído com sucesso' })
      loadData()
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir horário', variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  function getHorarioParaSlot(dia: string, periodo: PeriodoAula): Horario | undefined {
    return horariosFiltrados.find(
      h => h.dia_semana === dia && h.hora_inicio === periodo.hora_inicio
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grade de Horários</h1>
        <p className="text-muted-foreground mt-2">
          Arraste professores e disciplinas para os horários desejados
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Turno</label>
              <Select value={selectedTurno} onValueChange={setSelectedTurno}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  {turnos.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Turma</label>
              <Select value={selectedTurma} onValueChange={setSelectedTurma} disabled={!selectedTurno}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmasFiltradas.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedTurma && turmaAtual && (
        <div className="grid grid-cols-[300px_1fr] gap-6">
          {/* Sidebar - Available Items */}
          <Card className="h-fit sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Disponíveis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Arraste para a grade
              </p>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {profDiscDisponiveis.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma combinação disponível para esta turma
                </p>
              ) : (
                profDiscDisponiveis.map((pd) => (
                  <div
                    key={`${pd.professor_id}-${pd.disciplina_id}`}
                    draggable
                    onDragStart={() => handleDragStart(pd.professor_id, pd.disciplina_id)}
                    onDragEnd={handleDragEnd}
                    className="p-3 bg-card border rounded-lg cursor-move hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-sm truncate">
                      {pd.professor?.usuario?.nome || 'Professor'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {pd.disciplina?.nome || 'Disciplina'}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Main Grid */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{turmaAtual.nome}</CardTitle>
                <Badge>{turmaAtual.ano} ano</Badge>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-muted w-32 text-sm font-medium">
                        Horário
                      </th>
                      {DIAS_SEMANA.map(dia => (
                        <th key={dia.value} className="border p-2 bg-muted min-w-[160px] text-sm font-medium">
                          {dia.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periodosAulaFiltrados.map(periodo => (
                      <tr key={periodo.id}>
                        <td className="border p-2 bg-muted/50 text-xs text-center">
                          <div className="font-medium">{periodo.numero_aula}ª aula</div>
                          <div className="text-muted-foreground mt-1">
                            {periodo.hora_inicio.slice(0, 5)} - {periodo.hora_fim.slice(0, 5)}
                          </div>
                        </td>
                        {DIAS_SEMANA.map(dia => {
                          const horario = getHorarioParaSlot(dia.value, periodo)
                          return (
                            <td
                              key={dia.value}
                              className="border p-1 relative h-20"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleDrop(dia.value, periodo)}
                            >
                              {horario ? (
                                <div className="bg-primary/10 border border-primary/20 rounded p-2 h-full flex flex-col justify-between group relative">
                                  <button
                                    onClick={() => setDeleteId(horario.id)}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3 text-destructive" />
                                  </button>
                                  <div>
                                    <div className="font-medium text-xs truncate">
                                      {horario.professor?.usuario?.nome}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground truncate">
                                      {horario.disciplina?.nome}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                  <Plus className="h-4 w-4 opacity-0 hover:opacity-100 transition-opacity" />
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedTurma && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Selecione um turno e uma turma para começar
            </p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este horário? Esta ação não pode ser desfeita.
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
