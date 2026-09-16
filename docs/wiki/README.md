# Wiki do Krux

Bem-vindo à documentação do projeto Krux.

Esta wiki foi organizada em páginas temáticas para facilitar o onboarding, manutenção e evolução do sistema.

## Navegação

- [Visão geral do produto](./01-visao-geral.md)
- [Arquitetura do sistema](./02-arquitetura.md)
- [Configuração do ambiente](./03-configuracao.md)
- [Banco de dados](./04-banco-de-dados.md)
- [Autenticação e segurança](./05-autenticacao-seguranca.md)
- [Funcionalidades](./06-funcionalidades.md)
- [Testes e deploy](./07-testes-e-deploy.md)
- [Troubleshooting](./08-troubleshooting.md)

## Visão geral

O Krux é uma aplicação Kanban inspirada no Trello, criada para ajudar usuários e pequenas equipes a organizar tarefas de forma simples e produtiva.

O projeto combina:

- Next.js + App Router
- TypeScript
- Prisma + PostgreSQL
- Auth.js para autenticação
- Tailwind CSS
- TanStack Query para cache e updates otimizados
- Drag-and-drop com `@dnd-kit`

## Objetivo do sistema

- facilitar o gerenciamento de tarefas
- permitir organização visual por colunas e cards
- reduzir a fricção no uso cotidiano
- manter alta performance mesmo em interações rápidas

## Estrutura resumida

```text
/
├── auth.ts
├── prisma/
├── public/
├── src/
├── next.config.ts
├── package.json
├── prisma.config.ts
├── tsconfig.json
├── vitest.config.mts
└── README.md
```

## Stack principal

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM 7
- PostgreSQL
- Auth.js / NextAuth.js
- TanStack Query
- Zod
- Argon2
- Cloudinary

## Fluxo principal

1. O usuário acessa a aplicação.
2. Realiza login com Google ou credenciais.
3. Acessa a área de boards.
4. Cria colunas e cards.
5. Move tarefas entre colunas.
6. Marca cards como concluídos.
7. Busca rapidamente por boards, colunas e cards.

## Observações

Esta documentação foi escrita com base no código atual do repositório e busca refletir a implementação real, sem inventar recursos inexistentes.

Se alguma funcionalidade for adicionada no futuro, ela deve ser documentada aqui com o mesmo padrão.
