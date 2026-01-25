"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient } from "@/lib/api"
import { TOKEN_NAME } from "@/lib/config"

interface Usuario {
  id: number
  nome: string
  username: string
  email: string
  telefone?: string
  role: "DIRETOR" | "PEDAGOGO" | "COORDENADOR" | "PROFESSOR"
  ativo: boolean
}

interface AuthContextType {
  user: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem(TOKEN_NAME)
      if (!storedToken) {
        setIsLoading(false)
        return
      }
      try {
        const me = await apiClient.me()
        setUser(me as Usuario)
        setIsAuthenticated(true)
      } catch (err) {
        localStorage.removeItem(TOKEN_NAME)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    bootstrap()
  }, [])

  const login = async (username: string, senha: string) => {
    const { access_token } = await apiClient.login(username, senha)
    localStorage.setItem(TOKEN_NAME, access_token)
    const me = await apiClient.me()
    setUser(me as Usuario)
    setIsAuthenticated(true)
  }

  const logout = () => {
    apiClient.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  return <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
