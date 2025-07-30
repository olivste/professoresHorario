"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Usuario {
  id: number
  nome: string
  email: string
  role: "DIRETOR" | "PEDAGOGO" | "COORDENADOR" | "PROFESSOR"
  ativo: boolean
}

interface AuthContextType {
  user: Usuario | null
  isAuthenticated: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email: string, senha: string) => {
    // Mock authentication - replace with actual API call
    const mockUsers = [
      { id: 1, nome: "João Diretor", email: "diretor@escola.com", role: "DIRETOR" as const, ativo: true },
      { id: 2, nome: "Maria Coordenadora", email: "coord@escola.com", role: "COORDENADOR" as const, ativo: true },
      { id: 3, nome: "Pedro Professor", email: "prof@escola.com", role: "PROFESSOR" as const, ativo: true },
    ]

    const foundUser = mockUsers.find((u) => u.email === email)

    if (foundUser && senha === "senha123") {
      const mockToken = "mock-jwt-token"

      setUser(foundUser)
      setIsAuthenticated(true)

      localStorage.setItem("user", JSON.stringify(foundUser))
      localStorage.setItem("token", mockToken)
    } else {
      throw new Error("Invalid credentials")
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  return <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
