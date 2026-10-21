import { QueryClient } from "@tanstack/react-query";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cardComment } from "@/constrants/queryKeys";
import { renderWithProviders, createCard } from "@/app/util/testImplementations";
import { CardComment } from "@/types/dataTypes";
import * as actions from "@/actions/cardActions";
import { ModalEditCard } from "./ModalEditCard";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "user-1", name: "Test User", image: "/avatar.png" } },
    status: "authenticated",
  }),
}));

vi.mock("@/actions/cardActions", () => ({
  ChangeCompletedCard: vi.fn(),
  createCommentCard: vi.fn(),
  deleteCommentCard: vi.fn(),
  editCommentCard: vi.fn(),
  editDescriptionCard: vi.fn(),
  editTitleCard: vi.fn(),
  getCommentsByCardId: vi.fn(),
}));

const card = createCard({
  id: "card-1",
  title: "Título inicial",
  description: "Descrição inicial",
});

const ownComment: CardComment = {
  id: "comment-1",
  body: "Comentário inicial",
  createdAt: new Date("2025-01-01T12:00:00.000Z"),
  owner: { id: "user-1", name: "Test User", image: "/avatar.png" },
};

const intersectionCallbacks: IntersectionObserverCallback[] = [];

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
    mutations: { retry: false },
  },
});

const renderModal = ({
  isOpen = true,
  comments = [],
  completed = card.completed,
  nextCursor = null,
  seedComments = true,
}: {
  isOpen?: boolean;
  comments?: CardComment[];
  completed?: boolean;
  nextCursor?: string | null;
  seedComments?: boolean;
} = {}) => {
  const queryClient = createQueryClient();
  queryClient.setQueryData(["card", card.id], { ...card, completed });
  if (seedComments) {
    queryClient.setQueryData(cardComment(card.id), {
      pages: [{ comments, nextCursor }],
      pageParams: [undefined],
    });
  }

  const setIsOpen = vi.fn();
  renderWithProviders(
    <ModalEditCard
      card={{ ...card, completed }}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      isPending={false}
      onChangeIsComplete={() => { }}
      completed={completed}
      handleChangeCompleted={() => { }}
    />,
    queryClient,
  );

  return { queryClient, setIsOpen };
};

beforeEach(() => {
  intersectionCallbacks.length = 0;
  vi.mocked(actions.ChangeCompletedCard).mockResolvedValue({ ...card, completed: true });
  vi.mocked(actions.createCommentCard).mockResolvedValue(ownComment);
  vi.mocked(actions.deleteCommentCard).mockResolvedValue(undefined);
  vi.mocked(actions.editCommentCard).mockResolvedValue({
    id: ownComment.id,
    body: ownComment.body,
    cardId: card.id,
  });
  vi.mocked(actions.editDescriptionCard).mockResolvedValue({ description: "Descrição atualizada" });
  vi.mocked(actions.editTitleCard).mockResolvedValue({ title: "Título atualizado" });
  vi.mocked(actions.getCommentsByCardId).mockResolvedValue({ comments: [], nextCursor: null });


  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      intersectionCallbacks.push(callback);
    }
    readonly root = null;
    readonly rootMargin = "";
    readonly scrollMargin = "";
    readonly thresholds: number[] = [];
    observe() { }
    unobserve() { }
    disconnect() { }
    takeRecords() { return []; }
  };
});

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
};

describe("ModalEditCard", () => {
  it("não renderiza o modal quando está fechado", () => {
    renderModal({ isOpen: false });

    expect(screen.queryByRole("button", { name: "btn-close-modal" })).not.toBeInTheDocument();
  });

  it("mostra os campos e controles quando está aberto", () => {
    renderModal();

    expect(screen.getByRole("button", { name: "btn-close-modal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "btn-edit-title" })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "form-completed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "btn-edit-description" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "btn-add-comment" })).toBeInTheDocument();
  });

  it("fecha o modal ao clicar no botão de fechar", async () => {
    const user = userEvent.setup();
    const { setIsOpen } = renderModal();

    await user.click(screen.getByRole("button", { name: "btn-close-modal" }));

    expect(setIsOpen).toHaveBeenCalledWith(false);
  });
});

