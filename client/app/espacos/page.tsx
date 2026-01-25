"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit2, Trash2, Eye, Grid, List, DoorOpen, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Modal } from "@/components/data-table"
import { StatCard, EmptyState } from "@/components/custom-cards"
import { PageTransition, StaggeredContainer } from "@/components/animations"
import { apiClient } from "@/lib/api"
import { ENDPOINTS } from "@/lib/config"

interface Espaco {
  id: number
  nome: string
  tipo: "sala" | "laboratorio" | "biblioteca" | "auditorio" | "ginasio"
  capacidade: number
  numero_sala?: string
  andar?: number
  horarios_count?: number
}

const ESPACO_COLORS = {
  sala: "from-blue-400 to-blue-600",
  laboratorio: "from-yellow-400 to-orange-600",
  biblioteca: "from-purple-400 to-purple-600",
  auditorio: "from-red-400 to-red-600",
  ginasio: "from-green-400 to-green-600",
}

const ESPACO_ICONS = {
  sala: "🚪",
  laboratorio: "🔬",
  biblioteca: "📚",
  auditorio: "🎭",
  ginasio: "🏀",
}

export default function EspacosPage() {
  const [espacos, setEspacos] = useState<Espaco[]>([])
  const [filtered, setFiltered] = useState<Espaco[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "sala" as const,
    capacidade: 0,
    numero_sala: "",
    andar: 0,
  })

  useEffect(() => {
    fetchEspacos()
  }, [])

  useEffect(() => {
    const filtered = espacos.filter((e) =>
      e.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.numero_sala?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFiltered(filtered)
  }, [searchQuery, espacos])

  const fetchEspacos = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.request<Espaco[]>(ENDPOINTS.ESPACOS)
      setEspacos(data)
    } catch (error) {
      console.error("Erro ao buscar espaços:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.nome) return

    try {
      await apiClient.request(ENDPOINTS.ESPACOS, {
        method: "POST",
        body: JSON.stringify(formData),
      })
      setFormData({ nome: "", tipo: "sala", capacidade: 0, numero_sala: "", andar: 0 })
      setShowModal(false)
      fetchEspacos()
    } catch (error) {
      console.error("Erro ao criar espaço:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este espaço?")) {
      try {
        await apiClient.request(`${ENDPOINTS.ESPACOS}/${id}`, { method: "DELETE" })
        fetchEspacos()
      } catch (error) {
        console.error("Erro ao deletar espaço:", error)
      }
    }
  }

  const getColorClass = (tipo: string) =>
    ESPACO_COLORS[tipo as keyof typeof ESPACO_COLORS] || "from-gray-400 to-gray-600"

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Espaços
            </h1>
            <p className="text-gray-600 mt-2">Gerencie todas as salas e ambientes da escola</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setFormData({ nome: "", tipo: "sala", capacidade: 0, numero_sala: "", andar: 0 })
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Novo Espaço
          </motion.button>
        </div>

        {/* Stats */}
        <StaggeredContainer>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Total de Espaços"
              value={espacos.length}
              icon={<span>🏢</span>}
              trend={{ value: 5, isPositive: true }}
              gradient="bg-gradient-to-br from-orange-500 to-red-600"
            />
            <StatCard
              label="Capacidade Total"
              value={espacos.reduce((acc, e) => acc + e.capacidade, 0)}
              icon={<span>👥</span>}
              trend={{ value: 12, isPositive: true }}
              gradient="bg-gradient-to-br from-amber-500 to-yellow-600"
            />
            <StatCard
              label="Salas de Aula"
              value={espacos.filter((e) => e.tipo === "sala").length}
              icon={<span>🚪</span>}
              trend={{ value: 3, isPositive: true }}
              gradient="bg-gradient-to-br from-rose-500 to-pink-600"
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
                placeholder="Buscar por nome ou número..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
              />
            </div>
            <div className="flex gap-2 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all ${
                  viewMode === "list"
                    ? "bg-white text-orange-600 shadow-sm"
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
                className="w-12 h-12 border-4 border-gray-200 border-t-orange-600 rounded-full"
              />
              <p className="text-gray-600">Carregando espaços...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<span>🏢</span>}
            title="Nenhum espaço encontrado"
            description={searchQuery ? "Tente ajustar sua busca" : "Comece adicionando um novo espaço"}
            action={<Button onClick={() => setShowModal(true)} className="bg-orange-600 text-white">Novo Espaço</Button>}
          />
        ) : viewMode === "grid" ? (
          <StaggeredContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((espaco, index) => (
                <motion.div key={espaco.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="hover:shadow-lg transition-all overflow-hidden group">
                    <div className={`h-32 bg-gradient-to-br ${getColorClass(espaco.tipo)} relative overflow-hidden flex items-center justify-center text-5xl`}>
                      {ESPACO_ICONS[espaco.tipo as keyof typeof ESPACO_ICONS]}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                        <button className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-md">
                          <Edit2 className="h-4 w-4 text-orange-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(espaco.id)}
                          className="p-2 bg-white hover:bg-red-100 rounded-lg transition-colors shadow-md"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{espaco.nome}</h3>
                      {espaco.numero_sala && (
                        <p className="text-sm text-gray-500 mb-4 font-mono">Sala {espaco.numero_sala}</p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Users className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-semibold text-gray-900">{espaco.capacidade}</span>
                          <span className="text-xs text-gray-600">pessoas</span>
                        </div>
                        <div className="text-sm text-gray-700 px-3 py-2 bg-blue-50 rounded-lg">
                          <span className="font-semibold capitalize">{espaco.tipo}</span>
                          {espaco.andar && <span className="text-gray-600"> • {espaco.andar}º andar</span>}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{espaco.horarios_count || 0}</p>
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
              {filtered.map((espaco, index) => (
                <motion.div
                  key={espaco.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getColorClass(espaco.tipo)} text-white flex items-center justify-center text-2xl`}>
                        {ESPACO_ICONS[espaco.tipo as keyof typeof ESPACO_ICONS]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{espaco.nome}</h4>
                        <div className="flex gap-3 text-xs text-gray-600 mt-1">
                          {espaco.numero_sala && <span>Sala {espaco.numero_sala}</span>}
                          <span>Capacidade: {espaco.capacidade}</span>
                          {espaco.andar && <span>{espaco.andar}º andar</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 capitalize">{espaco.tipo}</p>
                        <p className="text-xs text-gray-600">{espaco.horarios_count || 0} horários</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-orange-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4 text-orange-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(espaco.id)}
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Espaço">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Espaço</label>
            <Input
              type="text"
              placeholder="Ex: Sala de Informática"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Espaço</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="sala">Sala de Aula</option>
              <option value="laboratorio">Laboratório</option>
              <option value="biblioteca">Biblioteca</option>
              <option value="auditorio">Auditório</option>
              <option value="ginasio">Ginásio</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número da Sala</label>
              <Input
                type="text"
                placeholder="101"
                value={formData.numero_sala}
                onChange={(e) => setFormData({ ...formData, numero_sala: e.target.value })}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Andar</label>
              <Input
                type="number"
                placeholder="1"
                value={formData.andar}
                onChange={(e) => setFormData({ ...formData, andar: parseInt(e.target.value) })}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Capacidade (pessoas)</label>
            <Input
              type="number"
              placeholder="30"
              value={formData.capacidade}
              onChange={(e) => setFormData({ ...formData, capacidade: parseInt(e.target.value) })}
              className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreate}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
            >
              Criar Espaço
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
