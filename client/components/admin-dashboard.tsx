"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, GraduationCap, Clock, Calendar, BookOpen, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalProfessores: 0,
    totalTurmas: 0,
    totalDisciplinas: 0,
    totalHorarios: 0,
  })

  useEffect(() => {
    // Simulated stats - in real app, fetch from API
    setStats({
      totalProfessores: 25,
      totalTurmas: 12,
      totalDisciplinas: 18,
      totalHorarios: 156,
    })
  }, [])

  const quickActions = [
    {
      title: "Gerenciar Usuários",
      description: "Cadastrar e editar usuários do sistema",
      icon: Users,
      href: "/usuarios",
      color: "bg-blue-500",
      roles: ["DIRETOR", "PEDAGOGO"],
    },
    {
      title: "Professores",
      description: "Gerenciar professores e suas informações",
      icon: GraduationCap,
      href: "/professores",
      color: "bg-green-500",
    },
    {
      title: "Turnos e Períodos",
      description: "Configurar turnos e períodos de aula",
      icon: Clock,
      href: "/turnos",
      color: "bg-purple-500",
    },
    {
      title: "Horários",
      description: "Visualizar e gerenciar horários",
      icon: Calendar,
      href: "/horarios",
      color: "bg-orange-500",
    },
    {
      title: "Disciplinas",
      description: "Cadastrar e editar disciplinas",
      icon: BookOpen,
      href: "/disciplinas",
      color: "bg-red-500",
    },
    {
      title: "Configurações",
      description: "Configurações do sistema",
      icon: Settings,
      href: "/configuracoes",
      color: "bg-gray-500",
      roles: ["DIRETOR"],
    },
  ]

  const filteredActions = quickActions.filter((action) => !action.roles || action.roles.includes(user?.role || ""))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo, {user?.nome}!</h1>
        <p className="text-gray-600">Sistema de Gerenciamento de Horários Escolares</p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professores</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfessores}</div>
            <p className="text-xs text-muted-foreground">Total de professores cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turmas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTurmas}</div>
            <p className="text-xs text-muted-foreground">Turmas ativas no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDisciplinas}</div>
            <p className="text-xs text-muted-foreground">Disciplinas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horários</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHorarios}</div>
            <p className="text-xs text-muted-foreground">Horários programados</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActions.map((action) => {
            const Icon = action.icon
            return (
              <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => router.push(action.href)}>
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>Últimas ações realizadas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Novo professor cadastrado</p>
                <p className="text-xs text-gray-500">Prof. João Silva - há 2 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Horário atualizado</p>
                <p className="text-xs text-gray-500">Turma 1º A - Matemática - há 4 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Períodos de aula gerados</p>
                <p className="text-xs text-gray-500">Turno Matutino - há 1 dia</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
