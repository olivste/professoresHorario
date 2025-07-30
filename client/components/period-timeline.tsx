"use client"

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

interface PeriodTimelineProps {
  periodos: PeriodoAula[]
}

export function PeriodTimeline({ periodos }: PeriodTimelineProps) {
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

  const getTipoTextColor = (tipo: string) => {
    switch (tipo) {
      case "AULA":
        return "text-blue-700"
      case "INTERVALO":
        return "text-green-700"
      case "ALMOCO":
        return "text-orange-700"
      case "RECREIO":
        return "text-purple-700"
      default:
        return "text-gray-700"
    }
  }

  const getTipoBgColor = (tipo: string) => {
    switch (tipo) {
      case "AULA":
        return "bg-blue-50"
      case "INTERVALO":
        return "bg-green-50"
      case "ALMOCO":
        return "bg-orange-50"
      case "RECREIO":
        return "bg-purple-50"
      default:
        return "bg-gray-50"
    }
  }

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5)
  }

  const sortedPeriodos = [...periodos].sort((a, b) => parseTime(a.hora_inicio) - parseTime(b.hora_inicio))

  const firstTime = sortedPeriodos.length > 0 ? parseTime(sortedPeriodos[0].hora_inicio) : 0
  const lastTime = sortedPeriodos.length > 0 ? parseTime(sortedPeriodos[sortedPeriodos.length - 1].hora_fim) : 0
  const totalDuration = lastTime - firstTime

  const getPosition = (timeStr: string) => {
    const time = parseTime(timeStr)
    return ((time - firstTime) / totalDuration) * 100
  }

  const getDuration = (inicio: string, fim: string) => {
    const startTime = parseTime(inicio)
    const endTime = parseTime(fim)
    return ((endTime - startTime) / totalDuration) * 100
  }

  return (
    <div className="relative">
      {/* Timeline container */}
      <div className="relative h-20 bg-gray-100 rounded-lg overflow-hidden">
        {sortedPeriodos.map((periodo) => {
          const left = getPosition(periodo.hora_inicio)
          const width = getDuration(periodo.hora_inicio, periodo.hora_fim)

          return (
            <div
              key={periodo.id}
              className={`absolute top-2 bottom-2 ${getTipoColor(periodo.tipo)} rounded flex items-center justify-center text-white text-xs font-medium shadow-sm`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
              }}
              title={`${periodo.descricao} (${formatTime(periodo.hora_inicio)} - ${formatTime(periodo.hora_fim)})`}
            >
              <span className="truncate px-1">
                {periodo.tipo === "AULA" ? `${periodo.numero_aula}ª` : periodo.tipo}
              </span>
            </div>
          )
        })}
      </div>

      {/* Time markers */}
      <div className="relative mt-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatTime(sortedPeriodos[0]?.hora_inicio || "00:00:00")}</span>
          <span>{formatTime(sortedPeriodos[sortedPeriodos.length - 1]?.hora_fim || "00:00:00")}</span>
        </div>
      </div>

      {/* Period details below timeline */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {sortedPeriodos.map((periodo) => (
          <div key={periodo.id} className={`p-2 rounded-lg border ${getTipoBgColor(periodo.tipo)}`}>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getTipoColor(periodo.tipo)}`}></div>
              <span className={`text-sm font-medium ${getTipoTextColor(periodo.tipo)}`}>{periodo.descricao}</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {formatTime(periodo.hora_inicio)} - {formatTime(periodo.hora_fim)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
