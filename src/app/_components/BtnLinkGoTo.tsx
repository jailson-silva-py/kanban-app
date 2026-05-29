"use client";

import Link, { useLinkStatus } from "next/link"

type Iprops = {text:string} & React.ComponentProps<typeof Link>

const BtnGoToHome:React.FC<Iprops> =  ({children, text, ...props}) => {

    const { pending } = useLinkStatus()

    return (
    <Link {...props} prefetch className={`btn-md btn-primary font-light text-xs duration-300 ${props.className}`}>
    {children}
    {pending? "Aguarde...":text}
    </Link>
    )

}

export default BtnGoToHome