describe("TitleFieldComponent", () => {
  it("abre o formulário de edição do título", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "btn-edit-title" }));

    expect(screen.getByRole("form", { name: "form-edit-title" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "edit-title" })).toHaveValue(card.title);
  });

  it("envia o novo título para a action", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole("button", { name: "btn-edit-title" }));
    const titleInput = screen.getByRole("textbox", { name: "edit-title" });
    await user.clear(titleInput);
    await user.type(titleInput, "Título atualizado");

    await user.click(screen.getByRole("button", { name: "submit-edit-title" }));

    expect(actions.editTitleCard).toHaveBeenCalled();
    expect(vi.mocked(actions.editTitleCard).mock.calls[0][0]).toMatchObject({
      cardId: card.id,
      title: "Título atualizado",
    });
  });

  it("restaura o título anterior no cache quando a atualização falha", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.editTitleCard).mockRejectedValueOnce(new Error("Falha ao editar título"));
    const { queryClient } = renderModal();
    await user.click(screen.getByRole("button", { name: "btn-edit-title" }));
    const titleInput = screen.getByRole("textbox", { name: "edit-title" });
    await user.clear(titleInput);
    await user.type(titleInput, "Título temporário");
    await user.click(screen.getByRole("button", { name: "submit-edit-title" }));

    await waitFor(() => {
      expect(queryClient.getQueryData(["card", card.id])).toMatchObject({ title: card.title });
    });
  });

  it("mostra loading e desabilita submit enquanto a atualização está pendente", async () => {
    const user = userEvent.setup();
    const request = createDeferred<{ title: string }>();
    vi.mocked(actions.editTitleCard).mockReturnValueOnce(request.promise);
    renderModal();
    await user.click(screen.getByRole("button", { name: "btn-edit-title" }));
    await user.clear(screen.getByRole("textbox", { name: "edit-title" }));
    await user.type(screen.getByRole("textbox", { name: "edit-title" }), "Título pendente");
    await user.click(screen.getByRole("button", { name: "submit-edit-title" }));

    expect(await screen.findByRole("img", { name: "loading-spinner" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "submit-edit-title" })).toBeDisabled();
    request.resolve({ title: "Título pendente" });
  });
});

describe("CompletedFormButton", () => {
  it("mostra o estado atual e alterna ao enviar o formulário", async () => {
    const user = userEvent.setup();
    renderModal({ completed: false });

    const completedButton = screen.getByRole("button", { name: "btn-submit-completed-form" });
    expect(completedButton).toHaveTextContent("Não Concluído");

    await user.click(completedButton);

    expect(completedButton).toHaveTextContent("Concluído");
    expect(actions.ChangeCompletedCard).toHaveBeenCalledWith({ id: card.id });
  });

  it("reverte o estado visual e o cache quando a mutation falha", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.ChangeCompletedCard).mockRejectedValueOnce(new Error("Falha ao concluir"));
    const { queryClient } = renderModal({ completed: false });
    const completedButton = screen.getByRole("button", { name: "btn-submit-completed-form" });

    await user.click(completedButton);
    expect(completedButton).toHaveTextContent("Concluído");

    await waitFor(() => {
      expect(completedButton).toHaveTextContent("Não Concluído");
      expect(queryClient.getQueryData(["card", card.id])).toMatchObject({ completed: false });
    });
  });

  it("mostra loading e impede novas ações enquanto a mutation está pendente", async () => {
    const user = userEvent.setup();
    const request = createDeferred<typeof card>();
    vi.mocked(actions.ChangeCompletedCard).mockReturnValueOnce(request.promise);
    renderModal({ completed: false });
    const completedButton = screen.getByRole("button", { name: "btn-submit-completed-form" });

    await user.click(completedButton);

    expect(await screen.findByRole("img", { name: "loading-completed" })).toBeInTheDocument();
    expect(completedButton).toBeDisabled();
    request.resolve({ ...card, completed: true });
  });
});

describe("DescriptionFieldComponent", () => {
  it("abre o formulário com o valor atual da descrição", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "btn-edit-description" }));

    expect(screen.getByRole("form", { name: "form-edit-description" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "edit-description" })).toHaveValue(card.description);
  });

  it("envia a nova descrição para a action", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole("button", { name: "btn-edit-description" }));
    const descriptionInput = screen.getByRole("textbox", { name: "edit-description" });
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Descrição atualizada");

    await user.click(screen.getByRole("button", { name: "submit-edit-description" }));

    expect(actions.editDescriptionCard).toHaveBeenCalled();
    expect(vi.mocked(actions.editDescriptionCard).mock.calls[0][0]).toMatchObject({
      cardId: card.id,
      description: "Descrição atualizada",
    });
  });

  it("restaura a descrição anterior no cache quando a atualização falha", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.editDescriptionCard).mockRejectedValueOnce(new Error("Falha ao editar descrição"));
    const { queryClient } = renderModal();
    await user.click(screen.getByRole("button", { name: "btn-edit-description" }));
    const descriptionInput = screen.getByRole("textbox", { name: "edit-description" });
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Descrição temporária");
    await user.click(screen.getByRole("button", { name: "submit-edit-description" }));

    await waitFor(() => {
      expect(queryClient.getQueryData(["card", card.id])).toMatchObject({ description: card.description });
    });
  });

  it("mostra loading e desabilita submit enquanto a atualização está pendente", async () => {
    const user = userEvent.setup();
    const request = createDeferred<{ description: string }>();
    vi.mocked(actions.editDescriptionCard).mockReturnValueOnce(request.promise);
    renderModal();
    await user.click(screen.getByRole("button", { name: "btn-edit-description" }));
    await user.clear(screen.getByRole("textbox", { name: "edit-description" }));
    await user.type(screen.getByRole("textbox", { name: "edit-description" }), "Descrição pendente");
    await user.click(screen.getByRole("button", { name: "submit-edit-description" }));

    expect(await screen.findByRole("img", { name: "loading-spinner" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "submit-edit-description" })).toBeDisabled();
    request.resolve({ description: "Descrição pendente" });
  });
});

