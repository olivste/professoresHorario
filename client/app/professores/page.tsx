"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit2, Trash2, Eye, Grid, List, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Modal } from "@/components/data-table"
import { StatCard, EmptyState } from "@/components/custom-cards"
import { PageTransition, StaggeredContainer } from "@/components/animations"
import { apiClient } from "@/lib/api"
import { ENDPOINTS } from "@/lib/config"

interface Professor {
  id: number
  nome: string
  email: string
  telefone?: string
  disciplinas_count?: number
  horarios_count?: number
}

export default function ProfessoresPage() {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [filtered, setFiltered] = useState<Professor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
  })

  useEffect(() => {
    fetchProfessores()
  }, [])

  useEffect(() => {
    const filtered = professores.filter((p) =>
      p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFiltered(filtered)
  }, [searchQuery, professores])

  const fetchProfessores = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.request<Professor[]>(ENDPOINTS.PROFESSORES)
      setProfessores(data)
    } catch (error) {
      console.error("Erro ao buscar professores:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.nome || !formData.email) return

    try {
      await apiClient.request(ENDPOINTS.PROFESSORES, {
        method: "POST",
        body: JSON.stringify(formData),
      })
      setFormData({ nome: "", email: "", telefone: "" })
      setShowModal(false)
      fetchProfessores()
    } catch (error) {
      console.error("Erro ao criar professor:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este professor?")) {
      try {
        await apiClient.request(`${ENDPOINTS.PROFESSORES}/${id}`, { method: "DELETE" })
        fetchProfessores()
      } catch (error) {
        console.error("Erro ao deletar professor:", error)
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
              Professores
            </h1>
            <p className="text-gray-600 mt-2">Gerencie todos os professores do sistema</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedProfessor(null)
              setFormData({ nome: "", email: "", telefone: "" })
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Novo Professor
          </motion.button>
        </div>

        {/* Stats */}
        <StaggeredContainer>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Total de Professores"
              value={professores.length}
              icon={<span>👨‍🏫</span>}
              trend={{ value: 12, isPositive: true }}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <StatCard
              label="Professores Ativos"
              value={Math.floor(professores.length * 0.9)}
              icon={<span>✅</span>}
              trend={{ value: 8, isPositive: true }}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            />
            <StatCard
              label="Média de Turmas"
              value={3.4}
              icon={<span>📚</span>}
              trend={{ value: 2.1, isPositive: true }}
              gradient="bg-gradient-to-br from-purple-500 to-fuchsia-600"
            />
          </motion.div>
        </StaggeredContainer>

        {/* Search and Filters */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>
            <div className="flex gap-2 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full"
              />
              <p className="text-gray-600">Carregando professores...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<span>👨‍🏫</span>}
            title="Nenhum professor encontrado"
            description={searchQuery ? "Tente ajustar sua busca" : "Comece adicionando um novo professor"}
            action={
              <Button onClick={() => setShowModal(true)} className="bg-blue-600 text-white">Novo Professor</Button>
            }
          />
        ) : viewMode === "grid" ? (
          <StaggeredContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((professor, index) => (
                <motion.div key={professor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="hover:shadow-lg transition-all p-6 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center font-bold">
                        {professor.nome.charAt(0)}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(professor.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 mb-2">{professor.nome}</h3>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <a href={`mailto:${professor.email}`} className="hover:text-blue-600">
                          {professor.email}
                        </a>
                      </div>
                      {professor.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-600" />
                          {professor.telefone}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{professor.disciplinas_count || 0}</p>
                        <p className="text-xs text-gray-600">Disciplinas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-600">{professor.horarios_count || 0}</p>
                        <p className="text-xs text-gray-600">Horários</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </StaggeredContainer>
        ) : (
          <StaggeredContainer>
            <div className="space-y-2">
              {filtered.map((professor, index) => (
                <motion.div
                  key={professor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                        {professor.nome.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{professor.nome}</h4>
                        <p className="text-sm text-gray-600">{professor.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{professor.disciplinas_count || 0} disciplinas</p>
                        <p className="text-xs text-gray-600">{professor.horarios_count || 0} horários</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(professor.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedProfessor ? "Editar Professor" : "Novo Professor"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
            <Input
              type="text"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefone (opcional)</label>
            <Input
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreate}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            >
              {selectedProfessor ? "Salvar Alterações" : "Criar Professor"}
            </Button>
            <Button
              onClick={() => setShowModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  )
}
