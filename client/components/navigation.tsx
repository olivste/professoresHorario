"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { GraduationCap, Home, Users, Clock, Calendar, BookOpen, Settings, LogOut, Menu, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const getNavigationItems = (userRole: string) => {
  const baseItems = [{ name: "Dashboard", href: "/", icon: Home }]

  if (userRole === "PROFESSOR") {
    return [
      ...baseItems,
      { name: "Meus Horários", href: "/meus-horarios", icon: Calendar },
      { name: "Minhas Turmas", href: "/minhas-turmas", icon: Users },
      { name: "Disciplinas", href: "/disciplinas", icon: BookOpen },
    ]
  }

  // Para DIRETOR, PEDAGOGO, COORDENADOR
  return [
    ...baseItems,
    { name: "Usuários", href: "/usuarios", icon: Users, roles: ["DIRETOR", "PEDAGOGO"] },
    { name: "Professores", href: "/professores", icon: GraduationCap },
    { name: "Turnos", href: "/turnos", icon: Clock },
    { name: "Turmas", href: "/turmas", icon: Users },
    { name: "Disciplinas", href: "/disciplinas", icon: BookOpen },
    { name: "Horários", href: "/horarios", icon: Calendar },
    { name: "Configurações", href: "/configuracoes", icon: Settings, roles: ["DIRETOR"] },
  ]
}

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const navigationItems = getNavigationItems(user?.role || "")

  if (!isAuthenticated || pathname === "/login") {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const NavigationContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center space-x-2 p-4 border-b">
        <GraduationCap className="h-8 w-8 text-blue-600" />
        <span className="font-bold text-lg">Sistema Escolar</span>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-sm">{user?.nome}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:z-50">
        <NavigationContent />
      </div>

      {/* Mobile Navigation Header */}
      <div className="lg:hidden bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span className="font-bold">Sistema Escolar</span>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavigationContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
