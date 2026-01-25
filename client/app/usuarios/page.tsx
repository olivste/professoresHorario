"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit2, Trash2, Grid, List, User, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Modal } from "@/components/data-table"
import { StatCard, EmptyState } from "@/components/custom-cards"
import { PageTransition, StaggeredContainer } from "@/components/animations"
import { apiClient } from "@/lib/api"

interface Usuario {
  id: number
  nome: string
  username: string
  email: string
  telefone?: string
  role: "DIRETOR" | "PEDAGOGO" | "COORDENADOR" | "PROFESSOR"
  ativo: boolean
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filtered, setFiltered] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<Partial<Usuario>>({
    nome: "",
    username: "",
    email: "",
    telefone: "",
    role: "PROFESSOR",
    ativo: true,
  })

  useEffect(() => {
    fetchUsuarios()
  }, [])

  useEffect(() => {
    const q = searchQuery.toLowerCase()
    setFiltered(
      usuarios.filter((u) =>
        [u.nome, u.username, u.email].some((f) => f.toLowerCase().includes(q))
      )
    )
  }, [searchQuery, usuarios])

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.getUsuarios()
      setUsuarios(data as Usuario[])
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.nome || !formData.username || !formData.email) return
    try {
      await apiClient.createUsuario(formData)
      setShowModal(false)
      setFormData({ nome: "", username: "", email: "", telefone: "", role: "PROFESSOR", ativo: true })
      fetchUsuarios()
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      try {
        await apiClient.deleteUsuario(id)
        fetchUsuarios()
      } catch (error) {
        console.error("Erro ao deletar usuário:", error)
      }
    }
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Usuários
            </h1>
            <p className="text-gray-600 mt-2">Gerencie contas e permissões</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Novo Usuário
          </motion.button>
        </div>

        {/* Stats */}
        <StaggeredContainer>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Total"
              value={usuarios.length}
              icon={<span>👤</span>}
              trend={{ value: 5, isPositive: true }}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <StatCard
              label="Ativos"
              value={usuarios.filter((u) => u.ativo).length}
              icon={<span>✅</span>}
              trend={{ value: 3, isPositive: true }}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            />
            <StatCard
              label="Professores"
              value={usuarios.filter((u) => u.role === "PROFESSOR").length}
              icon={<span>🎓</span>}
              trend={{ value: 2, isPositive: true }}
              gradient="bg-gradient-to-br from-purple-500 to-fuchsia-600"
            />
          </motion.div>
        </StaggeredContainer>

        {/* Search and view mode */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nome, usuário ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
          </div>
          <div className="flex gap-2 bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex flex-col items-center gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full" />
              <p className="text-gray-600">Carregando usuários...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<span>👤</span>}
            title="Nenhum usuário encontrado"
            description={searchQuery ? "Tente ajustar sua busca" : "Comece adicionando um novo usuário"}
            action={<Button onClick={() => setShowModal(true)} className="bg-blue-600 text-white">Novo Usuário</Button>}
          />
        ) : viewMode === "grid" ? (
          <StaggeredContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((u, index) => (
                <motion.div key={u.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="p-6 hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center font-bold">
                        {u.nome.charAt(0)}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg"><Edit2 className="h-4 w-4 text-blue-600" /></button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-600" /></button>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{u.nome}</h3>
                    <p className="text-sm text-gray-600 mb-3">@{u.username}</p>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600" />{u.email}</div>
                      {u.telefone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-green-600" />{u.telefone}</div>}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{u.ativo ? "Ativo" : "Inativo"}</span>
                      <span className="text-xs font-semibold text-blue-600">{u.role}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </StaggeredContainer>
        ) : (
          <StaggeredContainer>
            <div className="space-y-2">
              {filtered.map((u, index) => (
                <motion.div key={u.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="p-4 hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">{u.nome.charAt(0)}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{u.nome}</h4>
                        <p className="text-sm text-gray-600">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{u.ativo ? "Ativo" : "Inativo"}</span>
                      <span className="text-xs font-semibold text-blue-600">{u.role}</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg"><Edit2 className="h-4 w-4 text-blue-600" /></button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-600" /></button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </StaggeredContainer>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Usuário">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
            <Input type="text" value={formData.nome || ""} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
              <Input type="text" value={formData.username || ""} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone (opcional)</label>
              <Input type="tel" value={formData.telefone || ""} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Perfil</label>
              <select value={formData.role || "PROFESSOR"} onChange={(e) => setFormData({ ...formData, role: e.target.value as Usuario["role"] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500">
                <option value="PROFESSOR">Professor</option>
                <option value="COORDENADOR">Coordenador</option>
                <option value="PEDAGOGO">Pedagogo</option>
                <option value="DIRETOR">Diretor</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input id="ativo" type="checkbox" checked={!!formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} />
            <label htmlFor="ativo" className="text-sm text-gray-700">Usuário ativo</label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleCreate} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">Criar Usuário</Button>
            <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1">Cancelar</Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  )
}
