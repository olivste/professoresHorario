"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, BookOpen, Users } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { TeacherCalendar } from "@/components/teacher-calendar"

interface AulaHoje {
  id: number
  disciplina: string
  turma: string
  sala: string
  hora_inicio: string
  hora_fim: string
  status: "agendada" | "em_andamento" | "concluida" | "cancelada"
}

export function TeacherDashboard() {
  const { user } = useAuth()
  const [aulasHoje, setAulasHoje] = useState<AulaHoje[]>([])
  const [proximaAula, setProximaAula] = useState<AulaHoje | null>(null)
  const [stats, setStats] = useState({
    aulasHoje: 0,
    turmasAtendidas: 0,
    cargaHorariaSemanal: 0,
    disciplinasLecionadas: 0,
  })

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockAulas: AulaHoje[] = [
      {
        id: 1,
        disciplina: "Matemática",
        turma: "1º A",
        sala: "Sala 101",
        hora_inicio: "07:30",
        hora_fim: "08:20",
        status: "concluida",
      },
      {
        id: 2,
        disciplina: "Matemática",
        turma: "1º B",
        sala: "Sala 102",
        hora_inicio: "08:20",
        hora_fim: "09:10",
        status: "em_andamento",
      },
      {
        id: 3,
        disciplina: "Álgebra",
        turma: "2º A",
        sala: "Sala 103",
        hora_inicio: "09:30",
        hora_fim: "10:20",
        status: "agendada",
      },
      {
        id: 4,
        disciplina: "Geometria",
        turma: "2º B",
        sala: "Sala 104",
        hora_inicio: "10:20",
        hora_fim: "11:10",
        status: "agendada",
      },
      {
        id: 5,
        disciplina: "Matemática",
        turma: "3º A",
        sala: "Sala 105",
        hora_inicio: "11:10",
        hora_fim: "12:00",
        status: "agendada",
      },
    ]

    setAulasHoje(mockAulas)
    setProximaAula(mockAulas.find((aula) => aula.status === "agendada") || null)
    setStats({
      aulasHoje: mockAulas.length,
      turmasAtendidas: 8,
      cargaHorariaSemanal: 40,
      disciplinasLecionadas: 3,
    })
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluida":
        return "bg-green-100 text-green-800"
      case "em_andamento":
        return "bg-blue-100 text-blue-800"
      case "agendada":
        return "bg-yellow-100 text-yellow-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "concluida":
        return "Concluída"
      case "em_andamento":
        return "Em Andamento"
      case "agendada":
        return "Agendada"
      case "cancelada":
        return "Cancelada"
      default:
        return "Desconhecido"
    }
  }

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Olá, Prof. {user?.nome}!</h1>
        <p className="text-gray-600 capitalize">{hoje}</p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Professor
          </span>
        </div>
      </div>

      {/* Próxima Aula */}
      {proximaAula && (
        <Card className="mb-6 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Próxima Aula</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{proximaAula.disciplina}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{proximaAula.turma}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{proximaAula.sala}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {proximaAula.hora_inicio} - {proximaAula.hora_fim}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{proximaAula.hora_inicio}</div>
                <Badge className={getStatusColor(proximaAula.status)}>{getStatusText(proximaAula.status)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aulas Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.aulasHoje}</div>
              <p className="text-xs text-muted-foreground">Aulas programadas para hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Turmas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.turmasAtendidas}</div>
              <p className="text-xs text-muted-foreground">Turmas que você leciona</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carga Horária</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cargaHorariaSemanal}h</div>
              <p className="text-xs text-muted-foreground">Horas semanais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.disciplinasLecionadas}</div>
              <p className="text-xs text-muted-foreground">Disciplinas que você leciona</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendário */}
        <div className="lg:col-span-2">
          <TeacherCalendar />
        </div>
      </div>

      {/* Aulas de Hoje */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Aulas de Hoje</CardTitle>
          <CardDescription>Cronograma completo das suas aulas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aulasHoje.map((aula) => (
              <div
                key={aula.id}
                className={`p-4 rounded-lg border-l-4 ${
                  aula.status === "em_andamento"
                    ? "border-l-blue-500 bg-blue-50"
                    : aula.status === "concluida"
                      ? "border-l-green-500 bg-green-50"
                      : "border-l-gray-300 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{aula.disciplina}</h3>
                      <Badge className={getStatusColor(aula.status)}>{getStatusText(aula.status)}</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{aula.turma}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{aula.sala}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {aula.hora_inicio} - {aula.hora_fim}
                    </div>
                    <div className="text-sm text-gray-500">50 minutos</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
