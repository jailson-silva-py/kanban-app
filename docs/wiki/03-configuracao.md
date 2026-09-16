# Configuração do ambiente

## Requisitos

Antes de iniciar o projeto, confira os itens abaixo:

- Node.js compatível com Next.js 16
- npm
- PostgreSQL acessível
- acesso ao provedor Google OAuth, se for usar login Google
- credenciais Cloudinary para upload de imagens, se necessário

## Clonando o repositório

```bash
git clone https://github.com/jailson-silva-py/kanban-app.git
cd kanban-app
```

## Instalando dependências

```bash
npm install
```

## Variáveis de ambiente

O projeto depende de variáveis de ambiente para banco de dados, autenticação e integração.

Abaixo está um exemplo conceitual baseado na implementação atual:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/krux"
AUTH_URL="http://localhost:3000"
AUTH_SECRET="seu-secret-aqui"

GOOGLE_CLIENT_ID="seu-client-id"
GOOGLE_CLIENT_SECRET="seu-client-secret"

CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="sua-api-secret"
```

> Observação: o repositório não contém um `.env.example` explícito no estado atual analisado. Recomenda-se criar esse arquivo para padronizar onboarding e facilitar o setup.

## Executando as migrations

```bash
npx prisma generate
npx prisma migrate dev
```

## Rodando o projeto em desenvolvimento

```bash
npm run dev
```

A aplicação será acessível em:

```text
http://localhost:3000
```

## Scripts disponíveis

### `npm run dev`
Executa o projeto no modo de desenvolvimento com Turbopack.

### `npm run build`
Executa:

```bash
npx prisma generate
npx prisma migrate deploy
next build --turbo
```

### `npm run build-test`
Executa o build sem aplicar migrations.

### `npm start`
Inicia a aplicação em produção.

### `npm test`
Executa o Vitest com interface de testes.

### `npm run lint`
Executa o ESLint.

## Boas práticas de ambiente

- mantenha o banco em ambiente estável
- valide `DATABASE_URL` antes do build
- nunca versionar secrets
- manter `.env` fora do controle de versão
- documentar qualquer variável nova em documentação interna ou wiki

## Próxima página

- [Banco de dados](./04-banco-de-dados.md)
