"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, MapPin, Clock, TrendingUp, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"

interface Stats {
  professores: number
  disciplinas: number
  turmas: number
  turnos: number
  horarios: number
  reservas: number
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const [stats, setStats] = useState<Stats>({
    professores: 0,
    disciplinas: 0,
    turmas: 0,
    turnos: 0,
    horarios: 0,
    reservas: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace("/login")
      return
    }

    const loadStats = async () => {
      try {
        const [prof, disc, turm, turn, hor, res] = await Promise.all([
          apiClient.getProfessores(),
          apiClient.getDisciplinas(),
          apiClient.getTurmas(),
          apiClient.getTurnos(),
          apiClient.getHorarios(),
          apiClient.getReservas(),
        ])

        setStats({
          professores: (prof as any[]).length,
          disciplinas: (disc as any[]).length,
          turmas: (turm as any[]).length,
          turnos: (turn as any[]).length,
          horarios: (hor as any[]).length,
          reservas: (res as any[]).length,
        })
      } catch (err) {
        console.error("Erro ao carregar stats:", err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [isLoading, isAuthenticated, router])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const statCards = [
    { icon: Users, label: "Professores", value: stats.professores, color: "from-blue-500 to-blue-600", href: "#" },
    { icon: BookOpen, label: "Disciplinas", value: stats.disciplinas, color: "from-green-500 to-green-600", href: "#" },
    { icon: Users, label: "Turmas", value: stats.turmas, color: "from-purple-500 to-purple-600", href: "#" },
    { icon: Clock, label: "Turnos", value: stats.turnos, color: "from-orange-500 to-orange-600", href: "/turnos" },
    { icon: TrendingUp, label: "Horários", value: stats.horarios, color: "from-pink-500 to-pink-600", href: "/horarios" },
    { icon: MapPin, label: "Reservas", value: stats.reservas, color: "from-indigo-500 to-indigo-600", href: "#" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Painel de Administração</h1>
              <p className="text-red-100 mt-1">Bem-vindo de volta, {user?.nome}!</p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-white text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Estatísticas Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, idx) => {
              const Icon = card.icon
              return (
                <button
                  key={idx}
                  onClick={() => card.href !== "#" && router.push(card.href)}
                  className={`text-left transition-all ${card.href === "#" ? "cursor-default" : "hover:scale-105 cursor-pointer"}`}
                  disabled={card.href === "#"}
                >
                  <Card className={`border-0 shadow-sm overflow-hidden h-full ${card.href !== "#" ? "hover:shadow-lg" : ""}`}>
                    <div className={`bg-gradient-to-br ${card.color} p-4 text-white flex items-center justify-between`}>
                      <div>
                        <p className="text-sm opacity-90">{card.label}</p>
                        <p className="text-3xl font-bold mt-1">{card.value}</p>
                      </div>
                      <Icon className="w-12 h-12 opacity-20" />
                    </div>
                  </Card>
                </button>
              )
            })}
          </div>
        </div>

        {/* Management Sections */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Gerenciamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Turnos e Períodos</h3>
              <p className="text-gray-600 text-sm mb-4">Configure os turnos de aula e seus períodos</p>
              <Button
                onClick={() => router.push("/turnos")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Gerenciar Turnos
              </Button>
            </Card>

            <Card className="border-0 shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Horários</h3>
              <p className="text-gray-600 text-sm mb-4">Organize aulas, professores e turmas</p>
              <Button
                onClick={() => router.push("/horarios")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                Gerenciar Horários
              </Button>
            </Card>

            <Card className="border-0 shadow-sm p-6 hover:shadow-lg transition-shadow opacity-50">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Professores</h3>
              <p className="text-gray-600 text-sm mb-4">Cadastre e gerencie docentes</p>
              <Button
                disabled
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                Em breve
              </Button>
            </Card>

            <Card className="border-0 shadow-sm p-6 hover:shadow-lg transition-shadow opacity-50">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reservas</h3>
              <p className="text-gray-600 text-sm mb-4">Gerencie reservas de espaços</p>
              <Button
                disabled
                className="bg-orange-600 hover:bg-orange-700 text-white"
                size="sm"
              >
                Em breve
              </Button>
            </Card>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex gap-3">
            <Settings className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Dicas de Uso</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Configure os turnos antes de criar horários</li>
                <li>• Certifique-se de ter professores e turmas cadastrados</li>
                <li>• Use a visualização em grade para melhor compreensão da semana</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
