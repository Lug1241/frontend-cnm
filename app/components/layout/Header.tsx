"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Usuario {
  primer_nombre?: string;
  primer_apellido?: string;
  rol?: string;
  tipo?: string;
}

interface HeaderProps {
  isAuthenticated?: boolean;
  usuario?: Usuario | null;
}

export default function Header({ isAuthenticated = false, usuario = null }: HeaderProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    router.push("/");
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const displayName = usuario ? `${usuario.primer_nombre || ""} ${usuario.primer_apellido || ""}` : "";
  const displayRole = usuario?.rol === "docente" && usuario?.tipo ? usuario.tipo : usuario?.rol || "";

  return (
    <header className="bg-[#00408a] w-full min-h-14 py-2 px-4 sm:px-5 flex justify-center sticky top-0 z-50">
      <div className="w-full max-w-7xl flex justify-between items-center gap-4 flex-wrap">
        
        {/* Izquierda: Logo y Título */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h1 className="font-bold text-white text-lg sm:text-xl md:text-2xl whitespace-nowrap overflow-hidden text-ellipsis m-0 text-center sm:text-left w-full sm:w-auto">
            SISTEMA DE GESTIÓN ESTUDIANTIL
          </h1>
        </div>

        {/* Derecha: Versión, Fecha y Menú (si está autenticado) */}
        <div className="flex items-center gap-4 shrink-0 justify-end flex-1 sm:flex-none">
          <p className="hidden sm:block text-[#E3F2FD] text-xs md:text-sm m-0 whitespace-nowrap">
            SGE v. 1.0.0
          </p>
          <p className="hidden md:block text-[#E3F2FD] text-xs md:text-sm m-0 whitespace-nowrap">
            {getCurrentDate()}
          </p>

          {isAuthenticated && (
            <div className="relative inline-block">
              <button 
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="text-white text-2xl p-1 hover:scale-110 transition-transform cursor-pointer"
              >
                ☰
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg w-60 p-4 flex flex-col gap-4 z-50 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-[#00408a] font-bold">
                      {displayName.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#00408a] text-sm">{displayName}</span>
                      <span className="text-gray-500 text-xs capitalize">{displayRole}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition-colors font-medium text-sm cursor-pointer"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}