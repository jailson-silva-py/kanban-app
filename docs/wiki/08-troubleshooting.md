# Troubleshooting

## Problemas comuns

### 1. Falha de conexão com o banco

Verifique:

- `DATABASE_URL`
- acesso do banco
- credenciais do PostgreSQL
- estado da instância do banco

Comandos úteis:

```bash
npx prisma migrate deploy
npx prisma generate
```

### 2. Usuário não consegue acessar a aplicação

Confirme:

- sessão autenticada
- usuário com `id` disponível
- e-mail verificado, se o fluxo exigir
- proteção de rota em `src/proxy.ts`

### 3. Opções de login não funcionam

Verifique:

- variáveis do Google OAuth
- configuração do Auth.js
- provider correto para o fluxo de login
- hash e verificação de senhas com Argon2

### 4. Upload de imagem falha

Confirme:

- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- URL da imagem enviada

### 5. Search / cache não atualiza corretamente

Verifique:

- `QueryPovider.tsx`
- keys de query
- `mutationCache`
- mudanças recentes em actions ou hooks

### 6. Server Action fica em timeout

Verifique:

- latência do banco
- complexidade da query
- disponibilidade da instância do PostgreSQL
- logs de erro do runtime do Next.js

## Dicas práticas

- sempre rode `npx prisma generate` após mudanças no schema
- sempre verifique `npm run lint` antes de abrir PR
- sempre rode `npx vitest run` quando houver alterações de regras de negócio
- manter documentação em sincronia com o código

## Conclusão

O projeto tem um fluxo bem estruturado e a maioria dos problemas de operação pode ser solucionada verificando autenticação, banco de dados e cache nas camadas utilizadas por cada feature.
