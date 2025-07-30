"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users } from "lucide-react"

interface AulaCalendario {
  id: number
  disciplina: string
  turma: string
  sala: string
  hora_inicio: string
  hora_fim: string
  dia: number
  mes: number
  ano: number
  status: "agendada" | "concluida" | "cancelada"
}

export function TeacherCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [aulas, setAulas] = useState<AulaCalendario[]>([])

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockAulas: AulaCalendario[] = [
      // Hoje
      {
        id: 1,
        disciplina: "Matemática",
        turma: "1º A",
        sala: "Sala 101",
        hora_inicio: "07:30",
        hora_fim: "08:20",
        dia: new Date().getDate(),
        mes: new Date().getMonth(),
        ano: new Date().getFullYear(),
        status: "agendada",
      },
      {
        id: 2,
        disciplina: "Álgebra",
        turma: "2º A",
        sala: "Sala 103",
        hora_inicio: "09:30",
        hora_fim: "10:20",
        dia: new Date().getDate(),
        mes: new Date().getMonth(),
        ano: new Date().getFullYear(),
        status: "agendada",
      },
      // Amanhã
      {
        id: 3,
        disciplina: "Geometria",
        turma: "3º A",
        sala: "Sala 105",
        hora_inicio: "08:20",
        hora_fim: "09:10",
        dia: new Date().getDate() + 1,
        mes: new Date().getMonth(),
        ano: new Date().getFullYear(),
        status: "agendada",
      },
      // Outros dias do mês
      {
        id: 4,
        disciplina: "Matemática",
        turma: "1º B",
        sala: "Sala 102",
        hora_inicio: "10:20",
        hora_fim: "11:10",
        dia: new Date().getDate() + 2,
        mes: new Date().getMonth(),
        ano: new Date().getFullYear(),
        status: "agendada",
      },
    ]

    setAulas(mockAulas)
  }, [])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getAulasForDate = (day: number) => {
    return aulas.filter(
      (aula) => aula.dia === day && aula.mes === currentDate.getMonth() && aula.ano === currentDate.getFullYear(),
    )
  }

  const getSelectedDateAulas = () => {
    return aulas.filter(
      (aula) =>
        aula.dia === selectedDate.getDate() &&
        aula.mes === selectedDate.getMonth() &&
        aula.ano === selectedDate.getFullYear(),
    )
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const selectDate = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    )
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const selectedDateAulas = getSelectedDateAulas()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Calendário de Aulas</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[120px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="p-2 h-12"></div>
            ))}
            {days.map((day) => {
              const dayAulas = getAulasForDate(day)
              const hasAulas = dayAulas.length > 0

              return (
                <button
                  key={day}
                  onClick={() => selectDate(day)}
                  className={`p-2 h-12 text-sm rounded-lg transition-colors relative ${
                    isToday(day)
                      ? "bg-blue-600 text-white font-bold"
                      : isSelected(day)
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : hasAulas
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "hover:bg-gray-100"
                  }`}
                >
                  {day}
                  {hasAulas && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Aulas do Dia Selecionado */}
      <Card>
        <CardHeader>
          <CardTitle>Aulas de {selectedDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}</CardTitle>
          <CardDescription>
            {selectedDateAulas.length > 0
              ? `${selectedDateAulas.length} aula${selectedDateAulas.length > 1 ? "s" : ""} programada${
                  selectedDateAulas.length > 1 ? "s" : ""
                }`
              : "Nenhuma aula programada"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDateAulas.length > 0 ? (
            <div className="space-y-3">
              {selectedDateAulas
                .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                .map((aula) => (
                  <div key={aula.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{aula.disciplina}</h4>
                      <Badge variant="outline" className="text-xs">
                        {aula.hora_inicio} - {aula.hora_fim}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{aula.turma}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{aula.sala}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma aula programada para este dia</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
