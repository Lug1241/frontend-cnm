"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  isAuthenticated: boolean;
  userName?: string;
  userRole?: string;
}

export default function Header({ 
  isAuthenticated = false, 
  userName = "Usuario", 
  userRole = "Rol" 
}: HeaderProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Si usas localStorage como respaldo
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    
    // Limpiamos las cookies para que el servidor (layout) detecte el cierre de sesión
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "type=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "rol=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "nombre=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    setDropdownOpen(false);
    window.location.href = "/";
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

          {/* Menú de Usuario con Dropdown */}
          {isAuthenticated && (
            <div className="relative">
              {/* Botón Hamburguesa */}
              <button 
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="text-white hover:text-gray-200 focus:outline-none p-1 flex items-center justify-center transition-colors"
                aria-label="Abrir menú de usuario"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Dropdown Box */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                    {/* Avatar circular con la inicial */}
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[#00408a] font-bold text-sm">
                      {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </div>
                    {/* Info del usuario */}
                    <div className="flex flex-col overflow-hidden">
                      <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
                      <p className="text-xs text-gray-500 capitalize truncate">{userRole}</p>
                    </div>
                  </div>
                  
                  {/* Botón Cerrar Sesión */}
                  <div className="px-4 py-2 mt-1">
                    <button 
                      onClick={handleLogout}
                      className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-medium py-2 rounded-md transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}