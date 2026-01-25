"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit2, Trash2, Eye, Grid, List, Calendar, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Modal } from "@/components/data-table"
import { StatCard, EmptyState } from "@/components/custom-cards"
import { PageTransition, StaggeredContainer } from "@/components/animations"
import { apiClient } from "@/lib/api"
import { ENDPOINTS } from "@/lib/config"

interface Reserva {
  id: number
  espaco_id: number
  espaco_nome?: string
  professor_nome?: string
  data_reserva: string
  hora_inicio: string
  hora_fim: string
  motivo?: string
  status: "confirmada" | "pendente" | "cancelada"
}

const STATUS_COLORS = {
  confirmada: "bg-green-100 text-green-800 border-green-300",
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  cancelada: "bg-red-100 text-red-800 border-red-300",
}

const STATUS_ICONS = {
  confirmada: "✅",
  pendente: "⏳",
  cancelada: "❌",
}

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [filtered, setFiltered] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<"todos" | "confirmada" | "pendente" | "cancelada">("todos")
  const [formData, setFormData] = useState({
    espaco_id: 0,
    data_reserva: "",
    hora_inicio: "",
    hora_fim: "",
    motivo: "",
  })

  useEffect(() => {
    fetchReservas()
  }, [])

  useEffect(() => {
    let filtered = reservas.filter((r) =>
      (r.espaco_nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.professor_nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.motivo?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterStatus === "todos" || r.status === filterStatus)
    )
    setFiltered(filtered.sort((a, b) => new Date(b.data_reserva).getTime() - new Date(a.data_reserva).getTime()))
  }, [searchQuery, reservas, filterStatus])

  const fetchReservas = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.request<Reserva[]>(ENDPOINTS.RESERVAS)
      setReservas(data)
    } catch (error) {
      console.error("Erro ao buscar reservas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.espaco_id || !formData.data_reserva) return

    try {
      await apiClient.request(ENDPOINTS.RESERVAS, {
        method: "POST",
        body: JSON.stringify(formData),
      })
      setFormData({ espaco_id: 0, data_reserva: "", hora_inicio: "", hora_fim: "", motivo: "" })
      setShowModal(false)
      fetchReservas()
    } catch (error) {
      console.error("Erro ao criar reserva:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja cancelar esta reserva?")) {
      try {
        await apiClient.request(`${ENDPOINTS.RESERVAS}/${id}`, { method: "DELETE" })
        fetchReservas()
      } catch (error) {
        console.error("Erro ao cancelar reserva:", error)
      }
    }
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString("pt-BR")

  const getStatusStats = () => {
    return {
      total: reservas.length,
      confirmada: reservas.filter((r) => r.status === "confirmada").length,
      pendente: reservas.filter((r) => r.status === "pendente").length,
      cancelada: reservas.filter((r) => r.status === "cancelada").length,
    }
  }

  const stats = getStatusStats()

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Reservas
            </h1>
            <p className="text-gray-600 mt-2">Gerencie as reservas de espaços da escola</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setFormData({ espaco_id: 0, data_reserva: "", hora_inicio: "", hora_fim: "", motivo: "" })
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Nova Reserva
          </motion.button>
        </div>

        {/* Stats */}
        <StaggeredContainer>
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              label="Total de Reservas"
              value={stats.total}
              icon={<span>📅</span>}
              trend={{ value: 5, isPositive: true }}
              gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
            />
            <StatCard
              label="Confirmadas"
              value={stats.confirmada}
              icon={<span>✅</span>}
              trend={{ value: 3, isPositive: true }}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            />
            <StatCard
              label="Pendentes"
              value={stats.pendente}
              icon={<span>⏳</span>}
              trend={{ value: 1, isPositive: false }}
              gradient="bg-gradient-to-br from-amber-500 to-yellow-600"
            />
            <StatCard
              label="Canceladas"
              value={stats.cancelada}
              icon={<span>❌</span>}
              trend={{ value: 1, isPositive: false }}
              gradient="bg-gradient-to-br from-rose-500 to-red-600"
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
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por espaço, professor ou motivo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendente">Pendentes</option>
              <option value="cancelada">Canceladas</option>
            </select>

            <div className="flex gap-2 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all ${
                  viewMode === "list"
                    ? "bg-white text-indigo-600 shadow-sm"
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
                className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full"
              />
              <p className="text-gray-600">Carregando reservas...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<span>📅</span>}
            title="Nenhuma reserva encontrada"
            description={searchQuery || filterStatus !== "todos" ? "Tente ajustar seu filtro" : "Comece adicionando uma nova reserva"}
            action={<Button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white">Nova Reserva</Button>}
          />
        ) : viewMode === "grid" ? (
          <StaggeredContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((reserva, index) => (
                <motion.div key={reserva.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="hover:shadow-lg transition-all overflow-hidden group">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{reserva.espaco_nome}</h3>
                          <p className="text-sm text-gray-600 mt-1">{reserva.professor_nome}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[reserva.status]}`}>
                          <span className="mr-2">{STATUS_ICONS[reserva.status]}</span>
                          {reserva.status.charAt(0).toUpperCase() + reserva.status.slice(1)}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                          <span>{formatDate(reserva.data_reserva)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="h-4 w-4 text-indigo-600" />
                          <span>
                            {reserva.hora_inicio} - {reserva.hora_fim}
                          </span>
                        </div>
                      </div>

                      {reserva.motivo && (
                        <p className="text-sm text-gray-600 mb-4 p-2 bg-blue-50 rounded">
                          <span className="font-medium">Motivo:</span> {reserva.motivo}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex-1 p-2 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                          <Eye className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm font-medium text-indigo-600">Visualizar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(reserva.id)}
                          className="flex-1 p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-600">Cancelar</span>
                        </button>
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
              {filtered.map((reserva, index) => (
                <motion.div
                  key={reserva.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      {/* Left */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[reserva.status]}`}>
                          {STATUS_ICONS[reserva.status]}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{reserva.espaco_nome}</h4>
                          <p className="text-sm text-gray-600">{reserva.professor_nome}</p>
                        </div>
                      </div>

                      {/* Center */}
                      <div className="hidden md:flex items-center gap-6 px-6">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                          <span>{formatDate(reserva.data_reserva)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="h-4 w-4 text-indigo-600" />
                          <span>
                            {reserva.hora_inicio} - {reserva.hora_fim}
                          </span>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(reserva.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile details */}
                    <div className="md:hidden mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-600" />
                        {formatDate(reserva.data_reserva)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        {reserva.hora_inicio} - {reserva.hora_fim}
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Reserva">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Espaço</label>
            <Input
              type="number"
              placeholder="ID do espaço"
              value={formData.espaco_id}
              onChange={(e) => setFormData({ ...formData, espaco_id: parseInt(e.target.value) })}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
            <Input
              type="date"
              value={formData.data_reserva}
              onChange={(e) => setFormData({ ...formData, data_reserva: e.target.value })}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora Início</label>
              <Input
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora Fim</label>
              <Input
                type="time"
                value={formData.hora_fim}
                onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo</label>
            <Input
              type="text"
              placeholder="Motivo da reserva"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreate}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700"
            >
              Criar Reserva
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
