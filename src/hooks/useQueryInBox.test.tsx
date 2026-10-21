import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { card, inBoxCards } from "@/constrants/queryKeys";
import { InBoxClient } from "@/types/clientDataTypes";
import { createCard } from "@/app/util/testImplementations";
import { useQueryInBox } from "./useQueryInBox";

const createQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: Infinity } },
});

const renderInBoxHook = (queryClient: QueryClient) => renderHook(() => useQueryInBox(), {
  wrapper: ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  ),
});

const inBox: InBoxClient = {
  id: "inbox-1",
  title: "InBox",
  order: 100,
  cardIds: ["card-1", "card-2"],
};

describe("useQueryInBox", () => {
  describe("getInBox", () => {
    it("retorna null quando o InBox não está no cache", () => {
      const { result } = renderInBoxHook(createQueryClient());

      expect(result.current.getInBox()).toBeNull();
    });

    it("retorna os dados do InBox do cache", () => {
      const queryClient = createQueryClient();
      queryClient.setQueryData(inBoxCards, inBox);
      const { result } = renderInBoxHook(queryClient);

      expect(result.current.getInBox()).toEqual(inBox);
    });
  });

  describe("getCardsFromInBox", () => {
    it("retorna null quando o InBox não está no cache", () => {
      const { result } = renderInBoxHook(createQueryClient());

      expect(result.current.getCardsFromInBox()).toBeNull();
    });

    it("retorna os cards na ordem dos ids e ignora ids ou cards ausentes", () => {
      const queryClient = createQueryClient();
      const firstCard = createCard({ id: "card-1" });
      const lastCard = createCard({ id: "card-3", position: 300 });
      queryClient.setQueryData<InBoxClient>(inBoxCards, {
        ...inBox,
        cardIds: ["card-1", "", "missing-card", "card-3"],
      });
      queryClient.setQueryData(card("card-1"), firstCard);
      queryClient.setQueryData(card("card-3"), lastCard);
      const { result } = renderInBoxHook(queryClient);

      expect(result.current.getCardsFromInBox()).toEqual([firstCard, lastCard]);
    });

    it("retorna uma lista vazia quando o InBox não tem cards", () => {
      const queryClient = createQueryClient();
      queryClient.setQueryData<InBoxClient>(inBoxCards, { ...inBox, cardIds: [] });
      const { result } = renderInBoxHook(queryClient);

      expect(result.current.getCardsFromInBox()).toEqual([]);
    });
  });

  describe("setInBox", () => {
    it("mescla parcialmente os dados sem perder os campos não alterados", () => {
      const queryClient = createQueryClient();
      queryClient.setQueryData(inBoxCards, inBox);
      const { result } = renderInBoxHook(queryClient);

      result.current.setInBox({ title: "Nova caixa", cardIds: ["card-3"] });

      expect(queryClient.getQueryData(inBoxCards)).toEqual({
        ...inBox,
        title: "Nova caixa",
        cardIds: ["card-3"],
      });
    });

    it("não cria o InBox se ele ainda não existe no cache", () => {
      const queryClient = createQueryClient();
      const { result } = renderInBoxHook(queryClient);

      result.current.setInBox({ title: "Nova caixa" });

      expect(queryClient.getQueryData(inBoxCards)).toBeUndefined();
    });
  });

  describe("createCardInBox", () => {
    it("insere o card no início da lista e armazena o card individual", () => {
      const queryClient = createQueryClient();
      queryClient.setQueryData(inBoxCards, inBox);
      const { result } = renderInBoxHook(queryClient);
      const newCard = createCard({ id: "card-3" });

      result.current.createCardInBox(newCard);

      expect(queryClient.getQueryData<InBoxClient>(inBoxCards)?.cardIds).toEqual([
        "card-3",
        "card-1",
        "card-2",
      ]);
      expect(queryClient.getQueryData(card("card-3"))).toEqual(newCard);
    });

    it("não cria um card quando o InBox não existe", () => {
      const queryClient = createQueryClient();
      const { result } = renderInBoxHook(queryClient);

      result.current.createCardInBox(createCard({ id: "card-3" }));

      expect(queryClient.getQueryData(inBoxCards)).toBeUndefined();
      expect(queryClient.getQueryData(card("card-3"))).toBeUndefined();
    });
  });

  describe("removeCardInBox", () => {
    it("remove o card da lista e do cache individual", () => {
      const queryClient = createQueryClient();
      queryClient.setQueryData(inBoxCards, inBox);
      queryClient.setQueryData(card("card-1"), createCard({ id: "card-1" }));
      const { result } = renderInBoxHook(queryClient);

      result.current.removeCardInBox("card-1");

      expect(queryClient.getQueryData<InBoxClient>(inBoxCards)?.cardIds).toEqual(["card-2"]);
      expect(queryClient.getQueryData(card("card-1"))).toBeUndefined();
    });

    it("mantém a lista quando o id não pertence ao InBox e ainda remove seu cache individual", () => {
      const queryClient = createQueryClient();
      queryClient.setQueryData(inBoxCards, inBox);
      queryClient.setQueryData(card("card-extra"), createCard({ id: "card-extra" }));
      const { result } = renderInBoxHook(queryClient);

      result.current.removeCardInBox("card-extra");

      expect(queryClient.getQueryData<InBoxClient>(inBoxCards)?.cardIds).toEqual(inBox.cardIds);
      expect(queryClient.getQueryData(card("card-extra"))).toBeUndefined();
    });

    it("remove o card do cache mesmo que o InBox não esteja armazenado", () => {
      const queryClient = createQueryClient();
      queryClient.setQueryData(card("card-1"), createCard({ id: "card-1" }));
      const { result } = renderInBoxHook(queryClient);

      result.current.removeCardInBox("card-1");

      expect(queryClient.getQueryData(inBoxCards)).toBeUndefined();
      expect(queryClient.getQueryData(card("card-1"))).toBeUndefined();
    });
  });

  describe("removeCardsInBoxById", () => {
    it("remove vários ids do InBox e remove do cache os cards encontrados", () => {
      const queryClient = createQueryClient();
      queryClient.setQueryData<InBoxClient>(inBoxCards, {
        ...inBox,
        cardIds: ["card-1", "card-2", "card-3"],
      });
      queryClient.setQueryData(card("card-1"), createCard({ id: "card-1" }));
      queryClient.setQueryData(card("card-2"), createCard({ id: "card-2" }));
      queryClient.setQueryData(card("card-3"), createCard({ id: "card-3" }));
      const { result } = renderInBoxHook(queryClient);

      result.current.removeCardsInBoxById(["card-1", "missing-card", "card-3"]);

      expect(queryClient.getQueryData<InBoxClient>(inBoxCards)?.cardIds).toEqual(["card-2"]);
      expect(queryClient.getQueryData(card("card-1"))).toBeUndefined();
      expect(queryClient.getQueryData(card("card-2"))).toBeDefined();
      expect(queryClient.getQueryData(card("card-3"))).toBeUndefined();
    });

    it("ignora a lista vazia sem alterar o cache", () => {
      const queryClient = createQueryClient();
      queryClient.setQueryData(inBoxCards, inBox);
      queryClient.setQueryData(card("card-1"), createCard({ id: "card-1" }));
      const { result } = renderInBoxHook(queryClient);

      result.current.removeCardsInBoxById([]);

      expect(queryClient.getQueryData(inBoxCards)).toEqual(inBox);
      expect(queryClient.getQueryData(card("card-1"))).toBeDefined();
    });

    it("atualiza o InBox mesmo quando ele não possui cache e não cria os cards removidos", () => {
      const queryClient = createQueryClient();
      const { result } = renderInBoxHook(queryClient);

      result.current.removeCardsInBoxById(["missing-card"]);

      expect(queryClient.getQueryData(inBoxCards)).toBeUndefined();
      expect(queryClient.getQueryData(card("missing-card"))).toBeUndefined();
    });
  });
});
