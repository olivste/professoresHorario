"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, BookOpen, MapPin, Plus, Edit2, Trash2, AlertCircle, Grid3X3, List } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"

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

interface Professor {
  id: number
  usuario: { nome: string }
}

interface Disciplina {
  id: number
  nome: string
  codigo?: string
}

interface Turma {
  id: number
  nome: string
  ano: string
}

interface Turno {
  id: number
  nome: string
}

const diasSemana = [
  { value: "segunda", label: "Segunda" },
  { value: "terca", label: "Terça" },
  { value: "quarta", label: "Quarta" },
  { value: "quinta", label: "Quinta" },
  { value: "sexta", label: "Sexta" },
]

const diaSemanaFull: { [key: string]: string } = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
}

export default function Horarios() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showForm, setShowForm] = useState(false)
  const [newHorario, setNewHorario] = useState({
    professor_id: "",
    disciplina_id: "",
    turma_id: "",
    turno_id: "",
    dia_semana: "segunda",
    hora_inicio: "",
    hora_fim: "",
    sala: "",
    observacoes: "",
  })

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.replace("/login")
      setIsLoading(false)
      return
    }

    const load = async () => {
      setIsLoading(true)
      setError("")
      try {
        const [hor, prof, disc, turm, turn] = await Promise.all([
          apiClient.getHorarios(),
          apiClient.getProfessores(),
          apiClient.getDisciplinas(),
          apiClient.getTurmas(),
          apiClient.getTurnos(),
        ])

        setHorarios(hor as Horario[])
        setProfessores(prof as Professor[])
        setDisciplinas(disc as Disciplina[])
        setTurmas(turm as Turma[])
        setTurnos(turn as Turno[])
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar dados")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [authLoading, isAuthenticated, router])

  const handleCreate = async () => {
    if (!newHorario.professor_id || !newHorario.disciplina_id || !newHorario.turma_id || !newHorario.hora_inicio || !newHorario.hora_fim) {
      setError("Preencha todos os campos obrigatórios")
      return
    }
    try {
      const created = (await apiClient.createHorario({
        professor_id: Number(newHorario.professor_id),
        disciplina_id: Number(newHorario.disciplina_id),
        turma_id: Number(newHorario.turma_id),
        turno_id: Number(newHorario.turno_id) || undefined,
        dia_semana: newHorario.dia_semana,
        hora_inicio: newHorario.hora_inicio,
        hora_fim: newHorario.hora_fim,
        sala: newHorario.sala,
        observacoes: newHorario.observacoes,
      })) as Horario

      setHorarios((prev) => [...prev, created])
      setNewHorario({
        professor_id: "",
        disciplina_id: "",
        turma_id: "",
        turno_id: "",
        dia_semana: "segunda",
        hora_inicio: "",
        hora_fim: "",
        sala: "",
        observacoes: "",
      })
      setShowForm(false)
      setError("")
    } catch (err: any) {
      setError(err?.message || "Erro ao criar horário")
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <div className="p-6 text-center text-gray-600">Redirecionando para login...</div>
  }

  const sortedHorarios = [...horarios].sort((a, b) => {
    const order = { segunda: 0, terca: 1, quarta: 2, quinta: 3, sexta: 4 }
    const diaCompare = (order[a.dia_semana as keyof typeof order] || 0) - (order[b.dia_semana as keyof typeof order] || 0)
    if (diaCompare !== 0) return diaCompare
    return a.hora_inicio.localeCompare(b.hora_inicio)
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Gerenciamento de Horários</h1>
              <p className="text-purple-100 mt-1">Organize aulas e períodos</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-white text-purple-600 hover:bg-purple-50">
              <Plus className="h-4 w-4 mr-2" /> Novo Horário
            </Button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "default" : "outline"}
              className={viewMode === "list" ? "bg-white text-purple-600" : "text-white hover:bg-white hover:text-purple-600"}
              size="sm"
            >
              <List className="h-4 w-4 mr-1" /> Lista
            </Button>
            <Button
              onClick={() => setViewMode("grid")}
              variant={viewMode === "grid" ? "default" : "outline"}
              className={viewMode === "grid" ? "bg-white text-purple-600" : "text-white hover:bg-white hover:text-purple-600"}
              size="sm"
            >
              <Grid3X3 className="h-4 w-4 mr-1" /> Grade
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* New Horario Form */}
        {showForm && (
          <Card className="border-0 shadow-sm mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Novo Horário</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Professor*</Label>
                  <Select value={newHorario.professor_id} onValueChange={(v) => setNewHorario({ ...newHorario, professor_id: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {professores.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.usuario.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Disciplina*</Label>
                  <Select value={newHorario.disciplina_id} onValueChange={(v) => setNewHorario({ ...newHorario, disciplina_id: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplinas.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Turma*</Label>
                  <Select value={newHorario.turma_id} onValueChange={(v) => setNewHorario({ ...newHorario, turma_id: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {turmas.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Dia da Semana*</Label>
                  <Select value={newHorario.dia_semana} onValueChange={(v) => setNewHorario({ ...newHorario, dia_semana: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {diasSemana.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Hora Inicial*</Label>
                  <Input
                    type="time"
                    value={newHorario.hora_inicio}
                    onChange={(e) => setNewHorario({ ...newHorario, hora_inicio: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Hora Final*</Label>
                  <Input
                    type="time"
                    value={newHorario.hora_fim}
                    onChange={(e) => setNewHorario({ ...newHorario, hora_fim: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Sala</Label>
                  <Input
                    placeholder="Ex: Sala 101"
                    value={newHorario.sala}
                    onChange={(e) => setNewHorario({ ...newHorario, sala: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700">Observações</Label>
                  <Input
                    placeholder="Notas adicionais"
                    value={newHorario.observacoes}
                    onChange={(e) => setNewHorario({ ...newHorario, observacoes: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setNewHorario({
                      professor_id: "",
                      disciplina_id: "",
                      turma_id: "",
                      turno_id: "",
                      dia_semana: "segunda",
                      hora_inicio: "",
                      hora_fim: "",
                      sala: "",
                      observacoes: "",
                    })
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
                  Salvar Horário
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Content */}
        {horarios.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Nenhum horário cadastrado</p>
            </div>
          </Card>
        ) : viewMode === "list" ? (
          <Card className="border-0 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Dia</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Horário</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Professor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Disciplina</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Turma</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Sala</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedHorarios.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        <Badge variant="outline">{diaSemanaFull[h.dia_semana]}</Badge>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {h.hora_inicio} - {h.hora_fim}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {h.professor.usuario.nome}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {h.disciplina.nome}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{h.turma.nome}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {h.sala && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {h.sala}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diasSemana.map((dia) => {
              const diaHorarios = sortedHorarios.filter((h) => h.dia_semana === dia.value)
              return (
                <Card key={dia.value} className="border-0 shadow-sm">
                  <div className="p-6 border-b">
                    <h3 className="font-semibold text-gray-900">{diaSemanaFull[dia.value]}</h3>
                  </div>
                  <div className="divide-y">
                    {diaHorarios.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm">Sem aulas</div>
                    ) : (
                      diaHorarios.map((h) => (
                        <div key={h.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold text-gray-900">{h.disciplina.nome}</div>
                              <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {h.hora_inicio} - {h.hora_fim}
                              </div>
                            </div>
                            <Badge variant="secondary">{h.turma.nome}</Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            <div>{h.professor.usuario.nome}</div>
                            {h.sala && <div>{h.sala}</div>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