describe("CommentFieldComponent", () => {
  it("abre o formulário para adicionar um comentário", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "btn-add-comment" }));

    expect(screen.getByRole("form", { name: "form-add-comment" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "add-comment" })).toBeInTheDocument();
  });

  it("adiciona o comentário enviado", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole("button", { name: "btn-add-comment" }));
    await user.type(screen.getByRole("textbox", { name: "add-comment" }), "Novo comentário");

    await user.click(screen.getByRole("button", { name: "submit-add-comment" }));

    expect(actions.createCommentCard).toHaveBeenCalledWith(expect.objectContaining({
      body: "Novo comentário",
      cardId: card.id,
    }));
  });

  it("restaura a lista de comentários quando a criação falha", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.createCommentCard).mockRejectedValueOnce(new Error("Falha ao criar comentário"));
    const { queryClient } = renderModal({ comments: [ownComment] });
    const originalData = structuredClone(queryClient.getQueryData(cardComment(card.id)));
    await user.click(screen.getByRole("button", { name: "btn-add-comment" }));
    await user.type(screen.getByRole("textbox", { name: "add-comment" }), "Comentário temporário");
    await user.click(screen.getByRole("button", { name: "submit-add-comment" }));

    await waitFor(() => {
      expect(queryClient.getQueryData(cardComment(card.id))).toEqual(originalData);
    });
  });

  it("mostra loading e desabilita submit enquanto a criação está pendente", async () => {
    const user = userEvent.setup();
    const request = createDeferred<CardComment>();
    vi.mocked(actions.createCommentCard).mockReturnValueOnce(request.promise);
    renderModal();
    await user.click(screen.getByRole("button", { name: "btn-add-comment" }));
    await user.type(screen.getByRole("textbox", { name: "add-comment" }), "Comentário pendente");
    await user.click(screen.getByRole("button", { name: "submit-add-comment" }));

    expect(await screen.findByRole("img", { name: "loading-spinner" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "submit-add-comment" })).toBeDisabled();
    request.resolve(ownComment);
  });
});

