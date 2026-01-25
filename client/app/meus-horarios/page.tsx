"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, BookOpen } from "lucide-react"
import { Card } from "@/components/ui/card"
import { PageTransition, StaggeredContainer } from "@/components/animations"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

interface Horario {
  id: number
  data?: string
  dia?: string
  hora_inicio?: string
  hora_fim?: string
  professor_id?: number
  professor_nome?: string
  turma_nome?: string
  disciplina_nome?: string
  espaco_nome?: string
}

function formatDate(date?: string) {
  if (!date) return ""
  try { return new Date(date).toLocaleDateString("pt-BR") } catch { return date }
}

export default function MeusHorariosPage() {
  const { user } = useAuth()
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const data = await apiClient.getHorarios()
        const list = data as Horario[]
        const mine = list.filter((h) => (h.professor_id && user?.id && h.professor_id === user.id) || (h.professor_nome && user?.nome && h.professor_nome.includes(user.nome)))
        setHorarios(mine)
      } catch (err) {
        console.error("Erro ao buscar horários:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user])

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Meus Horários</h1>
          <p className="text-gray-600 mt-2">Acompanhe suas aulas e compromissos</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex flex-col items-center gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full" />
              <p className="text-gray-600">Carregando horários...</p>
            </div>
          </div>
        ) : horarios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum horário encontrado para seu perfil.</p>
          </div>
        ) : (
          <StaggeredContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {horarios.map((h, idx) => (
                <motion.div key={h.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 text-purple-600" /> {h.dia || formatDate(h.data)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <Clock className="h-4 w-4 text-purple-600" /> {h.hora_inicio} - {h.hora_fim}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                      <BookOpen className="h-4 w-4 text-purple-600" /> {h.disciplina_nome || "Disciplina"}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Turma: <span className="font-semibold text-gray-900">{h.turma_nome || "-"}</span></div>
                      <div>Espaço: <span className="font-semibold text-gray-900">{h.espaco_nome || "-"}</span></div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </StaggeredContainer>
        )}
      </div>
    </PageTransition>
  )
}
