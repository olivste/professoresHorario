'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  nome: string
  username: string
  email: string
  role: 'ADMIN' | 'PROFESSOR' | 'COORDENADOR'
  telefone?: string
  ativo: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, senha: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    let parsedUser: User | null = null
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser)
      } catch {
        // Invalid cached user (e.g., "undefined"); clear it
        localStorage.removeItem('auth_user')
      }
    }

    if (storedToken) {
      setToken(storedToken)
    }
    if (parsedUser) {
      setUser(parsedUser)
      setIsLoading(false)
    } else if (storedToken) {
      // Rehydrate user from API if we have a token but no valid user
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Falha ao obter usuário')
          const me = await res.json()
          localStorage.setItem('auth_user', JSON.stringify(me))
          setUser(me)
        })
        .catch(() => {
          // If it fails, clear token to avoid loops
          localStorage.removeItem('auth_token')
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (username: string, senha: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, senha }),
      })

      if (!response.ok) {
        throw new Error('Credenciais inválidas')
      }

      const data = await response.json()
      const tokenValue: string = data.access_token

      // Persist token
      localStorage.setItem('auth_token', tokenValue)
      setToken(tokenValue)

      // Fetch current user using the token
      const meRes = await fetch(`${baseUrl}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenValue}`,
        },
      })
      if (!meRes.ok) {
        throw new Error('Falha ao obter usuário')
      }
      const me = await meRes.json()
      localStorage.setItem('auth_user', JSON.stringify(me))
      setUser(me)

      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
