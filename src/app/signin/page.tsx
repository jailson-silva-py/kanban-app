import LoginForm from "@/components/LoginForm";
import { Separator } from "@/components/Separator";
import { signIn } from "auth"
import Link from "next/link";

const SignIn = async () => {

  const onSignOrLongIn = async () => {
      "use server";
      await signIn("google");

  }
    return (

    <div className="flex justify-center items-center h-[calc(100vh-60px)] w-screen p-4 tracking-wider font-geist">
    <div className="p-8 flex items-center justify-center max-w-93.75 max-h-93.75 w-[90vw] shadow-default shadow-shadow rounded-sm">
        <div className="min-w-25 w-9/10 h-90 flex flex-col items-center justify-center gap-4">

        <form action={onSignOrLongIn} className="h-10 w-full">
        <button className="default-btn btn-secondary btn-md w-full">
            Faça Login com o Google
        </button>
        </form>
        <Separator/>
            <LoginForm isSignIn={ true } />
          <span className="text-xs mx-auto">Já possui uma conta? <Link className="underline" href={"/login"}>Entrar</Link></span>
        </div>


        <h2></h2>



    </div>

    </div>

    )

}

export default SignIn
