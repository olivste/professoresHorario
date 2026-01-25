"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Plus, Edit2, Trash2, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"

interface Turno {
  id: number
  nome: string
  hora_inicio: string
  hora_fim: string
  descricao?: string
  ativo: boolean
  periodos_aula: PeriodoAula[]
}

interface PeriodoAula {
  id: number
  turno_id: number
  numero_aula: number
  hora_inicio: string
  hora_fim: string
  tipo: "AULA" | "INTERVALO" | "ALMOCO" | "RECREIO" | "OUTRO"
  descricao?: string
  ativo: boolean
}

const getTipoBadgeColor = (tipo: string) => {
  const colors: { [key: string]: { bg: string; text: string; dot: string } } = {
    AULA: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
    INTERVALO: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
    ALMOCO: { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500" },
    RECREIO: { bg: "bg-purple-100", text: "text-purple-800", dot: "bg-purple-500" },
    OUTRO: { bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-500" },
  }
  return colors[tipo] || colors.OUTRO
}

export default function TurnosPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showNewTurnoForm, setShowNewTurnoForm] = useState(false)
  const [newTurno, setNewTurno] = useState({ nome: "", hora_inicio: "", hora_fim: "", descricao: "" })
  const [showNewPeriodoForm, setShowNewPeriodoForm] = useState(false)
  const [newPeriodo, setNewPeriodo] = useState({
    numero_aula: "1",
    hora_inicio: "",
    hora_fim: "",
    tipo: "AULA" as const,
    descricao: "",
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
        const baseTurnos = (await apiClient.getTurnos()) as Turno[]
        const withPeriodos = await Promise.all(
          baseTurnos.map(async (turno) => {
            const periodos = (await apiClient.getPeriodosAula({ turno_id: turno.id })) as PeriodoAula[]
            return { ...turno, periodos_aula: periodos }
          })
        )
        setTurnos(withPeriodos)
        if (withPeriodos.length > 0) setSelectedTurno(withPeriodos[0])
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar turnos")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [authLoading, isAuthenticated, router])

  const handleCreateTurno = async () => {
    if (!newTurno.nome || !newTurno.hora_inicio || !newTurno.hora_fim) {
      setError("Preencha todos os campos obrigatórios")
      return
    }
    try {
      const created = (await apiClient.createTurno({
        nome: newTurno.nome,
        hora_inicio: newTurno.hora_inicio,
        hora_fim: newTurno.hora_fim,
        descricao: newTurno.descricao,
        ativo: true,
      })) as Turno

      setTurnos((prev) => [...prev, { ...created, periodos_aula: [] }])
      setNewTurno({ nome: "", hora_inicio: "", hora_fim: "", descricao: "" })
      setShowNewTurnoForm(false)
      setError("")
    } catch (err: any) {
      setError(err?.message || "Erro ao criar turno")
    }
  }

  const handleCreatePeriodo = async () => {
    if (!selectedTurno || !newPeriodo.hora_inicio || !newPeriodo.hora_fim) {
      setError("Preencha todos os campos obrigatórios")
      return
    }
    try {
      const created = (await apiClient.createPeriodoAula({
        turno_id: selectedTurno.id,
        numero_aula: Number(newPeriodo.numero_aula || 0),
        hora_inicio: newPeriodo.hora_inicio,
        hora_fim: newPeriodo.hora_fim,
        tipo: newPeriodo.tipo,
        descricao: newPeriodo.descricao,
        ativo: true,
      })) as PeriodoAula

      setTurnos((prev) =>
        prev.map((t) => (t.id === selectedTurno.id ? { ...t, periodos_aula: [...t.periodos_aula, created] } : t))
      )
      setSelectedTurno((prev) => (prev ? { ...prev, periodos_aula: [...prev.periodos_aula, created] } : prev))
      setNewPeriodo({ numero_aula: "1", hora_inicio: "", hora_fim: "", tipo: "AULA", descricao: "" })
      setShowNewPeriodoForm(false)
      setError("")
    } catch (err: any) {
      setError(err?.message || "Erro ao criar período")
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <div className="p-6 text-center text-gray-600">Redirecionando para login...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Gerenciamento de Turnos</h1>
              <p className="text-blue-100 mt-1">Configure turnos e períodos de aula</p>
            </div>
            <Button
              onClick={() => setShowNewTurnoForm(true)}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" /> Novo Turno
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Turnos List */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Turnos ({turnos.length})</h2>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {turnos.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum turno cadastrado</p>
                  </div>
                ) : (
                  turnos.map((turno) => (
                    <button
                      key={turno.id}
                      onClick={() => setSelectedTurno(turno)}
                      className={`w-full p-4 text-left transition-colors ${
                        selectedTurno?.id === turno.id
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{turno.nome}</h3>
                        <Badge variant={turno.ativo ? "default" : "secondary"} className="ml-2 flex-shrink-0">
                          {turno.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                        <Clock className="h-3 w-3" />
                        {turno.hora_inicio} - {turno.hora_fim}
                      </div>
                      {turno.descricao && (
                        <p className="text-xs text-gray-500 line-clamp-1">{turno.descricao}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{turno.periodos_aula.length} períodos</p>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Main Content - Selected Turno Details */}
          <div className="lg:col-span-3">
            {showNewTurnoForm && (
              <Card className="border-0 shadow-sm mb-6">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Novo Turno</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Nome do Turno*</Label>
                      <Input
                        placeholder="Ex: Manhã, Tarde, Noite"
                        value={newTurno.nome}
                        onChange={(e) => setNewTurno({ ...newTurno, nome: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Hora Inicial*</Label>
                        <Input
                          type="time"
                          value={newTurno.hora_inicio}
                          onChange={(e) => setNewTurno({ ...newTurno, hora_inicio: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Hora Final*</Label>
                        <Input
                          type="time"
                          value={newTurno.hora_fim}
                          onChange={(e) => setNewTurno({ ...newTurno, hora_fim: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                      <Input
                        placeholder="Descrição adicional (opcional)"
                        value={newTurno.descricao}
                        onChange={(e) => setNewTurno({ ...newTurno, descricao: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowNewTurnoForm(false)
                          setNewTurno({ nome: "", hora_inicio: "", hora_fim: "", descricao: "" })
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateTurno} className="bg-blue-600 hover:bg-blue-700">
                        Criar Turno
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {selectedTurno && (
              <Card className="border-0 shadow-sm">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedTurno.nome}</h2>
                      <p className="text-gray-600 text-sm mt-1 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {selectedTurno.hora_inicio} - {selectedTurno.hora_fim}
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowNewPeriodoForm(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Período
                    </Button>
                  </div>
                </div>

                {showNewPeriodoForm && (
                  <div className="p-6 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-4">Novo Período</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Nº Aula</Label>
                        <Input
                          type="number"
                          min="1"
                          value={newPeriodo.numero_aula}
                          onChange={(e) => setNewPeriodo({ ...newPeriodo, numero_aula: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Início*</Label>
                        <Input
                          type="time"
                          value={newPeriodo.hora_inicio}
                          onChange={(e) => setNewPeriodo({ ...newPeriodo, hora_inicio: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Fim*</Label>
                        <Input
                          type="time"
                          value={newPeriodo.hora_fim}
                          onChange={(e) => setNewPeriodo({ ...newPeriodo, hora_fim: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Tipo</Label>
                        <Select
                          value={newPeriodo.tipo}
                          onValueChange={(value) =>
                            setNewPeriodo({ ...newPeriodo, tipo: value as any })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AULA">Aula</SelectItem>
                            <SelectItem value="INTERVALO">Intervalo</SelectItem>
                            <SelectItem value="ALMOCO">Almoço</SelectItem>
                            <SelectItem value="RECREIO">Recreio</SelectItem>
                            <SelectItem value="OUTRO">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Descrição</Label>
                        <Input
                          placeholder="Opcional"
                          value={newPeriodo.descricao}
                          onChange={(e) => setNewPeriodo({ ...newPeriodo, descricao: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowNewPeriodoForm(false)
                          setNewPeriodo({ numero_aula: "1", hora_inicio: "", hora_fim: "", tipo: "AULA", descricao: "" })
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleCreatePeriodo} className="bg-blue-600 hover:bg-blue-700">
                        Salvar Período
                      </Button>
                    </div>
                  </div>
                )}

                {selectedTurno.periodos_aula.length === 0 ? (
                  <div className="p-12 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">Nenhum período cadastrado</p>
                  </div>
                ) : (
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Períodos ({selectedTurno.periodos_aula.length})</h3>
                    <div className="space-y-3">
                      {selectedTurno.periodos_aula.map((periodo) => {
                        const colors = getTipoBadgeColor(periodo.tipo)
                        return (
                          <div
                            key={periodo.id}
                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                          >
                            <div className={`w-3 h-3 rounded-full ${colors.dot} flex-shrink-0`}></div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                {periodo.descricao || `Período ${periodo.numero_aula}`}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {periodo.hora_inicio} - {periodo.hora_fim}
                                {periodo.tipo === "AULA" && ` (${periodo.numero_aula}ª aula)`}
                              </div>
                            </div>
                            <Badge className={`${colors.bg} ${colors.text} border-0`}>
                              {periodo.tipo}
                            </Badge>
                            <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {!selectedTurno && !showNewTurnoForm && (
              <Card className="border-0 shadow-sm">
                <div className="p-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">Selecione um turno para começar</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
