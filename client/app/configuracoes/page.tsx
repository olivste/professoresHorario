"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageTransition } from "@/components/animations"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"

interface UsuarioUpdate {
  nome?: string
  email?: string
  senha?: string
}

export default function ConfiguracoesPage() {
  const { user, logout } = useAuth()
  const [form, setForm] = useState<UsuarioUpdate>({ nome: user?.nome || "", email: user?.email || "" })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setForm({ nome: user?.nome || "", email: user?.email || "" })
  }, [user])

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)
      if (!user?.id) throw new Error("Usuário não encontrado")
      await apiClient.updateUsuario(user.id, form)
      setMessage("Configurações salvas com sucesso!")
    } catch (err: any) {
      setMessage(err?.message || "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Configurações</h1>
          <p className="text-gray-600 mt-2">Atualize suas informações e preferências</p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <Input value={form.nome || ""} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email || ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Label>Nova Senha</Label>
              <Input type="password" placeholder="••••••••" onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            <Button variant="secondary" onClick={() => logout()}>Sair da conta</Button>
          </div>

          {message && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-700">
              {message}
            </motion.div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Aparência</h2>
              <p className="text-sm text-gray-600">Tema do aplicativo</p>
            </div>
            {/* Placeholder for future dark mode toggle */}
            <Button variant="secondary" disabled>Em breve</Button>
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}
