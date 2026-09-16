# Funcionalidades

## 1. Criação de boards

A ação `createBoardFromUser` cria um board associado ao usuário autenticado.

A funcionalidade garante que cada usuário tenha seus próprios boards e que o board seja restrito ao proprietário.

## 2. Criação de colunas

A ação `createColumnFromBoard` cria colunas dentro de um board.

A posição inicial é calculada pela maior ordem existente, com incremento de 100.

## 3. Criação de cards

A ação `createCartForColumn` cria um card em uma coluna específica.

A lógica também usa `position` para manter ordem do card dentro da coluna.

## 4. Atualização de título de board e coluna

As ações:

- `changeBoardTitle`
- `ChangeColumnTitle`

alteram o nome das entidades sem expor o fluxo para a interface.

## 5. Remoção de boards, colunas e cards

As operações de exclusão são protegidas para garantir que o usuário só possa remover itens de sua própria posse.

## 6. Marcar card como concluído

A função `ChangeCompletedCard` inverte o estado de `completed` do card.

## 7. Reordenação de cards

A função `reOrderCardsFromColumns` gerencia:

- mudança de coluna
- atualização de posição
- ajuste de itens vizinhos
- reindexação quando necessário

Essa lógica é central para a experiência de drag-and-drop do projeto.

## 8. Inbox

O aplicativo possui um board do tipo `Inbox` para guardar tarefas rápidas.

Quando não existe um board Inbox para o usuário, o sistema cria um automaticamente.

## 9. Busca global

A busca global combina consultas para:

- boards
- colunas
- cards

A busca é feita com filtro por usuário autenticado para evitar cruzamento de dados entre contas.

## 10. Upload de imagem de perfil

A ação `updateImageUser` usa Cloudinary para fazer upload da imagem e salvar a URL no usuário.

## 11. Experiência visual

A interface usa componentes reutilizáveis para entregar:

- menus
- dialogs
- toasts
- cards e colunas interativas
- feedback visual de status

## Observações

A implementação está fortemente voltada para produtividade e simplicidade, sem esconder a complexidade das regras de reorganização visual da aplicação.

## Próxima página

- [Testes e deploy](./07-testes-e-deploy.md)
