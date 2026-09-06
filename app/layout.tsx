import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/layout/Header";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SGE - Conservatorio Nacional de Música",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Leemos las cookies de forma asíncrona (Next.js 15+)
  const cookieStore = await cookies();
  
  // Verificamos si existe el token para saber si está autenticado
  const token = cookieStore.get("token")?.value;
  const isAuthenticated = !!token;

  return (
    <html lang="es">
      <body className={`${inter.className} bg-white min-h-screen flex flex-col`}>
        
        <Header isAuthenticated={isAuthenticated} />
        
        <div className="flex flex-col flex-1">
          {children}
        </div>
        
      </body>
    </html>
  );
}