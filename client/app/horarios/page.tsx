"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, BookOpen, MapPin } from "lucide-react"
import { ScheduleGrid } from "@/components/schedule-grid"
import { useAuth } from "@/hooks/use-auth"

interface Horario {
  id: number
  professor_id: number
  disciplina_id: number
  turma_id: number
  turno_id: number
  dia_semana: string
  hora_inicio: string
  hora_fim: string
  sala?: string
  observacoes?: string
  professor: {
    id: number
    usuario: {
      nome: string
    }
  }
  disciplina: {
    nome: string
    codigo?: string
  }
  turma: {
    nome: string
    ano: string
  }
  turno: {
    nome: string
  }
}

const diasSemana = [
  { value: "segunda", label: "Segunda-feira" },
  { value: "terca", label: "Terça-feira" },
  { value: "quarta", label: "Quarta-feira" },
  { value: "quinta", label: "Quinta-feira" },
  { value: "sexta", label: "Sexta-feira" },
  { value: "sabado", label: "Sábado" },
]

export default function Horarios() {
  const { isAuthenticated } = useAuth()
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [filtros, setFiltros] = useState({
    professor_id: "all",
    turma_id: "all",
    turno_id: "all",
    dia_semana: "all",
  })
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - replace with actual API calls
  useEffect(() => {
    if (!isAuthenticated) return

    const mockHorarios: Horario[] = [
      {
        id: 1,
        professor_id: 1,
        disciplina_id: 1,
        turma_id: 1,
        turno_id: 1,
        dia_semana: "segunda",
        hora_inicio: "07:30:00",
        hora_fim: "08:20:00",
        sala: "Sala 101",
        observacoes: "",
        professor: {
          id: 1,
          usuario: { nome: "Prof. João Silva" },
        },
        disciplina: {
          nome: "Matemática",
          codigo: "MAT001",
        },
        turma: {
          nome: "1º A",
          ano: "1º",
        },
        turno: {
          nome: "Matutino",
        },
      },
      {
        id: 2,
        professor_id: 2,
        disciplina_id: 2,
        turma_id: 1,
        turno_id: 1,
        dia_semana: "segunda",
        hora_inicio: "08:20:00",
        hora_fim: "09:10:00",
        sala: "Sala 102",
        observacoes: "",
        professor: {
          id: 2,
          usuario: { nome: "Prof. Maria Santos" },
        },
        disciplina: {
          nome: "Português",
          codigo: "POR001",
        },
        turma: {
          nome: "1º A",
          ano: "1º",
        },
        turno: {
          nome: "Matutino",
        },
      },
    ]

    setHorarios(mockHorarios)
    setIsLoading(false)
  }, [isAuthenticated])

  const horariosFiltered = horarios.filter((horario) => {
    return (
      (filtros.professor_id === "all" || horario.professor_id.toString() === filtros.professor_id) &&
      (filtros.turma_id === "all" || horario.turma_id.toString() === filtros.turma_id) &&
      (filtros.turno_id === "all" || horario.turno_id.toString() === filtros.turno_id) &&
      (filtros.dia_semana === "all" || horario.dia_semana === filtros.dia_semana)
    )
  })

  if (!isAuthenticated) {
    return <div>Acesso negado</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciamento de Horários</h1>
        <p className="text-gray-600">Visualize e gerencie os horários de aulas</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre os horários por professor, turma, turno ou dia da semana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Professor</label>
              <Select
                value={filtros.professor_id}
                onValueChange={(value) => setFiltros({ ...filtros, professor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os professores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os professores</SelectItem>
                  <SelectItem value="1">Prof. João Silva</SelectItem>
                  <SelectItem value="2">Prof. Maria Santos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Turma</label>
              <Select value={filtros.turma_id} onValueChange={(value) => setFiltros({ ...filtros, turma_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as turmas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  <SelectItem value="1">1º A</SelectItem>
                  <SelectItem value="2">1º B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Turno</label>
              <Select value={filtros.turno_id} onValueChange={(value) => setFiltros({ ...filtros, turno_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os turnos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os turnos</SelectItem>
                  <SelectItem value="1">Matutino</SelectItem>
                  <SelectItem value="2">Vespertino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Dia da Semana</label>
              <Select
                value={filtros.dia_semana}
                onValueChange={(value) => setFiltros({ ...filtros, dia_semana: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os dias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os dias</SelectItem>
                  {diasSemana.map((dia) => (
                    <SelectItem key={dia.value} value={dia.value}>
                      {dia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} onClick={() => setViewMode("grid")}>
            <Calendar className="h-4 w-4 mr-2" />
            Grade
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} onClick={() => setViewMode("list")}>
            Lista
          </Button>
        </div>
        <Button>Novo Horário</Button>
      </div>

      {/* Content */}
      {viewMode === "grid" ? (
        <ScheduleGrid horarios={horariosFiltered} />
      ) : (
        <div className="grid gap-4">
          {horariosFiltered.map((horario) => (
            <Card key={horario.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{diasSemana.find((d) => d.value === horario.dia_semana)?.label}</Badge>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {horario.hora_inicio} - {horario.hora_fim}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{horario.professor.usuario.nome}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{horario.disciplina.nome}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{horario.sala}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">
                    {horario.turma.nome} - {horario.turno.nome}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
