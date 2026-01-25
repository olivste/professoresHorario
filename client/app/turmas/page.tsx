"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit2, Trash2, Eye, Grid, List, Users, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Modal } from "@/components/data-table"
import { StatCard, EmptyState } from "@/components/custom-cards"
import { PageTransition, StaggeredContainer } from "@/components/animations"
import { apiClient } from "@/lib/api"
import { ENDPOINTS } from "@/lib/config"

interface Turma {
  id: number
  nome: string
  descricao?: string
  quantidade_alunos: number
  disciplinas_count?: number
  horarios_count?: number
}

const TURMA_COLORS = [
  "from-blue-400 to-cyan-600",
  "from-green-400 to-emerald-600",
  "from-orange-400 to-red-600",
  "from-indigo-400 to-blue-600",
  "from-fuchsia-400 to-purple-600",
  "from-sky-400 to-blue-600",
]

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [filtered, setFiltered] = useState<Turma[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    quantidade_alunos: 0,
  })

  useEffect(() => {
    fetchTurmas()
  }, [])

  useEffect(() => {
    const filtered = turmas.filter((t) =>
      t.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFiltered(filtered)
  }, [searchQuery, turmas])

  const fetchTurmas = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.request<Turma[]>(ENDPOINTS.TURMAS)
      setTurmas(data)
    } catch (error) {
      console.error("Erro ao buscar turmas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.nome) return

    try {
      await apiClient.request(ENDPOINTS.TURMAS, {
        method: "POST",
        body: JSON.stringify(formData),
      })
      setFormData({ nome: "", descricao: "", quantidade_alunos: 0 })
      setShowModal(false)
      fetchTurmas()
    } catch (error) {
      console.error("Erro ao criar turma:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta turma?")) {
      try {
        await apiClient.request(`${ENDPOINTS.TURMAS}/${id}`, { method: "DELETE" })
        fetchTurmas()
      } catch (error) {
        console.error("Erro ao deletar turma:", error)
      }
    }
  }

  const getColorClass = (index: number) => TURMA_COLORS[index % TURMA_COLORS.length]

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Turmas
            </h1>
            <p className="text-gray-600 mt-2">Gerencie todas as turmas e suas informações</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setFormData({ nome: "", descricao: "", quantidade_alunos: 0 })
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Nova Turma
          </motion.button>
        </div>

        {/* Stats */}
        <StaggeredContainer>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Total de Turmas"
              value={turmas.length}
              icon={<span>👥</span>}
              trend={{ value: 5, isPositive: true }}
              gradient="bg-gradient-to-br from-green-500 to-emerald-600"
            />
            <StatCard
              label="Total de Alunos"
              value={turmas.reduce((acc, t) => acc + t.quantidade_alunos, 0)}
              icon={<span>📊</span>}
              trend={{ value: 10, isPositive: true }}
              gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
            />
            <StatCard
              label="Alunos/Turma"
              value={turmas.length > 0 ? (turmas.reduce((acc, t) => acc + t.quantidade_alunos, 0) / turmas.length).toFixed(1) : 0}
              icon={<span>📈</span>}
              trend={{ value: 3, isPositive: true }}
              gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
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
                placeholder="Buscar por nome ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
              />
            </div>
            <div className="flex gap-2 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all ${
                  viewMode === "list"
                    ? "bg-white text-green-600 shadow-sm"
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
                className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full"
              />
              <p className="text-gray-600">Carregando turmas...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<span>👥</span>}
            title="Nenhuma turma encontrada"
            description={searchQuery ? "Tente ajustar sua busca" : "Comece adicionando uma nova turma"}
            action={<Button onClick={() => setShowModal(true)} className="bg-green-600 text-white">Nova Turma</Button>}
          />
        ) : viewMode === "grid" ? (
          <StaggeredContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((turma, index) => (
                <motion.div key={turma.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="hover:shadow-lg transition-all overflow-hidden group">
                    <div className={`h-32 bg-gradient-to-br ${getColorClass(index)} relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-10">
                        <Users className="h-full w-full" />
                      </div>
                      <div className="relative h-full flex items-end p-4">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                          <button className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-md">
                            <Edit2 className="h-4 w-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(turma.id)}
                            className="p-2 bg-white hover:bg-red-100 rounded-lg transition-colors shadow-md"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{turma.nome}</h3>
                      {turma.descricao && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{turma.descricao}</p>
                      )}

                      <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-900">{turma.quantidade_alunos}</span>
                        <span className="text-xs text-gray-600">alunos</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{turma.disciplinas_count || 0}</p>
                          <p className="text-xs text-gray-600">Disciplinas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-600">{turma.horarios_count || 0}</p>
                          <p className="text-xs text-gray-600">Horários</p>
                        </div>
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
              {filtered.map((turma, index) => (
                <motion.div
                  key={turma.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getColorClass(index)} text-white flex items-center justify-center text-xl`}>
                        👥
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{turma.nome}</h4>
                        {turma.descricao && (
                          <p className="text-sm text-gray-600">{turma.descricao}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-right">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">{turma.quantidade_alunos} alunos</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{turma.disciplinas_count || 0} disciplinas</p>
                        <p className="text-xs text-gray-600">{turma.horarios_count || 0} horários</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(turma.id)}
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Turma">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Turma</label>
            <Input
              type="text"
              placeholder="Ex: 3° Ano A"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <Input
              type="text"
              placeholder="Ex: Turma do 3° ano do ensino médio"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade de Alunos</label>
            <Input
              type="number"
              placeholder="30"
              value={formData.quantidade_alunos}
              onChange={(e) => setFormData({ ...formData, quantidade_alunos: parseInt(e.target.value) })}
              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreate}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
            >
              Criar Turma
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
