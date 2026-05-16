import LoginForm from "@/components/LoginForm";
import { signIn } from "auth"

const LoginPage = async () => {


    return (
    
    <div className="flex justify-center items-center h-[calc(100vh-60px)] w-screen p-4 tracking-widest">
    <div className="p-8 flex flex-col items-center gap-4 w-4/10 h-7/10 min-w-85 shadow-default shadow-shadow rounded-lg">
        
        <form action={async () => {
            "use server";
            await signIn("google");
            }} className="mt-20 min-w-75 w-7/10 h-10">
        <button className="w-full h-full hover:bg-shadow default-button">
            Faça Login com o Google
        </button>
        </form>

        <LoginForm/>

        <h2></h2>

        

    </div>

    </div>

    )

}

export default LoginPage