import { Url } from "next/dist/shared/lib/router/router"
import Link from "next/link"


type PropsType = { children: React.ReactNode, href: Url } & React.ComponentProps<'li'>

const BoardLink: React.FC<PropsType> = ({ children, href, ...props }) => {

    return (

        <li {...props} className={`flex flex-col h-30 w-full ${props.className}`}>
            <Link href={href} className={"w-full h-full rounded-sm flex flex-col gap-1 hover:scale-105 hover:-translate-y-1 duration-100 transition-transform"}>
                {children}
            </Link>

        </li>
    )

}

export default BoardLink
