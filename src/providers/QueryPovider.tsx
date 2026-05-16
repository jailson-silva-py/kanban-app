"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({

    defaultOptions:{
        queries:{
            staleTime: 1000 * 60 * 30,
            gcTime: 1000 * 60 * 5,
        }
    }

})

interface Iprops  {

    children:React.ReactNode

}

export const QueryProvider = ({children}:Iprops) => {

    return (
    <QueryClientProvider client={queryClient}>
        {children}
    <ReactQueryDevtools initialIsOpen={false}/>
    </QueryClientProvider>
    )

}