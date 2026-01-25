"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Users, GraduationCap, BookOpen, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageTransition, StaggeredContainer } from "@/components/animations"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

interface Turma {
  id: number
  nome: string
  turno?: string
  ano?: string
  curso?: string
  professor_id?: number
}

export default function MinhasTurmasPage() {
  const { user } = useAuth()
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const data = await apiClient.getTurmas()
        const list = data as Turma[]
        const mine = list.filter((t) => (t.professor_id && user?.id && t.professor_id === user.id) || (user?.nome && t.nome?.toLowerCase().includes(user.nome.toLowerCase())))
        setTurmas(mine)
      } catch (err) {
        console.error("Erro ao buscar turmas:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return turmas
    return turmas.filter((t) => t.nome.toLowerCase().includes(q) || (t.curso || "").toLowerCase().includes(q) || (t.turno || "").toLowerCase().includes(q))
  }, [turmas, search])

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Minhas Turmas</h1>
            <p className="text-gray-600 mt-2">Visualize e acompanhe suas turmas</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, curso, turno"
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <Button variant="secondary" onClick={() => setSearch("")}>Limpar</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex flex-col items-center gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 border-4 border-gray-200 border-t-rose-600 rounded-full" />
              <p className="text-gray-600">Carregando turmas...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhuma turma encontrada.</p>
          </div>
        ) : (
          <StaggeredContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((t, idx) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <Users className="h-4 w-4 text-rose-600" /> {t.nome}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div><GraduationCap className="inline h-4 w-4 mr-1 text-rose-600" /> Curso: <span className="font-semibold text-gray-900">{t.curso || "-"}</span></div>
                      <div><Calendar className="inline h-4 w-4 mr-1 text-rose-600" /> Ano: <span className="font-semibold text-gray-900">{t.ano || "-"}</span></div>
                      <div><BookOpen className="inline h-4 w-4 mr-1 text-rose-600" /> Turno: <span className="font-semibold text-gray-900">{t.turno || "-"}</span></div>
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
