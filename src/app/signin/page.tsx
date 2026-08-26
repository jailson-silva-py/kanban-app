import LoginForm from "@/components/LoginForm";
import { Separator } from "@/components/Separator";
import { signIn } from "auth"
import Link from "next/link";

const SignIn = async () => {

  const SignIn = async () => {
      "use server";
    await signIn("google", {redirectTo:"/home"});

  }
    return (
        <div className="min-w-25 w-9/10 h-90 flex flex-col items-center justify-center gap-4">

        <form action={SignIn} className="h-10 w-full">
        <button className="default-btn btn-secondary btn-md w-full">
            Faça Login com o Google
        </button>
        </form>
        <Separator/>
          <LoginForm isSignIn={ true } />
          <span className="text-xs mx-auto">Já possui uma conta? <Link className="underline" href={"/login"}>Entrar</Link></span>
        </div>
    )

}

export default SignIn
