# 🎓 Sistema de Gestão de Horários - Frontend

Um frontend moderno, responsivo e bonito para o sistema de gestão de horários escolares, construído com **Next.js 15**, **Tailwind CSS v4** e **Framer Motion**.

## ✨ Características Principais

### 🎨 Design Moderno
- **Tailwind CSS v4** com gradientes e efeitos visuais
- **Framer Motion** para animações suaves
- **Componentes reutilizáveis** com Radix UI
- **Dark-ready** (preparado para tema escuro)
- **Responsivo** em todos os dispositivos

### 📱 Páginas Disponíveis

#### Dashboard Principal (`/`)
- Hero section com CTA
- Estatísticas em tempo real
- Grid de features
- Design chamativo com gradientes

#### Login (`/login`)
- Autenticação com JWT
- Show/hide password
- Credenciais demo integradas
- Animações de sucesso
- Validação de formulário

#### Professores (`/professores`)
- Visualização em grid/lista
- Busca em tempo real
- CRUD completo
- Estatísticas (disciplinas, horários)
- Modal de criação/edição

#### Disciplinas (`/disciplinas`)
- Cards coloridos com gradientes
- Filtro por nome/código
- Carga horária visualizada
- Contadores de professores/turmas
- Modal de criação

#### Turmas (`/turmas`)
- Gestão de turmas
- Número de alunos
- Visualização dupla (grid/lista)
- Busca por nome/descrição
- Estatísticas de carga

#### Espaços (`/espacos`)
- Gerenciamento de salas, laboratórios, etc
- Tipos diferentes (sala, laboratorio, biblioteca, auditorio, ginasio)
- Capacidade de pessoas
- Andar e número da sala
- Ícones específicos para cada tipo

#### Reservas (`/reservas`)
- Sistema de reservas de espaços
- Status (confirmada, pendente, cancelada)
- Filtros por status
- Data e hora de reserva
- Motivo da reserva
- View responsivo para mobile

#### Horários (`/horarios`)
- Calendário de horários
- Visualização por dia/semana
- Cores por período (AULA, INTERVALO, etc)
- Edição de horários

#### Turnos (`/turnos`)
- Gestão de turnos
- Períodos de aula
- Cores por tipo
- Sidebar com seleção

### 🛠️ Componentes Reutilizáveis

#### UI Base (`components/ui/`)
- `Button.tsx` - Botões com variantes
- `Input.tsx` - Inputs estilizados
- `Card.tsx` - Cards base
- `Label.tsx` - Labels de formulário
- `Select.tsx` - Selects com Radix
- `Alert.tsx` - Alertas
- `Sheet.tsx` - Sheets para mobile

#### Custom Components
- **StatCard** - Cartões com estatísticas, ícones e trends
- **FeatureCard** - Cards de features com ícones
- **Badge** - Badges de status com variantes
- **EmptyState** - Estado vazio com ícone e CTA
- **DataTable** - Tabela genérica com colunas
- **FormGroup** - Grupos de formulário
- **Modal** - Modais com backdrop
- **Tabs** - Abas com ícones e estados

#### Animations (`components/animations.tsx`)
- **LoadingSpinner** - Spinner giratório
- **PageTransition** - Transição de página
- **StaggeredContainer** - Container com animação em cascata
- **BounceCard** - Card que pula ao hover
- **FadeInOnScroll** - Fade ao entrar em view
- **PulseEffect** - Efeito de pulso

#### Charts (`components/charts.tsx`)
- **ChartBar** - Gráfico de barras animado
- **CircleProgress** - Progresso circular
- **SimpleLineChart** - Gráfico de linha SVG
- **DonutChart** - Gráfico de donut/pizza

#### Status Badge (`components/status-badge.tsx`)
- **StatusBadge** - Badge de status com ícone
- **TrendBadge** - Badge de trend com seta
- **ColorBadge** - Badge com cores customizáveis

