"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit2, Trash2, Eye, Grid, List, BookOpen, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Modal } from "@/components/data-table"
import { StatCard, EmptyState } from "@/components/custom-cards"
import { PageTransition, StaggeredContainer } from "@/components/animations"
import { apiClient } from "@/lib/api"
import { ENDPOINTS } from "@/lib/config"

interface Disciplina {
  id: number
  nome: string
  codigo: string
  carga_horaria: number
  professores_count?: number
  turmas_count?: number
}

const DISCIPLINA_COLORS = [
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-pink-400 to-pink-600",
  "from-green-400 to-green-600",
  "from-yellow-400 to-yellow-600",
  "from-indigo-400 to-indigo-600",
]

export default function DisciplinasPage() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [filtered, setFiltered] = useState<Disciplina[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    carga_horaria: 0,
  })

  useEffect(() => {
    fetchDisciplinas()
  }, [])

  useEffect(() => {
    const filtered = disciplinas.filter((d) =>
      d.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.codigo.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFiltered(filtered)
  }, [searchQuery, disciplinas])

  const fetchDisciplinas = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.request<Disciplina[]>(ENDPOINTS.DISCIPLINAS)
      setDisciplinas(data)
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.nome || !formData.codigo) return

    try {
      await apiClient.request(ENDPOINTS.DISCIPLINAS, {
        method: "POST",
        body: JSON.stringify(formData),
      })
      setFormData({ nome: "", codigo: "", carga_horaria: 0 })
      setShowModal(false)
      fetchDisciplinas()
    } catch (error) {
      console.error("Erro ao criar disciplina:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta disciplina?")) {
      try {
        await apiClient.request(`${ENDPOINTS.DISCIPLINAS}/${id}`, { method: "DELETE" })
        fetchDisciplinas()
      } catch (error) {
        console.error("Erro ao deletar disciplina:", error)
      }
    }
  }

  const getColorClass = (index: number) => DISCIPLINA_COLORS[index % DISCIPLINA_COLORS.length]

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Disciplinas
            </h1>
            <p className="text-gray-600 mt-2">Gerencie todas as disciplinas do sistema</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setFormData({ nome: "", codigo: "", carga_horaria: 0 })
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Nova Disciplina
          </motion.button>
        </div>

        {/* Stats */}
        <StaggeredContainer>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Total de Disciplinas"
              value={disciplinas.length}
              icon={<span>📚</span>}
              trend={{ value: 5, isPositive: true }}
              gradient="bg-gradient-to-br from-purple-500 to-pink-600"
            />
            <StatCard
              label="Horas Totais"
              value={disciplinas.reduce((acc, d) => acc + d.carga_horaria, 0)}
              icon={<span>⏰</span>}
              trend={{ value: 10, isPositive: true }}
              gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
            />
            <StatCard
              label="Disciplinas Ativas"
              value={Math.floor(disciplinas.length * 0.95)}
              icon={<span>✨</span>}
              trend={{ value: 2, isPositive: true }}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
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
                placeholder="Buscar por nome ou código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              />
            </div>
            <div className="flex gap-2 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all ${
                  viewMode === "list"
                    ? "bg-white text-purple-600 shadow-sm"
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
                className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full"
              />
              <p className="text-gray-600">Carregando disciplinas...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<span>📚</span>}
            title="Nenhuma disciplina encontrada"
            description={searchQuery ? "Tente ajustar sua busca" : "Comece adicionando uma nova disciplina"}
            action={<Button onClick={() => setShowModal(true)} className="bg-purple-600 text-white">Nova Disciplina</Button>}
          />
        ) : viewMode === "grid" ? (
          <StaggeredContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((disciplina, index) => (
                <motion.div key={disciplina.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="hover:shadow-lg transition-all overflow-hidden group">
                    <div className={`h-32 bg-gradient-to-br ${getColorClass(index)} relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20">
                        <BookOpen className="h-full w-full" />
                      </div>
                      <div className="relative h-full flex items-end p-4">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                          <button className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-md">
                            <Edit2 className="h-4 w-4 text-purple-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(disciplina.id)}
                            className="p-2 bg-white hover:bg-red-100 rounded-lg transition-colors shadow-md"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{disciplina.nome}</h3>
                          <p className="text-sm text-gray-500 font-mono">{disciplina.codigo}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-900">{disciplina.carga_horaria}h</span>
                        <span className="text-xs text-gray-600">carga horária</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{disciplina.professores_count || 0}</p>
                          <p className="text-xs text-gray-600">Professores</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-pink-600">{disciplina.turmas_count || 0}</p>
                          <p className="text-xs text-gray-600">Turmas</p>
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
              {filtered.map((disciplina, index) => (
                <motion.div
                  key={disciplina.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getColorClass(index)} text-white flex items-center justify-center text-xl`}>
                        📚
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{disciplina.nome}</h4>
                        <p className="text-sm text-gray-600">{disciplina.codigo}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-right">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">{disciplina.carga_horaria}h</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{disciplina.professores_count || 0} professores</p>
                        <p className="text-xs text-gray-600">{disciplina.turmas_count || 0} turmas</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4 text-purple-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(disciplina.id)}
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Disciplina">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Disciplina</label>
            <Input
              type="text"
              placeholder="Ex: Matemática"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
            <Input
              type="text"
              placeholder="Ex: MAT-01"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Carga Horária</label>
            <Input
              type="number"
              placeholder="80"
              value={formData.carga_horaria}
              onChange={(e) => setFormData({ ...formData, carga_horaria: parseInt(e.target.value) })}
              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreate}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              Criar Disciplina
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
