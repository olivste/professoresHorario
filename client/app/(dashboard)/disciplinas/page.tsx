'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { apiClient } from '@/lib/api-client'
import { DataTable } from '@/components/data-table'
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Disciplina {
  id: number
  nome: string
  codigo: string
  carga_horaria_semanal: number
  descricao?: string
  ativa: boolean
}

export default function DisciplinasPage() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { toast } = useToast()

  // Mapeamento de disciplinas por ano (união das trilhas do seed)
  // Usado somente para filtro/agrupamento visual na listagem
  const ANO_DISCIPLINAS: Record<'1' | '2' | '3', Set<string>> = {
    '1': new Set([
      'Arte',
      'Biologia',
      'Educação Física',
      'Estudo Orientado',
      'Filosofia',
      'Física',
      'Geografia',
      'História',
      'Língua Inglesa',
      'Língua Portuguesa',
      'Matemática',
      'Projeto de Vida',
      'Práticas e Vivências em Protagonismo',
      'Eletivas',
      'Projetos Empreendedores',
      'Fundamentos da Computação',
      'Lógica de Programação e Gamificação',
      'Introdução ao Desenvolvimento Web',
      'Sociologia',
    ]),
    '2': new Set([
      'Arte',
      'Biologia',
      'Educação Física',
      'Estudo Orientado',
      'Filosofia',
      'Física',
      'Geografia',
      'História',
      'Língua Inglesa',
      'Língua Portuguesa',
      'Matemática',
      'Projeto de Vida',
      'Eletiva',
      'Prática Experimental',
      'Cultura Digital',
      'Introdução à Rede de Computadores e Protocolos',
      'Linguagem de Programação Aplicada à Web',
      'IOT – Internet of Things',
      'Banco de Dados',
      'Aplicativos Web',
      'Química',
      'Aprofundamento em Biologia',
      'Aprofundamento em Física',
      'Aprofundamento em Química',
      'Aprofundamento em Matemática',
      'Sociologia',
    ]),
    '3': new Set([
      'Biologia',
      'Estudo Orientado',
      'Geografia',
      'História',
      'Língua Inglesa',
      'Língua Portuguesa',
      'Matemática',
      'Projeto de Vida',
      'Eletiva',
      'Prática Experimental',
      'Análise e Projetos de Sistemas',
      'Arquitetura, Segurança e Projetos de Redes',
      'Programação para Web Design',
      'Linguagem de Programação Orientada a Objetos',
      'Desenvolvimento de Sistemas',
      'Desenvolvimento de Games',
      'Português Instrumental',
      'Desenho Técnico',
      'Matemática e Sociedade',
      'Fontes de Obtenção de Energia',
      'A Física e as Matrizes Energéticas',
      'Matéria e Energia',
      'Física',
      'Química',
      'Sociologia',
      'Arte',
    ]),
  }

  type AnoFiltro = 'todas' | '1' | '2' | '3'
  const [anoFiltro, setAnoFiltro] = useState<AnoFiltro>('todas')

  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    carga_horaria_semanal: 4,
    descricao: '',
    ativa: true,
  })

  useEffect(() => {
    loadDisciplinas()
  }, [])

  async function loadDisciplinas() {
    try {
      const data = await apiClient.get<Disciplina[]>('/disciplinas/?limit=1000')
      setDisciplinas(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar disciplinas',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      await apiClient.post('/disciplinas/', formData)
      toast({
        title: 'Sucesso',
        description: 'Disciplina criada com sucesso',
      })
      setIsDialogOpen(false)
      resetForm()
      loadDisciplinas()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar disciplina',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiClient.delete(`/disciplinas/${id}/`)
      toast({
        title: 'Sucesso',
        description: 'Disciplina excluída com sucesso',
      })
      loadDisciplinas()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir disciplina',
        variant: 'destructive',
      })
    } finally {
      setDeleteId(null)
    }
  }

  function resetForm() {
    setFormData({
      nome: '',
      codigo: '',
      carga_horaria_semanal: 4,
      descricao: '',
      ativa: true,
    })
  }

  const columns: ColumnDef<Disciplina>[] = [
    {
      accessorKey: 'codigo',
      header: 'Código',
      meta: { className: 'w-32 whitespace-nowrap' },
    },
    {
      accessorKey: 'nome',
      header: 'Nome',
      meta: { className: 'w-[36%] truncate' },
    },
    {
      accessorKey: 'carga_horaria_semanal',
      header: 'Carga Horária',
      meta: { className: 'w-32 whitespace-nowrap' },
      cell: ({ row }) => `${row.original.carga_horaria_semanal}h/sem`,
    },
    {
      accessorKey: 'descricao',
      header: 'Descrição',
      meta: { className: 'w-[30%] truncate' },
      cell: ({ row }) => row.original.descricao || '-',
    },
    {
      accessorKey: 'ativa',
      header: 'Status',
      meta: { className: 'w-24 whitespace-nowrap' },
      cell: ({ row }) => (
        <Badge variant={row.original.ativa ? 'default' : 'secondary'}>
          {row.original.ativa ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      meta: { className: 'w-24 whitespace-nowrap' },
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" disabled>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  // Aplica filtro por ano com base no mapeamento acima
  const disciplinasFiltradas = React.useMemo(() => {
    if (anoFiltro === 'todas') return disciplinas
    const nomesPermitidos = ANO_DISCIPLINAS[anoFiltro]
    return disciplinas.filter(d => nomesPermitidos.has(d.nome))
  }, [disciplinas, anoFiltro])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disciplinas</h1>
          <p className="text-muted-foreground mt-2">
            {'Gerencie as disciplinas oferecidas pela instituição'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Disciplina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Disciplina</DialogTitle>
              <DialogDescription>
                {'Preencha os dados da nova disciplina'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código*</Label>
                  <Input
                    id="codigo"
                    required
                    placeholder="Ex: MAT001"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome*</Label>
                  <Input
                    id="nome"
                    required
                    placeholder="Ex: Matemática"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carga_horaria">Carga Horária Semanal*</Label>
                <Input
                  id="carga_horaria"
                  type="number"
                  min="1"
                  required
                  value={formData.carga_horaria_semanal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      carga_horaria_semanal: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva a disciplina..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativa"
                  checked={formData.ativa}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ativa: checked })
                  }
                />
                <Label htmlFor="ativa">Disciplina ativa</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Disciplinas</CardTitle>
          <CardDescription>
            {'Visualize e gerencie todas as disciplinas cadastradas'}
          </CardDescription>
          {/* Filtro por turma/ano */}
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant={anoFiltro === 'todas' ? 'default' : 'outline'}
              onClick={() => setAnoFiltro('todas')}
            >
              Todas
            </Button>
            <Button
              variant={anoFiltro === '1' ? 'default' : 'outline'}
              onClick={() => setAnoFiltro('1')}
            >
              1º ano
            </Button>
            <Button
              variant={anoFiltro === '2' ? 'default' : 'outline'}
              onClick={() => setAnoFiltro('2')}
            >
              2º ano
            </Button>
            <Button
              variant={anoFiltro === '3' ? 'default' : 'outline'}
              onClick={() => setAnoFiltro('3')}
            >
              3º ano
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable columns={columns} data={disciplinasFiltradas} />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {'Tem certeza que deseja excluir esta disciplina? Esta ação não pode ser desfeita.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
