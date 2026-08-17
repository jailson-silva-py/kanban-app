# 📋 Kanban App

Um quadro Kanban **full-stack, moderno e em tempo real**, construído do zero com o que há de mais atual no ecossistema React/Next.js. Não é só mais um "to-do list" — é uma aplicação completa com autenticação robusta, banco de dados relacional, drag-and-drop fluido e uma arquitetura pensada para escalar.

## ✨ Por que esse projeto se destaca
- **Cobertura de testes de mais de 70%** — Atualmente com testes de integração no núcleo da aplicação e futuramente tenho a meta de alcançar 90%, veja a cobertura atual:
[.. image:: https://codecov.io/github/jailson-silva-py/kanban-app/graph/badge.svg?token=WUJH14TFE5 
 :target: https://codecov.io/github/jailson-silva-py/kanban-app](https://codecov.io/github/jailson-silva-py/kanban-app/graphs/sunburst.svg?token=WUJH14TFE5)
- **Arquitetura 100% Server Actions** — sem API REST intermediária redundante: o front conversa direto com o backend através de Server Actions do Next.js, com wrappers centralizados de tratamento de erro e autenticação.
- **Drag-and-drop de verdade, não gambiarra** — reordenação de cards e colunas usando **posições em ponto flutuante** (`Float`), o que permite reordenar itens sem precisar reindexar toda a lista a cada movimento (só reindexa quando necessário).
- **Autenticação multi-estratégia** — login com **Google OAuth** e também **credenciais próprias** (e-mail/senha), com hashing seguro via **Argon2** (algoritmo vencedor da Password Hashing Competition, mais robusto que bcrypt).
- **Cache inteligente no cliente** — uso de **TanStack React Query** para cache, invalidação seletiva e atualizações otimistas, evitando requisições desnecessárias e mantendo a UI sempre responsiva.
- **Busca global instantânea** — encontre boards, colunas e cards em um único campo de busca, com debounce e resultados navegáveis.
- **Erros tratados como cidadãos de primeira classe** — classes de erro customizadas (`UnAuthentichatedError`, `EmailAlreadyExistsError`, `InvalidCredentialsError`, entre outras) tornam o backend previsível e as mensagens para o usuário, claras.
- **Tipagem ponta a ponta** — TypeScript do banco de dados (Prisma) até o componente React, sem contrato quebrado entre camadas.

## 🚀 Tecnologias utilizadas

### Core
| Tecnologia | Função no projeto |
|---|---|
| **Next.js 16** (App Router + Turbopack) | Framework full-stack: renderização híbrida, Server Actions e roteamento baseado em arquivos |
| **React 19** | Biblioteca de UI, com suporte ao React Compiler para otimização automática de re-renders |
| **TypeScript** | Tipagem estática em todo o código-fonte |

### Backend & Dados
| Tecnologia | Função no projeto |
|---|---|
| **Prisma ORM 7** | Modelagem e acesso ao banco de dados com type-safety completo |
| **PostgreSQL** | Banco de dados relacional principal |
| **@prisma/adapter-pg / adapter-neon** | Adaptadores de conexão performática, prontos para ambientes serverless |
| **NextAuth.js (Auth.js v5)** | Autenticação com múltiplos provedores (Google e credenciais) |
| **Argon2** | Hashing de senhas de alta segurança |
| **Zod** | Validação de schemas e formulários |

### Frontend & Experiência
| Tecnologia | Função no projeto |
|---|---|
| **TanStack React Query** | Gerenciamento de estado assíncrono, cache e sincronização com o servidor |
| **@dnd-kit** | Drag-and-drop acessível e performático para cards e colunas |
| **Tailwind CSS 4** | Estilização utilitária moderna |
| **React Icons** | Biblioteca de ícones consistente em toda a interface |

## 🧩 Principais funcionalidades

- **Boards múltiplos** — cada usuário pode criar e gerenciar vários boards próprios, incluindo um board "Inbox" padrão.
- **Colunas dinâmicas** — criação, edição de título e reordenação de colunas dentro de um board.
- **Cards completos** — título, descrição, status de conclusão e reordenação livre via drag-and-drop entre colunas.
- **Busca global** — pesquisa unificada por boards, colunas e cards.
- **Autenticação segura** — fluxo de login e cadastro com validação de campos e proteção de rotas via Server Actions protegidas.
- **Interface responsiva e polida** — menus flutuantes, toasts de feedback, estados de carregamento dedicados e transições suaves.

## 🛠️ Como rodar o projeto

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente (banco de dados, OAuth do Google, etc.)
cp .env.example .env

# Rodar as migrations do Prisma
npx prisma migrate dev

# Subir o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver o projeto rodando.

## 📁 Estrutura do projeto

```
src/
├── actions/       # Server Actions (regras de negócio + acesso ao banco)
├── app/           # Rotas (App Router), páginas e layouts
├── components/    # Componentes de UI reutilizáveis
├── hooks/         # Hooks customizados (cache, drag-and-drop, storage local)
├── providers/     # Providers globais (React Query, etc.)
├── types/         # Tipos e schemas compartilhados
└── generated/     # Client do Prisma gerado automaticamente
```

## 📌 Roadmap

- [ ] Colaboração em tempo real entre múltiplos usuários no mesmo board
- [ ] Compartilhamento de boards por convite
- [ ] Notificações e histórico de atividades

---

Construído com atenção a arquitetura, performance e experiência do usuário — um projeto que não faz por fazer.
