'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api-client'
import { Loader2, X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  area_id?: number
  carga_horaria_semanal: number
}

interface Area {
  id: number
  nome: string
  cor?: string
  planejamentos: AreaPlanejamento[]
}

interface AreaPlanejamento {
  id: number
  area_id: number
  dia_semana: string
  hora_inicio: string
  hora_fim: string
  descricao?: string
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
  const [areas, setAreas] = useState<Area[]>([])
  const [planejamentos, setPlanejamentos] = useState<AreaPlanejamento[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTurno, setSelectedTurno] = useState<string>('')
  const [dragData, setDragData] = useState<{ profId: number; discId: number } | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showWorkload, setShowWorkload] = useState(false)
  
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
        turmaLinksData,
        areasData
      ] = await Promise.all([
        apiClient.get<Horario[]>('/horarios/?limit=1000'),
        apiClient.get<Professor[]>('/professores/?limit=1000'),
        apiClient.get<Disciplina[]>('/disciplinas/?limit=1000'),
        apiClient.get<Turma[]>('/turmas/?limit=1000'),
        apiClient.get<Turno[]>('/turnos/?limit=1000'),
        apiClient.get<PeriodoAula[]>('/periodos-aula/?limit=1000'),
        apiClient.get<any[]>('/professor-disciplinas/?limit=1000'),
        apiClient.get<any[]>('/turma-disciplinas/?limit=1000'),
        apiClient.get<Area[]>('/areas/?limit=1000'),
      ])
      
      setHorarios(horariosData)
      setProfessores(professoresData)
      setDisciplinas(disciplinasData)
      setTurmas(turmasData)
      setTurnos(turnosData)
      setPeriodos(periodosData)
      setProfDiscLinks(linksData)
      setTurmaDiscLinks(turmaLinksData)
      setAreas(areasData)
      
      // Load all planejamentos from all areas
      const allPlanejamentos: AreaPlanejamento[] = []
      for (const area of areasData) {
        if (area.id) {
          const planData = await apiClient.get<AreaPlanejamento[]>(`/areas/${area.id}/planejamentos/?limit=100`)
          allPlanejamentos.push(...planData)
        }
      }
      setPlanejamentos(allPlanejamentos)
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const turmasFiltradas = useMemo(() => {
    if (!selectedTurno) return []
    return turmas.filter(t => t.turno_id === Number(selectedTurno))
  }, [turmas, selectedTurno])
  
  const periodosAulaFiltrados = useMemo(() => {
    if (!selectedTurno) return []
    return periodos
      .filter(p => p.turno_id === Number(selectedTurno) && p.tipo === 'AULA')
      .sort((a, b) => a.numero_aula - b.numero_aula)
  }, [periodos, selectedTurno])

  // Calculate workload for each professor
  const cargaHorariaProfessores = useMemo(() => {
    const cargas = new Map<number, { atual: number; total: number; nome: string }>()
    
    professores.forEach(prof => {
      const horariosProf = horarios.filter(h => h.professor_id === prof.id)
      cargas.set(prof.id, {
        atual: horariosProf.length,
        total: prof.carga_horaria_semanal || 40,
        nome: prof.usuario?.nome || 'Professor'
      })
    })
    
    return cargas
  }, [professores, horarios])

  // Get professor-disciplina combinations available for selected turno (all turmas)
  const profDiscDisponiveis = useMemo(() => {
    if (!selectedTurno) return []
    
    const turmaIds = new Set(turmasFiltradas.map(t => t.id))
    const disciplinasDasTurmas = new Set(
      turmaDiscLinks.filter(l => turmaIds.has(l.turma_id)).map(l => l.disciplina_id)
    )
    
    return profDiscLinks.filter(pd => disciplinasDasTurmas.has(pd.disciplina_id))
  }, [selectedTurno, turmasFiltradas, profDiscLinks, turmaDiscLinks])

  function getHorarioParaSlot(turmaId: number, dia: string, periodo: PeriodoAula): Horario | undefined {
    return horarios.find(
      h => h.turma_id === turmaId && h.dia_semana === dia && h.hora_inicio.slice(0, 5) === periodo.hora_inicio.slice(0, 5)
    )
  }

  function getPlanejamentoParaSlot(areaId: number | null | undefined, dia: string, periodo: PeriodoAula): AreaPlanejamento | undefined {
    if (!areaId) return undefined
    return planejamentos.find(p => 
      p.area_id === areaId && 
      p.dia_semana === dia && 
      p.hora_inicio <= periodo.hora_inicio && 
      p.hora_fim >= periodo.hora_fim
    )
  }

  function handleDragStart(profId: number, discId: number) {
    setDragData({ profId, discId })
  }

  function handleDragEnd() {
    setDragData(null)
  }

  async function handleDrop(turmaId: number, dia: string, periodo: PeriodoAula) {
    if (!dragData || !selectedTurno) return

    try {
      // Check if slot already has a horario
      const existente = horarios.find(
        h => h.turma_id === turmaId && h.dia_semana === dia && h.hora_inicio.slice(0, 5) === periodo.hora_inicio.slice(0, 5)
      )
      
      if (existente) {
        toast({ 
          title: 'Atenção', 
          description: 'Já existe um horário neste período', 
          variant: 'destructive' 
        })
        return
      }

      // Check if professor is already teaching at this time (ANY turma)
      const professorOcupado = horarios.find(
        h => h.professor_id === dragData.profId && h.dia_semana === dia && h.hora_inicio.slice(0, 5) === periodo.hora_inicio.slice(0, 5)
      )
      
      if (professorOcupado) {
        const turmaOcupada = turmas.find(t => t.id === professorOcupado.turma_id)
        toast({ 
          title: 'Conflito de Horário', 
          description: `Professor já está dando aula para ${turmaOcupada?.nome || 'outra turma'} neste horário`, 
          variant: 'destructive' 
        })
        return
      }

      // Check if professor has planning at this time
      const professor = professores.find(p => p.id === dragData.profId)
      const planejamento = getPlanejamentoParaSlot(professor?.area_id, dia, periodo)
      if (planejamento) {
        toast({
          title: 'Atenção',
          description: 'Professor tem planejamento neste horário',
          variant: 'destructive'
        })
        return
      }

      await apiClient.post('/horarios/', {
        professor_id: dragData.profId,
        disciplina_id: dragData.discId,
        turma_id: turmaId,
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
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
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

            <div className="pt-6">
              <Button
                variant={showWorkload ? "default" : "outline"}
                onClick={() => setShowWorkload(!showWorkload)}
                size="sm"
              >
                {showWorkload ? "Ocultar" : "Ver"} Carga Horária
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Workload Panel */}
      {showWorkload && selectedTurno && (
        <Card>
          <CardHeader>
            <CardTitle>Carga Horária dos Professores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from(cargaHorariaProfessores.entries()).map(([profId, carga]) => {
                const percentual = (carga.atual / carga.total) * 100
                const isOverload = percentual > 100
                const isComplete = percentual >= 90 && percentual <= 100
                
                return (
                  <div 
                    key={profId}
                    className={`p-3 rounded-lg border ${
                      isOverload ? 'bg-destructive/10 border-destructive' :
                      isComplete ? 'bg-green-50 border-green-500' :
                      'bg-muted'
                    }`}
                  >
                    <div className="font-medium text-sm truncate">{carga.nome}</div>
                    <div className="text-xs mt-1">
                      {carga.atual} / {carga.total} aulas
                      <span className={`ml-2 font-semibold ${
                        isOverload ? 'text-destructive' :
                        isComplete ? 'text-green-600' :
                        'text-muted-foreground'
                      }`}>
                        ({percentual.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTurno && turmasFiltradas.length > 0 && (
        <Tabs defaultValue="visao-geral" className="space-y-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            <TabsList>
              <TabsTrigger value="visao-geral">
                📊 Visão Geral
              </TabsTrigger>
              {turmasFiltradas.map(turma => (
                <TabsTrigger key={turma.id} value={turma.id.toString()}>
                  {turma.nome}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="visao-geral">
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral de Todos os Horários</CardTitle>
                <p className="text-sm text-muted-foreground">Visualização consolidada de todas as turmas do turno selecionado</p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="space-y-6">
                  {turmasFiltradas.map(turma => (
                    <div key={turma.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-lg font-semibold">{turma.nome}</h3>
                        <Badge variant="outline">{turma.ano}º ano</Badge>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr>
                              <th className="border p-2 bg-muted w-24 text-xs font-medium">Horário</th>
                              {DIAS_SEMANA.map(dia => (
                                <th key={dia.value} className="border p-2 bg-muted min-w-[140px] text-xs font-medium">
                                  {dia.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {periodosAulaFiltrados.map(periodo => (
                              <tr key={periodo.id}>
                                <td className="border p-2 bg-muted/50 text-xs text-center">
                                  <div className="font-medium">{periodo.numero_aula}ª</div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {periodo.hora_inicio.slice(0, 5)}
                                  </div>
                                </td>
                                {DIAS_SEMANA.map(dia => {
                                  const horario = getHorarioParaSlot(turma.id, dia.value, periodo)
                                  return (
                                    <td key={dia.value} className="border p-1 h-16">
                                      {horario ? (
                                        <div className="bg-primary/10 border border-primary/20 rounded p-1.5 h-full group relative">
                                          <button
                                            onClick={() => setDeleteId(horario.id)}
                                            className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <X className="h-3 w-3 text-destructive" />
                                          </button>
                                          <div className="text-[10px] font-medium truncate">
                                            {horario.professor?.usuario?.nome}
                                          </div>
                                          <div className="text-[9px] text-muted-foreground truncate">
                                            {horario.disciplina?.nome}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground"></div>
                                      )}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {turmasFiltradas.map((turma) => (
            <TabsContent key={turma.id} value={turma.id.toString()}>
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
                        Nenhuma combinação disponível
                      </p>
                    ) : (
                      profDiscDisponiveis.map((pd) => {
                        const professor = professores.find(p => p.id === pd.professor_id)
                        const carga = cargaHorariaProfessores.get(pd.professor_id)
                        const percentual = carga ? (carga.atual / carga.total) * 100 : 0
                        const isOverload = percentual > 100
                        
                        return (
                          <div
                            key={`${pd.professor_id}-${pd.disciplina_id}`}
                            draggable
                            onDragStart={() => handleDragStart(pd.professor_id, pd.disciplina_id)}
                            onDragEnd={handleDragEnd}
                            className={`p-3 border rounded-lg cursor-move hover:bg-accent transition-colors ${
                              isOverload ? 'bg-destructive/5 border-destructive' : 'bg-card'
                            }`}
                          >
                            <div className="font-medium text-sm truncate">
                              {pd.professor?.usuario?.nome || 'Professor'}
                            </div>
                            <div className="text-xs text-muted-foreground truncate mt-1">
                              {pd.disciplina?.nome || 'Disciplina'}
                            </div>
                            {carga && (
                              <div className={`text-[10px] mt-1 ${
                                isOverload ? 'text-destructive font-semibold' : 'text-muted-foreground'
                              }`}>
                                {carga.atual}/{carga.total} aulas ({percentual.toFixed(0)}%)
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>

                {/* Main Grid */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{turma.nome}</CardTitle>
                      <Badge>{turma.ano}º ano</Badge>
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
                                const horario = getHorarioParaSlot(turma.id, dia.value, periodo)
                                const professor = horario ? professores.find(p => p.id === horario.professor_id) : null
                                const planejamento = professor ? getPlanejamentoParaSlot(professor.area_id, dia.value, periodo) : null
                                
                                return (
                                  <td
                                    key={dia.value}
                                    className="border p-1 relative h-20"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(turma.id, dia.value, periodo)}
                                  >
                                    {planejamento && !horario ? (
                                      <div className="bg-yellow-50 border border-yellow-300 rounded p-2 h-full flex items-center justify-center">
                                        <div className="text-xs text-yellow-700 font-medium text-center">
                                          Planejamento
                                        </div>
                                      </div>
                                    ) : horario ? (
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
            </TabsContent>
          ))}
        </Tabs>
      )}

      {!selectedTurno && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Selecione um turno para começar
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
