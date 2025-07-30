"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Plus, Edit, Trash2 } from "lucide-react"
import { PeriodTimeline } from "@/components/period-timeline"
import { useAuth } from "@/hooks/use-auth"

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
  turma_id?: number
  numero_aula: number
  hora_inicio: string
  hora_fim: string
  tipo: "AULA" | "INTERVALO" | "ALMOCO" | "RECREIO" | "OUTRO"
  descricao?: string
  ativo: boolean
}

export default function Turnos() {
  const { isAuthenticated } = useAuth()
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - replace with actual API calls
  useEffect(() => {
    if (!isAuthenticated) return

    const mockTurnos: Turno[] = [
      {
        id: 1,
        nome: "Matutino",
        hora_inicio: "07:30:00",
        hora_fim: "12:20:00",
        descricao: "Turno da manhã",
        ativo: true,
        periodos_aula: [
          {
            id: 1,
            turno_id: 1,
            numero_aula: 1,
            hora_inicio: "07:30:00",
            hora_fim: "08:20:00",
            tipo: "AULA",
            descricao: "1ª Aula",
            ativo: true,
          },
          {
            id: 2,
            turno_id: 1,
            numero_aula: 2,
            hora_inicio: "08:20:00",
            hora_fim: "09:10:00",
            tipo: "AULA",
            descricao: "2ª Aula",
            ativo: true,
          },
          {
            id: 3,
            turno_id: 1,
            numero_aula: 0,
            hora_inicio: "09:10:00",
            hora_fim: "09:30:00",
            tipo: "INTERVALO",
            descricao: "Intervalo",
            ativo: true,
          },
          {
            id: 4,
            turno_id: 1,
            numero_aula: 3,
            hora_inicio: "09:30:00",
            hora_fim: "10:20:00",
            tipo: "AULA",
            descricao: "3ª Aula",
            ativo: true,
          },
          {
            id: 5,
            turno_id: 1,
            numero_aula: 4,
            hora_inicio: "10:20:00",
            hora_fim: "11:10:00",
            tipo: "AULA",
            descricao: "4ª Aula",
            ativo: true,
          },
          {
            id: 6,
            turno_id: 1,
            numero_aula: 5,
            hora_inicio: "11:10:00",
            hora_fim: "12:00:00",
            tipo: "AULA",
            descricao: "5ª Aula",
            ativo: true,
          },
        ],
      },
      {
        id: 2,
        nome: "Vespertino",
        hora_inicio: "13:00:00",
        hora_fim: "17:50:00",
        descricao: "Turno da tarde",
        ativo: true,
        periodos_aula: [
          {
            id: 7,
            turno_id: 2,
            numero_aula: 1,
            hora_inicio: "13:00:00",
            hora_fim: "13:50:00",
            tipo: "AULA",
            descricao: "1ª Aula",
            ativo: true,
          },
          {
            id: 8,
            turno_id: 2,
            numero_aula: 2,
            hora_inicio: "13:50:00",
            hora_fim: "14:40:00",
            tipo: "AULA",
            descricao: "2ª Aula",
            ativo: true,
          },
          {
            id: 9,
            turno_id: 2,
            numero_aula: 0,
            hora_inicio: "14:40:00",
            hora_fim: "15:00:00",
            tipo: "INTERVALO",
            descricao: "Intervalo",
            ativo: true,
          },
          {
            id: 10,
            turno_id: 2,
            numero_aula: 3,
            hora_inicio: "15:00:00",
            hora_fim: "15:50:00",
            tipo: "AULA",
            descricao: "3ª Aula",
            ativo: true,
          },
          {
            id: 11,
            turno_id: 2,
            numero_aula: 4,
            hora_inicio: "15:50:00",
            hora_fim: "16:40:00",
            tipo: "AULA",
            descricao: "4ª Aula",
            ativo: true,
          },
          {
            id: 12,
            turno_id: 2,
            numero_aula: 5,
            hora_inicio: "16:40:00",
            hora_fim: "17:30:00",
            tipo: "AULA",
            descricao: "5ª Aula",
            ativo: true,
          },
        ],
      },
    ]

    setTurnos(mockTurnos)
    setSelectedTurno(mockTurnos[0])
    setIsLoading(false)
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <div>Acesso negado</div>
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "AULA":
        return "bg-blue-500"
      case "INTERVALO":
        return "bg-green-500"
      case "ALMOCO":
        return "bg-orange-500"
      case "RECREIO":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciamento de Turnos</h1>
        <p className="text-gray-600">Configure turnos e períodos de aula</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Turnos List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Turnos</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Turno
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {turnos.map((turno) => (
                  <div
                    key={turno.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTurno?.id === turno.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedTurno(turno)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{turno.nome}</h3>
                      <Badge variant={turno.ativo ? "default" : "secondary"}>{turno.ativo ? "Ativo" : "Inativo"}</Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {turno.hora_inicio} - {turno.hora_fim}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{turno.descricao}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{turno.periodos_aula.length} períodos</span>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Timeline */}
        <div className="lg:col-span-2">
          {selectedTurno && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Períodos de Aula - {selectedTurno.nome}</CardTitle>
                    <CardDescription>Visualização dos períodos configurados para este turno</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Auto-Gerar
                    </Button>
                    <Button variant="outline" size="sm">
                      Clonar
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Período
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PeriodTimeline periodos={selectedTurno.periodos_aula} />

                {/* Period Details */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Detalhes dos Períodos</h4>
                  <div className="space-y-2">
                    {selectedTurno.periodos_aula.map((periodo) => (
                      <div key={periodo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getTipoColor(periodo.tipo)}`}></div>
                          <div>
                            <span className="font-medium">{periodo.descricao}</span>
                            <div className="text-sm text-gray-600">
                              {periodo.hora_inicio} - {periodo.hora_fim}
                              {periodo.tipo === "AULA" && ` (${periodo.numero_aula}ª aula)`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{periodo.tipo}</Badge>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
