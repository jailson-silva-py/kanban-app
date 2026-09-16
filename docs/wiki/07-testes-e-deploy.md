# Testes e deploy

## Testes

O projeto usa Vitest em conjunto com Testing Library.

### Configuração

Arquivo principal:

- `vitest.config.mts`

Configurado com:

- ambiente `jsdom`
- `setupFiles` para preparação de testes
- cobertura habilitada
- suporte a caminhos TypeScript

### Executando testes

```bash
npm test
```

Ou em modo não interativo:

```bash
npx vitest run
```

### Cobertura

```bash
npx vitest run --coverage
```

## Tipos de testes identificados

O repositório possui testes em:

- actions
- componentes
- hooks

Exemplos:

- `src/actions/boardActions.test.ts`
- `src/actions/cardActions.test.ts`
- `src/actions/columnActions.test.ts`
- `src/components/Card.test.tsx`
- `src/hooks/useMutationCards.test.tsx`

## Deploy

### Build de produção

```bash
npm run build
```

Esse comando executa:

```bash
npx prisma generate
npx prisma migrate deploy
next build --turbo
```

## Rodando em produção

```bash
npm start
```

## Observações importantes

- o build aplica migrations automaticamente
- o ambiente de produção precisa ter as variáveis de ambiente configuradas
- é necessário confirmar banco, autenticação e integrações antes do deploy

## Recomendação para CI/CD

O projeto deve beneficiar de uma pipeline com:

- lint
- testes
- build
- checagem de env vars
- deploy seguro por ambiente

## Próxima página

- [Troubleshooting](./08-troubleshooting.md)
