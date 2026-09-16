# Autenticação e segurança

## Visão geral

A autenticação do projeto está centralizada em `auth.ts`, que configura o Auth.js/NextAuth para lidar com múltiplos métodos de login.

## Provedores de autenticação

A aplicação usa:

- Google OAuth
- login por credenciais (e-mail e senha)

## Arquivos principais

- `auth.ts`
- `src/proxy.ts`
- `src/types/FormsZodType.ts`
- `src/types/AuthErrors.ts`
- `src/actions/wrappers.ts`

## Cadastro com e-mail e senha

O fluxo de cadastro:

1. valida e-mail
2. valida senha
3. valida nome de usuário
4. verifica se o usuário já existe
5. aplica hash com Argon2
6. cria o usuário no banco

## Login com e-mail e senha

O fluxo:

1. valida e-mail e senha
2. busca o usuário pelo e-mail
3. compara a senha usando `verify`
4. retorna o usuário autenticado se a validação passar

## Senhas

As senhas são armazenadas em hash usando Argon2, o que reduz o risco de expor credenciais em texto puro em caso de vazamento.

## Proteção de rotas

O arquivo `src/proxy.ts` verifica se o usuário está autenticado e se o seu e-mail está verificado antes de liberar acesso a rotas sensíveis.

Rotas privadas:

- `/home`
- `/profile`
- `/board`

Rotas públicas:

- `/login`
- `/signin`

## Verificação de sessão

A sessão é configurada com estratégia JWT e o token recebe informações como:

- `id`
- `emailVerified`
- `provider`

## Validação com Zod

As validações de autenticação estão em:

- `src/types/FormsZodType.ts`

As regras incluem:

- mínimo e máximo de caracteres
- senha com letra maiúscula
- senha com caractere especial
- e-mail válido

## Proteção de Server Actions

A função `protectedActions` em `src/actions/wrappers.ts` garante:

- sessão obrigatória
- checagem de autenticação
- timeout de execução
- tratamento de erros de banco
- padronização de exceções

## Boas práticas recomendadas

- manter `AUTH_SECRET` em ambiente seguro
- usar `.env` fora do controle de versão
- validar todas as entradas antes de persistir
- evitar logar dados sensíveis
- revisar rotas e ações sempre que criar novos recursos

## Próxima página

- [Funcionalidades](./06-funcionalidades.md)
