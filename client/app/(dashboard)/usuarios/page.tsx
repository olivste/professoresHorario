'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api-client'
import { DataTable } from '@/components/data-table'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import type { ColumnDef } from '@tanstack/react-table'

interface Usuario {
  id: number
  nome: string
  username: string
  email: string
  telefone?: string
  role: 'DIRETOR' | 'PEDAGOGO' | 'COORDENADOR' | 'PROFESSOR'
  ativo: boolean
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Role options allowed to be managed here (excludes PROFESSOR)
  const allowedRoles: Array<Usuario['role']> = ['DIRETOR', 'PEDAGOGO', 'COORDENADOR']

  useEffect(() => {
    loadUsuarios()
  }, [])

  async function loadUsuarios() {
    try {
      const data = await apiClient.get<Usuario[]>('/usuarios/?limit=1000')
      // Mostrar apenas usuários ativos e não-professores
      setUsuarios(data.filter((u) => u.ativo && u.role !== 'PROFESSOR'))
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar usuários',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function updateRole(usuarioId: number, role: Usuario['role']) {
    setIsSaving(true)
    try {
      await apiClient.put(`/usuarios/${usuarioId}`, { role })
      toast({ title: 'Função atualizada', description: 'Alteração aplicada com sucesso.' })
      loadUsuarios()
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar a função.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const columns: ColumnDef<Usuario>[] = [
    {
      accessorKey: 'nome',
      header: 'Nome',
    },
    {
      accessorKey: 'username',
      header: 'Usuário',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'telefone',
      header: 'Telefone',
      cell: ({ row }) => row.original.telefone || '-',
    },
    {
      accessorKey: 'role',
      header: 'Função',
      cell: ({ row }) => {
        const current = row.original.role
        const id = row.original.id
        return (
          <div className="flex items-center gap-3">
            <Badge variant="outline">{current}</Badge>
            <Select
              value={allowedRoles.includes(current) ? current : undefined}
              onValueChange={(value) => updateRole(id, value as Usuario['role'])}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Alterar função" />
              </SelectTrigger>
              <SelectContent>
                {allowedRoles.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      },
    },
    {
      accessorKey: 'ativo',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.ativo ? 'default' : 'secondary'}>
          {row.original.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground mt-2">
            {'Visualize usuários ativos e ajuste funções de direção/pedagogia'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários Ativos</CardTitle>
          <CardDescription>
            {'Consulte usuários ativos e ajuste funções de direção/pedagogia. Criação de professores é feita na tela de Professores.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable columns={columns} data={usuarios} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
