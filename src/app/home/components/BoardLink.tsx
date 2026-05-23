import { Url } from "next/dist/shared/lib/router/router"
import Link from "next/link"


type PropsType = { children: React.ReactNode, href:Url } & React.ComponentProps<'li'>

const BoardLink:React.FC<PropsType> = ({children, href, ...props}) => {

    return (

    <li className="flex flex-col w-full h-37.5" {...props}>
        <Link href={href} className={"w-full h-8/10 rounded-sm flex flex-col gap-1 hover:scale-105 hover:-translate-y-1 duration-100 transition-transform"}>
            {children}
        </Link>

    </li>
)

}

export default BoardLink
