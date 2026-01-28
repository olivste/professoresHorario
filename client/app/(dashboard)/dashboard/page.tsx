'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { GraduationCap, BookOpen, Clock, MapPin, Users, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardStats {
  professores: number
  disciplinas: number
  turnos: number
  espacos: number
  usuarios: number
  horarios: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    professores: 0,
    disciplinas: 0,
    turnos: 0,
    espacos: 0,
    usuarios: 0,
    horarios: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [professores, disciplinas, turnos, espacos, usuarios, horarios] = await Promise.all([
          apiClient.get<any[]>('/professores/?limit=1000').catch(() => []),
          apiClient.get<any[]>('/disciplinas/?limit=1000').catch(() => []),
          apiClient.get<any[]>('/turnos/?limit=1000').catch(() => []),
          apiClient.get<any[]>('/espacos/?limit=1000').catch(() => []),
          apiClient.get<any[]>('/usuarios/?limit=1000').catch(() => []),
          apiClient.get<any[]>('/horarios/?limit=1000').catch(() => []),
        ])

        setStats({
          professores: professores.length,
          disciplinas: disciplinas.length,
          turnos: turnos.length,
          espacos: espacos.length,
          usuarios: usuarios.length,
          horarios: horarios.length,
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const statCards = [
    {
      title: 'Professores',
      value: stats.professores,
      icon: GraduationCap,
      description: 'Professores cadastrados',
      color: 'text-purple-500',
    },
    {
      title: 'Disciplinas',
      value: stats.disciplinas,
      icon: BookOpen,
      description: 'Disciplinas ativas',
      color: 'text-blue-500',
    },
    {
      title: 'Usuários',
      value: stats.usuarios,
      icon: Users,
      description: 'Usuários do sistema',
      color: 'text-green-500',
    },
    {
      title: 'Turnos',
      value: stats.turnos,
      icon: Clock,
      description: 'Turnos configurados',
      color: 'text-orange-500',
    },
    {
      title: 'Horários',
      value: stats.horarios,
      icon: Calendar,
      description: 'Horários de aula',
      color: 'text-pink-500',
    },
    {
      title: 'Espaços',
      value: stats.espacos,
      icon: MapPin,
      description: 'Espaços disponíveis',
      color: 'text-teal-500',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          {'Visão geral do sistema de gestão escolar'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao Sistema</CardTitle>
            <CardDescription>
              {'Sistema completo de gestão escolar'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {'Este sistema permite gerenciar todos os aspectos da sua instituição educacional:'}
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>{'Cadastro de professores e usuários'}</li>
              <li>{'Gerenciamento de disciplinas e turmas'}</li>
              <li>{'Configuração de turnos e horários'}</li>
              <li>{'Controle de espaços e reservas'}</li>
              <li>{'Vínculos entre professores e disciplinas'}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>
              {'Navegue pelas principais funcionalidades'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {'Use o menu lateral para acessar:'}
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>{'Gestão: Professores, Usuários, Disciplinas, Turmas'}</li>
              <li>{'Horários: Turnos, Períodos de Aula, Grade Horária'}</li>
              <li>{'Instalações: Espaços, Reservas, Vínculos'}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
