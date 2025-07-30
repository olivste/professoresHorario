"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

interface ScheduleGridProps {
  horarios: Horario[]
}

const diasSemana = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
const diasLabels = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

const horariosPadrao = ["07:30 - 08:20", "08:20 - 09:10", "09:30 - 10:20", "10:20 - 11:10", "11:10 - 12:00"]

export function ScheduleGrid({ horarios }: ScheduleGridProps) {
  const getHorarioForSlot = (dia: string, horarioIndex: number) => {
    return horarios.find(
      (h) => h.dia_semana === dia && h.hora_inicio === horariosPadrao[horarioIndex]?.split(" - ")[0] + ":00",
    )
  }

  const getDisciplinaColor = (disciplina: string) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-red-100 text-red-800",
      "bg-yellow-100 text-yellow-800",
    ]
    const hash = disciplina.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[800px]">
            {/* Header */}
            <div className="font-semibold text-center p-2">Horário</div>
            {diasLabels.map((dia) => (
              <div key={dia} className="font-semibold text-center p-2">
                {dia}
              </div>
            ))}

            {/* Time slots */}
            {horariosPadrao.map((horario, index) => (
              <div key={index} className="contents">
                <div className="text-sm text-center p-2 bg-gray-50 rounded font-medium">{horario}</div>
                {diasSemana.map((dia) => {
                  const horarioData = getHorarioForSlot(dia, index)
                  return (
                    <div key={`${dia}-${index}`} className="p-1">
                      {horarioData ? (
                        <div className={`p-2 rounded-lg text-xs ${getDisciplinaColor(horarioData.disciplina.nome)}`}>
                          <div className="font-medium">{horarioData.disciplina.nome}</div>
                          <div className="text-xs opacity-75">{horarioData.professor.usuario.nome}</div>
                          <div className="text-xs opacity-75">{horarioData.turma.nome}</div>
                          {horarioData.sala && <div className="text-xs opacity-75">{horarioData.sala}</div>}
                        </div>
                      ) : (
                        <div className="p-2 h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                          Livre
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium mb-2">Legenda:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Matemática
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Português
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              História
            </Badge>
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              Geografia
            </Badge>
            <Badge variant="outline" className="bg-red-100 text-red-800">
              Ciências
            </Badge>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Educação Física
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