describe("ListComments", () => {
  it("renderiza os comentários recebidos", () => {
    renderModal({ comments: [ownComment] });

    expect(screen.getByRole("listitem", { name: "item-comment" })).toHaveTextContent(ownComment.body);
    expect(screen.getByRole("button", { name: "btn-edit-form-comment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "btn-delete-form-comment" })).toBeInTheDocument();
  });

  it("mostra skeletons enquanto a consulta inicial dos comentários está carregando", async () => {
    vi.mocked(actions.getCommentsByCardId).mockReturnValueOnce(new Promise(() => {}));
    renderModal({ seedComments: false });

    expect(await screen.findAllByRole("listitem", { name: "item-skeleton-comment" })).toHaveLength(10);
  });

  it("mostra skeletons enquanto carrega a próxima página", async () => {
    vi.mocked(actions.getCommentsByCardId).mockReturnValueOnce(new Promise(() => {}));
    renderModal({ comments: [ownComment], nextCursor: "next-page" });

    await act(async () => {
      const observerCallback = intersectionCallbacks.at(-1);
      observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

    expect(await screen.findAllByRole("listitem", { name: "item-skeleton-comment" })).toHaveLength(10);
  });
});

describe("EditFormComment", () => {
  it("abre o formulário, permite editar o texto e envia", async () => {
    const user = userEvent.setup();
    renderModal({ comments: [ownComment] });

    await user.click(screen.getByRole("button", { name: "btn-edit-form-comment" }));

    const form = screen.getByRole("form", { name: "form-edit-form-comment" });
    const commentInput = screen.getByRole("textbox", { name: "edit-comment" });
    expect(form).toBeInTheDocument();
    expect(commentInput).toHaveValue(ownComment.body);

    await user.clear(commentInput);
    await user.type(commentInput, "Comentário editado");
    await user.click(screen.getByRole("button", { name: "submit-edit-form-comment" }));

    expect(actions.editCommentCard).toHaveBeenCalled();
    expect(vi.mocked(actions.editCommentCard).mock.calls[0][0]).toMatchObject({
      body: "Comentário editado",
      idComment: ownComment.id,
    });
  });

  it("restaura o comentário anterior no cache quando a edição falha", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.editCommentCard).mockRejectedValueOnce(new Error("Falha ao editar comentário"));
    const { queryClient } = renderModal({ comments: [ownComment] });
    const originalData = queryClient.getQueryData(cardComment(card.id));
    await user.click(screen.getByRole("button", { name: "btn-edit-form-comment" }));
    const commentInput = screen.getByRole("textbox", { name: "edit-comment" });
    await user.clear(commentInput);
    await user.type(commentInput, "Comentário temporário");
    await user.click(screen.getByRole("button", { name: "submit-edit-form-comment" }));

    await waitFor(() => {
      expect(queryClient.getQueryData(cardComment(card.id))).toEqual(originalData);
    });
  });

  it("mantém o formulário aberto e mostra loading durante a edição", async () => {
    const user = userEvent.setup();
    const request = createDeferred<{
      id: string;
      body: string;
      cardId: string;
    }>();
    vi.mocked(actions.editCommentCard).mockReturnValueOnce(request.promise);
    renderModal({ comments: [ownComment] });
    await user.click(screen.getByRole("button", { name: "btn-edit-form-comment" }));
    await user.clear(screen.getByRole("textbox", { name: "edit-comment" }));
    await user.type(screen.getByRole("textbox", { name: "edit-comment" }), "Comentário pendente");
    await user.click(screen.getByRole("button", { name: "submit-edit-form-comment" }));

    expect(await screen.findByRole("img", { name: "loading-edit-comment" })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "form-edit-form-comment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "submit-edit-form-comment" })).toBeDisabled();
    request.resolve({ id: ownComment.id, body: "Comentário pendente", cardId: card.id });
  });
});

describe("DeleteFormComment", () => {
  it("pede confirmação e cancela a exclusão", async () => {
    const user = userEvent.setup();
    renderModal({ comments: [ownComment] });

    await user.click(screen.getByRole("button", { name: "btn-delete-form-comment" }));

    expect(screen.getByRole("form", { name: "form-form-comment" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "cancel-delete-form-comment" }));

    expect(screen.queryByRole("form", { name: "form-form-comment" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "btn-delete-form-comment" })).toBeInTheDocument();
  });

  it("exclui o comentário após confirmar", async () => {
    const user = userEvent.setup();
    renderModal({ comments: [ownComment] });

    await user.click(screen.getByRole("button", { name: "btn-delete-form-comment" }));
    await user.click(screen.getByRole("button", { name: "submit-delete-form-comment" }));

    expect(actions.deleteCommentCard).toHaveBeenCalled();
    expect(vi.mocked(actions.deleteCommentCard).mock.calls[0][0]).toMatchObject({ id: ownComment.id });
  });

  it("restaura o comentário no cache quando a exclusão falha", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.deleteCommentCard).mockRejectedValueOnce(new Error("Falha ao excluir comentário"));
    const { queryClient } = renderModal({ comments: [ownComment] });
    expect(screen.getByRole("listitem", { name: "item-comment" })).toHaveTextContent(ownComment.body);
    await user.click(screen.getByRole("button", { name: "btn-delete-form-comment" }));
    await user.click(screen.getByRole("button", { name: "submit-delete-form-comment" }));

    await waitFor(() => {
      expect(queryClient.getQueryData<{ pages: Array<{ comments: CardComment[] }> }>(cardComment(card.id))
        ?.pages[0].comments).toEqual([ownComment]);
      expect(screen.getByRole("listitem", { name: "item-comment" })).toHaveTextContent(ownComment.body);
    });
  });

  it("remove o comentário otimisticamente enquanto a exclusão está pendente", async () => {
    const user = userEvent.setup();
    const request = createDeferred<void>();
    vi.mocked(actions.deleteCommentCard).mockReturnValueOnce(request.promise);
    renderModal({ comments: [ownComment] });
    await user.click(screen.getByRole("button", { name: "btn-delete-form-comment" }));
    await user.click(screen.getByRole("button", { name: "submit-delete-form-comment" }));

    await waitFor(() => {
      expect(screen.queryByRole("listitem", { name: "item-comment" })).not.toBeInTheDocument();
    });
    expect(vi.mocked(actions.deleteCommentCard).mock.calls[0][0]).toEqual({ id: ownComment.id });
    request.resolve();
  });
});
