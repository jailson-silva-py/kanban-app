"use client";
import * as z from "zod";
import {
  ChangeEvent,
  SubmitEventHandler,
  SubmitEvent,
  useReducer,
  useTransition,
  useEffect,
} from "react";
import { verifyUserExistsByEmail } from "@/actions/actions";
import { signIn } from "next-auth/react";
import { emailType, passwordType, usernameType } from "@/types/FormsZodType";
import LoadingSpinner from "./LoadingSpinner";
import { InvalidCredentialsError, InvalidMethodAccessError } from "@/types/AuthErrors";
import { toast } from "@/app/util/toast";

interface StateFormType {
  step: number;
  email: string;
  password: string;
  name: string;
  errors: string[] | [];
  emailExists: boolean;
  decrement: number;
}

type ActionType =
  | { type: "next_step" }
  | { type: "change_email"; payload: string }
  | { type: "change_password"; payload: string }
  | { type: "change_email_exists" }
  | { type: "change_name"; payload: string };

const fieldsForm = {
  email: "",
  password: "",
  name: "",
};

const fieldsFormLength = Object.keys(fieldsForm).length;

const TextInputs: { [key: number]: string } = {
  0: "Email: ",
  1: "Senha: ",
  2: "Usuário: ",
};

const initialState: StateFormType = {
  step: 0,
  errors: [],
  emailExists: false,
  decrement: 1,
  ...fieldsForm,
};

function reducer(prevState: StateFormType, action: ActionType): StateFormType {
  switch (action.type) {
    case "next_step":
      const newStep =
        prevState.step >= 0 &&
        prevState.step < fieldsFormLength - prevState.decrement
          ? prevState.step + 1
          : prevState.step;

      return { ...prevState, step: newStep };

    case "change_email":
      const objEmailVerify = emailType.safeParse(action.payload);
      const state_email: StateFormType = {
        ...prevState,
        emailExists:false,
        email: action.payload,
        errors: [],
      };

      if (!objEmailVerify.success) {
        state_email.errors = z.formatError(objEmailVerify.error)._errors;
      }

      return state_email;

    case "change_password":
      const objPassVerify = passwordType.safeParse(action.payload);
      const statePass: StateFormType = {
        ...prevState,
        password: action.payload,
        errors: [],
      };

      if (!objPassVerify.success) {
        statePass.errors = z.formatError(objPassVerify.error)._errors;
      }

      return statePass;

    case "change_email_exists":
      const stateExists = { ...prevState, emailExists: !prevState.emailExists };

      return stateExists;

    case "change_name":
      const objNameVerify = usernameType.safeParse(action.payload);
      const state_name: StateFormType = {
        ...prevState,
        name: action.payload,
        errors: [],
      };

      if (!objNameVerify.success) {
        state_name.errors = z.formatError(objNameVerify.error)._errors;
      }

      return state_name;

    default:
      return prevState;
  }
}
interface AuthenticationFormProps {

  isSignIn: boolean;

}
const LoginForm: React.FC<AuthenticationFormProps> = ({isSignIn=false}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pending, startTransition] = useTransition();

  const handlerEmail = (e: ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: "change_email", payload: e.target.value });
  const handlePassword = (e: ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: "change_password", payload: e.target.value });
  const handlerUsername = (e: ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: "change_name", payload: e.target.value });

  const submitLogin: SubmitEventHandler = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (state.step === 0 && state.email) {
      startTransition(async () => {
        const exists = await verifyUserExistsByEmail(state.email);

        if (exists) {
          dispatch({ type: "change_email_exists" })
        }
        if (exists && isSignIn) return
        dispatch({ type: "next_step" });

      });

    } else if (
      state.email &&
      state.password
    ) {
      if (isSignIn) {

        if (!state.name) {
          dispatch({ type: "next_step" })
          return
        }
        const objSignIn = {
          name: state.name,
          password: state.password,
          email: state.email,
        };
        startTransition(async () => signIn("credentials-signin", { ...objSignIn }));
        return

      }

      const objLogIn = { password: state.password, email: state.email }
      startTransition(async () => {
        signIn("credentials-login", { ...objLogIn }).catch((err) => {

          if (err instanceof InvalidCredentialsError) toast.error("Email ou senha incorreta, tente novamente")
          if (err instanceof InvalidMethodAccessError) toast.error("Tente usar outro método de login")
          throw new Error(err)

        })
      });
      return;
    }

  };


  const inputsStep = [
    <input
      key={1}
      type="text"
      name="email"
      id="credentials-email"
      value={state.email}
      onChange={handlerEmail}
      placeholder="Insira seu Email"
      className="default-input focus-primary w-full"
      required
    />,
    <input
      key={2}
      type="password"
      name="password"
      id="credentials-password"
      value={state.password}
      onChange={handlePassword}
      placeholder="Insira sua Senha"
      className="default-input focus-primary w-full"
      required
    />
    ,
    <input
      key={3}
      type="text"
      name="name"
      id="credentials-text"
      value={state.name}
      onChange={handlerUsername}
      placeholder="Informe seu nome de usuário"
      className="default-input focus-primary w-full"
      required
    />,

  ];

  return (
    <form
      className="flex flex-col gap-4 w-full"
      onSubmit={submitLogin}
    >
      <label className="flex flex-col gap-2">
        <h4 className="text-sm">{TextInputs[state.step] as string}</h4>
        {/*Aparece o input de acordo com a etapa atual do formulário*/}
        {inputsStep[state.step]}

        <div className="flex flex-col gap-1 text-xs text-error">
          {isSignIn && state.emailExists && <small className="animate-hidden">Email não disponível para cadastro.</small>}
          {state.errors.map((error, i) => (
            <small key={i}>* {error}</small>
          ))}
        </div>
      </label>

      <button
        type="submit"
        className="default-btn w-full btn-md btn-primary"
        disabled={pending || state.errors.length > 0}
      >
        {state.step < fieldsFormLength - (isSignIn ? 0:1) ?
          !pending ? <span>Continuar</span> : <LoadingSpinner/>
         :
        !pending ? isSignIn ? <span>Sign In</span>: <span>Log In</span> : <LoadingSpinner/>
        }
      </button>
    </form>
  );
};

export default LoginForm;
