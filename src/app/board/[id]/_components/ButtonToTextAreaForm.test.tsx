import { renderWithProviders } from "@/app/util/testImplementations"
import { ButtonToTextAreaForm } from "./ButtonToTextAreaForm"
import userEvent from "@testing-library/user-event"

describe("O elemento está com tudo presente", () => {
  it("Aparece o botão inicialmente", () => {

    const screen = renderWithProviders(<ButtonToTextAreaForm defaultValue="" name="edit" onSubmit={() => { }} placeholder="" />)
    const button = screen.getByRole("button", { name: "btn-edit" });
    expect(button).toBeInTheDocument();

  })
  it("Ao clicar no botão aparece o formulário com o textarea", async () => {

    const user = userEvent.setup();
    const screen = renderWithProviders(<ButtonToTextAreaForm defaultValue="" name="edit" onSubmit={() => { }} placeholder="" />)
    const button = screen.getByRole("button", { name: "btn-edit" });
    expect(button).toBeInTheDocument();
    await user.click(button);
    const textarea = screen.getByRole("textbox", { name: "edit" });
    const form = screen.getByRole("form", { name: "form-edit" });

    expect(textarea).toBeInTheDocument();
    expect(form).toBeInTheDocument();

  })

  it("o name do textarea é colocado corretamente", async () => {

    const user = userEvent.setup();
    const screen = renderWithProviders(<ButtonToTextAreaForm defaultValue="" name="edit" onSubmit={() => { }} placeholder="" />)
    const button = screen.getByRole("button", { name: "btn-edit" });

    expect(button).toBeInTheDocument();

    await user.click(button);
    const textarea = screen.getByRole("textbox", { name: "edit" }) as HTMLTextAreaElement;

    expect(textarea).toBeInTheDocument();
    expect(textarea.name).toBe("edit");

  })


  it("Possui um botão de cancelar('reset') e um botão de salvar('submit')", async () => {

    const user = userEvent.setup();
    const screen = renderWithProviders(<ButtonToTextAreaForm defaultValue="" name="edit" onSubmit={() => { }} placeholder="" />)
    const button = screen.getByRole("button", { name: "btn-edit" });
    expect(button).toBeInTheDocument();

    await user.click(button);

    const submit = screen.getByRole("button", { name: "submit-edit" }) as HTMLButtonElement;
    const cancelBtn = screen.getByRole("button", { name: "cancel-edit" }) as HTMLButtonElement;

    expect(submit.type).toBe("submit");
    expect(cancelBtn.type).toBe("reset");

    expect(submit).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();


  })

  it("Os valores de defaultValue e de placeholder são colocados corretamente no textarea", async () => {

    const user = userEvent.setup();
    const placeholder = "Descreva em detalhes algo muito bacana..."
    const defaultValue = "Valor default no azeite. Pode editar"
    const screen = renderWithProviders(<ButtonToTextAreaForm defaultValue={defaultValue} name="edit" onSubmit={() => { }} placeholder={placeholder} />)
    const button = screen.getByRole("button", { name: "btn-edit" });
    expect(button).toBeInTheDocument();

    await user.click(button);

    const textarea = screen.getByRole("textbox", { name: "edit" }) as HTMLTextAreaElement;

    expect(textarea).toBeInTheDocument();
    expect(textarea.placeholder).toBe(placeholder);
    expect(textarea.defaultValue).toBe(defaultValue);

  })

})

describe("O componente se comporta como deveria", () => {

  it("O onSubmit é chamado quando o botão de submit é clickado", async () => {

    const user = userEvent.setup();
    const placeholder = "Descreva em detalhes algo muito bacana..."
    const defaultValue = "Valor default no azeite. Pode editar"
    const mock = vi.fn()
    const screen = renderWithProviders(<ButtonToTextAreaForm defaultValue={defaultValue} name="edit" onSubmit={mock} placeholder={placeholder} />)
    const button = screen.getByRole("button", { name: "btn-edit" });
    expect(button).toBeInTheDocument();

    await user.click(button);

    const submit = screen.getByRole("button", { name: "submit-edit" })

    expect(submit).toBeInTheDocument();

    await user.click(submit);

    expect(mock).toHaveBeenCalled();

  })

  it("O aparece o svg de loading quando o botão de submit é clickado.", async () => {

    const user = userEvent.setup();
    const placeholder = "Descreva em detalhes algo muito bacana..."
    const defaultValue = "Valor default no azeite. Pode editar"
    const screen = renderWithProviders(<ButtonToTextAreaForm defaultValue={defaultValue} name="edit" onSubmit={() => new Promise(() => { })}
      placeholder={placeholder} />)
    const button = screen.getByRole("button", { name: "btn-edit" });
    expect(button).toBeInTheDocument();

    await user.click(button);

    const submit = screen.getByRole("button", { name: "submit-edit" });

    expect(submit).toBeInTheDocument();

    await user.click(submit);

    const svg = await screen.findByRole("img", { name: "loading-spinner" });

    expect(svg).toBeInTheDocument();

  })

  it("O botão submit fica desabilitado enquanto a promise não é resolvida", async () => {

    const user = userEvent.setup();
    const placeholder = "Descreva em detalhes algo muito bacana..."
    const defaultValue = "Valor default no azeite. Pode editar"
    const screen = renderWithProviders(<ButtonToTextAreaForm defaultValue={defaultValue} name="edit" onSubmit={() => new Promise(() => { })}
      placeholder={placeholder} />)
    const button = screen.getByRole("button", { name: "btn-edit" });
    expect(button).toBeInTheDocument();

    await user.click(button);

    const submit = screen.getByRole("button", { name: "submit-edit" });

    expect(submit).toBeInTheDocument();

    await user.click(submit);

    const pendingSubmit = await screen.findByRole("button", { name: "submit-edit" }) as HTMLButtonElement;

    expect(pendingSubmit).toBeInTheDocument();
    expect(pendingSubmit.disabled).toBe(true);

  })

  it("Quando o botão de cancelar é clickado, o formulário some", async () => {

    const user = userEvent.setup();
    const placeholder = "Descreva em detalhes algo muito bacana..."
    const defaultValue = "Valor default no azeite. Pode editar"
    const screen = renderWithProviders(<ButtonToTextAreaForm defaultValue={defaultValue} name="edit" onSubmit={() => { }}
      placeholder={placeholder} />)
    const button = screen.getByRole("button", { name: "btn-edit" });
    expect(button).toBeInTheDocument();

    await user.click(button);

    const form = screen.getByRole("form", { name: "form-edit" })

    const cancelButton = screen.getByRole("button", { name: "cancel-edit" });

    expect(cancelButton).toBeInTheDocument();

    await user.click(cancelButton);



  })

})