"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/animations"

export default function Login() {
  const [username, setUsername] = useState("")
  const [senha, setSenha] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await login(username, senha)
      setSuccess(true)
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (err: any) {
      setError(err?.message || "Email ou senha inválidos")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background animated elements */}
      <motion.div
        className="absolute top-10 right-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-20"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 left-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-20"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card Container */}
        <Card className="border-0 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
            <motion.div
              className="flex justify-center mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-center">Sistema Escolar</h1>
            <p className="text-indigo-100 text-center text-sm mt-2">
              Gestão de Horários e Recursos
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {success ? (
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ scale: [0.8, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                </motion.div>
                <h2 className="text-xl font-bold text-gray-900">Login Bem-sucedido!</h2>
                <p className="text-gray-600 text-sm">Redirecionando...</p>
                <LoadingSpinner />
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Alert className="border-red-200 bg-red-50 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Username Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                    Usuário
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-4 py-2.5"
                    required
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label htmlFor="senha" className="text-sm font-semibold text-gray-700">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      disabled={isLoading}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-4 py-2.5 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Demo Credentials */}
                <motion.div
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xs text-blue-700 font-medium mb-2">📝 Credenciais Demo:</p>
                  <div className="space-y-1 text-xs text-blue-600 font-mono">
                    <p>Usuário: <span className="font-semibold">admin</span></p>
                    <p>Senha: <span className="font-semibold">admin123</span></p>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading || authLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner />
                        Entrando...
                      </span>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </motion.div>
              </form>
            )}
          </div>
        </Card>

        {/* Footer */}
        <motion.div
          className="text-center mt-6 text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>© 2026 Sistema Escolar. Todos os direitos reservados.</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
