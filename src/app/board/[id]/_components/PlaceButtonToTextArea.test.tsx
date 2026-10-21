import { renderWithProviders } from "@/app/util/testImplementations";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaceButtonToTextArea } from "./PlaceButtonToTextArea";

const defaultProps = {
  defaultValue: "Descrição inicial",
  name: "description",
  onSubmit: () => {},
  placeholder: "Descreva a tarefa",
  textBtn: "Adicionar descrição",
};

describe("PlaceButtonToTextArea", () => {
  it("mostra apenas o botão inicialmente", () => {
    renderWithProviders(<PlaceButtonToTextArea {...defaultProps} />);

    expect(screen.getByRole("button", { name: "btn-description" })).toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "form-description" })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "description" })).not.toBeInTheDocument();
  });

  it("mostra o formulário com textarea ao clicar no botão", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlaceButtonToTextArea {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "btn-description" }));

    expect(screen.getByRole("form", { name: "form-description" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "description" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "btn-description" })).not.toBeInTheDocument();
  });

  it("aplica as props nos elementos correspondentes", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlaceButtonToTextArea {...defaultProps} />);

    const initialButton = screen.getByRole("button", { name: "btn-description" });
    expect(initialButton).toHaveTextContent(defaultProps.textBtn);

    await user.click(initialButton);

    const textarea = screen.getByRole("textbox", { name: defaultProps.name }) as HTMLTextAreaElement;
    expect(textarea.name).toBe(defaultProps.name);
    expect(textarea.defaultValue).toBe(defaultProps.defaultValue);
    expect(textarea.placeholder).toBe(defaultProps.placeholder);
  });

  it("mostra os botões de cancelar e submit com os tipos corretos", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlaceButtonToTextArea {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "btn-description" }));

    const cancelButton = screen.getByRole("button", { name: "cancel-description" }) as HTMLButtonElement;
    const submitButton = screen.getByRole("button", { name: "submit-description" }) as HTMLButtonElement;

    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton.type).toBe("reset");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton.type).toBe("submit");
  });

  it("chama onSubmit ao enviar o formulário", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<PlaceButtonToTextArea {...defaultProps} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "btn-description" }));
    await user.click(screen.getByRole("button", { name: "submit-description" }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("mostra o spinner e desabilita submit enquanto onSubmit está pendente", async () => {
    const user = userEvent.setup();
    const onSubmit = () => new Promise<void>(() => {});
    renderWithProviders(<PlaceButtonToTextArea {...defaultProps} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "btn-description" }));
    await user.click(screen.getByRole("button", { name: "submit-description" }));

    expect(await screen.findByRole("img", { name: "loading-spinner" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "submit-description" })).toBeDisabled();
  });

  it("fecha o formulário ao cancelar e mostra novamente o botão inicial", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlaceButtonToTextArea {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "btn-description" }));
    await user.click(screen.getByRole("button", { name: "cancel-description" }));

    expect(screen.queryByRole("form", { name: "form-description" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "btn-description" })).toHaveTextContent(defaultProps.textBtn);
  });
});
