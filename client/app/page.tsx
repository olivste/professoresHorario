import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StatCard, FeatureCard } from "@/components/custom-cards"
import { Clock, Users, Calendar, BookOpen, MapPin, Lock, ArrowRight, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">Sistema Escolar 2.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Gestão Inteligente de
              <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                Horários e Recursos
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Organize turnos, professores, disciplinas e reservas de espaços em um único lugar moderno e intuitivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
              >
                <Link href="/login">
                  Começar Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link href="/horarios">Explorar Horários</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 -mt-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total de Turnos"
            value="—"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            icon="⏰"
          />
          <StatCard
            label="Horários Agendados"
            value="—"
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            icon="📅"
          />
          <StatCard
            label="Espaços Disponíveis"
            value="—"
            gradient="bg-gradient-to-br from-green-500 to-green-600"
            icon="🏠"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Funcionalidades Principais
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Todas as ferramentas que sua escola precisa para gerenciar educação de forma eficiente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Clock className="w-6 h-6 text-blue-600" />}
            title="Gerenciamento de Turnos"
            description="Configure turnos, períodos de aula e intervalos com facilidade"
            action={
              <Link href="/turnos">
                <Button variant="outline" size="sm" className="w-full">
                  Acessar Turnos
                </Button>
              </Link>
            }
          />

          <FeatureCard
            icon={<Calendar className="w-6 h-6 text-purple-600" />}
            title="Horários de Aula"
            description="Visualize e organize aulas em múltiplas visualizações"
            action={
              <Link href="/horarios">
                <Button variant="outline" size="sm" className="w-full">
                  Acessar Horários
                </Button>
              </Link>
            }
          />

          <FeatureCard
            icon={<Users className="w-6 h-6 text-green-600" />}
            title="Professores e Disciplinas"
            description="Gerencie docentes e disciplinas do seu sistema"
            isDisabled={true}
          />

          <FeatureCard
            icon={<BookOpen className="w-6 h-6 text-orange-600" />}
            title="Turmas"
            description="Organize turmas por ano, série e turno"
            isDisabled={true}
          />

          <FeatureCard
            icon={<MapPin className="w-6 h-6 text-pink-600" />}
            title="Gerenciamento de Espaços"
            description="Reserve e organize salas, auditórios e outros ambientes"
            isDisabled={true}
          />

          <FeatureCard
            icon={<Lock className="w-6 h-6 text-red-600" />}
            title="Painel de Controle"
            description="Administre usuários, permissões e configurações"
            action={
              <Link href="/admin">
                <Button variant="outline" size="sm" className="w-full">
                  Acessar Admin
                </Button>
              </Link>
            }
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 p-8 md:p-12 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Pronto para começar?</h3>
              <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
                Faça login com suas credenciais e explore todas as funcionalidades do nosso sistema de gestão escolar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-indigo-50"
                >
                  <Link href="/login">Entrar Agora</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600 text-sm">
          <p>© 2026 Sistema Escolar. Todos os direitos reservados.</p>
          <p className="mt-2">Desenvolvido com ❤️ para educadores</p>
        </div>
      </footer>
    </div>
  )
}