## 🚀 Como Iniciar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start
```

O servidor estará disponível em `http://localhost:3001`

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "next": "^15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.263.0",
    "@radix-ui/react-label": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-alert-dialog": "^1.0.0"
  }
}
```

## 🎯 Estrutura de Pastas

```
client/
├── app/
│   ├── layout.tsx              # Layout root com AuthProvider
│   ├── page.tsx                # Dashboard
│   ├── login/
│   │   └── page.tsx            # Página de login
│   ├── professors/
│   │   └── page.tsx            # Gestão de professores
│   ├── disciplinas/
│   │   └── page.tsx            # Gestão de disciplinas
│   ├── turmas/
│   │   └── page.tsx            # Gestão de turmas
│   ├── espacos/
│   │   └── page.tsx            # Gestão de espaços
│   ├── reservas/
│   │   └── page.tsx            # Gestão de reservas
│   ├── horarios/
│   │   └── page.tsx            # Gestão de horários
│   ├── turnos/
│   │   └── page.tsx            # Gestão de turnos
│   └── globals.css             # Estilos globais
├── components/
│   ├── ui/                     # Componentes Radix UI estilizados
│   ├── navigation.tsx          # Sidebar e menu mobile
│   ├── custom-cards.tsx        # Componentes customizados
│   ├── data-table.tsx          # Tabela e utilitários
│   ├── animations.tsx          # Animações Framer Motion
│   ├── status-badge.tsx        # Badges de status
│   ├── charts.tsx              # Gráficos e visualizações
│   └── [outros componentes]
├── hooks/
│   └── use-auth.tsx            # Hook de autenticação
├── lib/
│   ├── api.ts                  # Cliente API
│   ├── config.ts               # Configurações
│   └── utils.ts                # Utilitários
├── package.json                # Dependências
├── tsconfig.json               # Configuração TypeScript
├── tailwind.config.ts          # Configuração Tailwind
└── next.config.ts              # Configuração Next.js
```

## 🔐 Autenticação

### Flow
1. Login em `/login`
2. Token JWT armazenado em localStorage
3. AuthProvider em `app/layout.tsx`
4. Hook `useAuth()` para acessar dados do usuário
5. Proteção automática de rotas

### Credenciais Demo
```
Usuário: admin
Senha: admin123
```

## 🎨 Sistema de Cores

### Gradientes por Seção
- **Dashboard**: Blue → Purple
- **Login**: Blue → Indigo
- **Professores**: Blue → Indigo
- **Disciplinas**: Purple → Pink
- **Turmas**: Green → Emerald
- **Espaços**: Orange → Red
- **Reservas**: Indigo → Blue

## 📝 Padrões de Código

### Componentes Funcionais
```tsx
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function MyComponent() {
  const [state, setState] = useState("")

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Conteúdo */}
    </motion.div>
  )
}
```

### Imports Padronizados
```tsx
// Componentes UI
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

// Componentes Custom
import { StatCard, EmptyState } from "@/components/custom-cards"
import { Modal } from "@/components/data-table"
import { PageTransition } from "@/components/animations"

// Hooks e Lib
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"
```

## 🌐 API Integration

### Endpoints Utilizados
- `GET /api/professores` - Lista professores
- `POST /api/professores` - Criar professor
- `DELETE /api/professores/{id}` - Deletar professor
- `GET /api/disciplinas` - Lista disciplinas
- `GET /api/turmas` - Lista turmas
- `GET /api/espacos` - Lista espaços
- `GET /api/reservas` - Lista reservas
- `GET /api/horarios` - Lista horários
- `GET /auth/me` - Dados do usuário autenticado

## 🎭 Animações

### Framer Motion
- `PageTransition` - Fade + Y no enter/exit
- `StaggeredContainer` - Animação em cascata
- `LoadingSpinner` - Spinner giratório
- `BounceCard` - Card que pula
- `FadeInOnScroll` - Fade ao entrar em view

### Transições Tailwind
- Hover effects nos buttons
- Transições de cor em 200-300ms
- Shadow transitions

## 📱 Responsividade

### Breakpoints Tailwind
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Layout
- Desktop: Sidebar 64px (w-64)
- Mobile: Menu em sheet

## 🔧 Configuração

### Next.js Config
```ts
// next.config.ts
const config: NextConfig = {
  // Configurações...
}
```

### Tailwind Config
```ts
// tailwind.config.ts
import type { Config } from "tailwindcss"

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```

## 🚦 Status das Páginas

| Página | Status | Grid/List | CRUD | Search | Stats |
|--------|--------|-----------|------|--------|-------|
| Dashboard | ✅ | - | - | - | ✅ |
| Login | ✅ | - | - | - | - |
| Professores | ✅ | ✅ | ✅ | ✅ | ✅ |
| Disciplinas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Turmas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Espaços | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reservas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Horários | ⚠️ | ✅ | ⚠️ | ✅ | - |
| Turnos | ⚠️ | - | ⚠️ | ✅ | - |

## 🎓 Exemplos de Uso

### Usar StatCard
```tsx
<StatCard
  title="Total de Professores"
  value={120}
  icon="👨‍🏫"
  trend={{ value: 12, label: "este mês" }}
/>
```

### Usar EmptyState
```tsx
<EmptyState
  icon="👨‍🏫"
  title="Nenhum professor encontrado"
  description="Comece adicionando um novo professor"
  action={{
    label: "Novo Professor",
    onClick: () => setShowModal(true),
  }}
/>
```

### Usar Modal
```tsx
<Modal
  show={showModal}
  onClose={() => setShowModal(false)}
  title="Novo Professor"
>
  {/* Conteúdo do modal */}
</Modal>
```

### Usar PageTransition
```tsx
<PageTransition>
  <h1>Conteúdo com transição</h1>
</PageTransition>
```

## 🐛 Troubleshooting

### Erro de Porta 3000
```bash
# Usar porta 3001
npm run dev -- -p 3001
```

### Erro de Token
- Limpar localStorage: `localStorage.clear()`
- Fazer login novamente

### Estilos não aparecem
```bash
# Rebuild Tailwind
npm run build
```

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

## 📄 Licença

Este projeto é parte do Sistema de Gestão Escolar.

---

**Desenvolvido com ❤️ usando Next.js + Tailwind + Framer Motion**
