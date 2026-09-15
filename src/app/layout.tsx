import type { Metadata } from "next";
import { Geist, Rethink_Sans, Marck_Script } from "next/font/google";
import "./globals.css";
import Menu from "@/components/Menu";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/providers/QueryPovider";
import { Toaster } from "@/components/Toaster";
import { appleIconsList, iconsList } from "@/constrants/icons";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400","500", "600", "700"],
});

const rethink_sans = Rethink_Sans({
  variable: "--font-rethink",
  subsets: ["latin"],
  weight: ["400", "600","500", "700"],
});

const marck_script = Marck_Script({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-marck-script",
});

export const metadata: Metadata = {
  title: "Krux | Kanban — Otimize sua produtividade com o melhor",
  description: "Otimize sua produtividade com um board Kanban profissional, elegante e focado em execução. Gerencie projetos, acompanhe metas e entregue mais rápido.",
  icons: {
    icon: iconsList,
    apple: appleIconsList,
  },
  robots: {
    index: true,
    follow:true,
  },
  openGraph: {
    title: "Krux | Kanban - O ápice da produtividade em equipe",
    description: "Kanban colaborativo em tempo real. Organize tarefas sem distrações. Trabalhe com seu time sincronizado.",
    type:"website",
    images: [
      {
        url: "/open_graph.jpeg",
        width: 1200,
        height: 630,
      }
    ]

  },
  keywords:["kanban", "board", "produtividade", "gerenciamento", "projetos"],
  alternates: {
    canonical: process.env.NODE_ENV === "production" ? process.env.AUTH_URL : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body
        className={`${geistSans.variable} ${rethink_sans.variable} ${marck_script.variable} antialiased`}>
        <SessionProvider>
          <QueryProvider>
            <Menu />
            {children}
          </QueryProvider>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
