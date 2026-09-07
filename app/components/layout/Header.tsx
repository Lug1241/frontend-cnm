"use client";
import { useState } from "react";

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

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    
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
    <header className="bg-[#00408a] w-full h-16 px-6 flex items-center justify-between sticky top-0 z-50 shadow-md">
      
      {/* Izquierda: Título Principal */}
      <div className="flex items-center">
        <h1 className="font-bold text-white text-base sm:text-xl tracking-wide whitespace-nowrap m-0">
          SISTEMA DE GESTIÓN ESTUDIANTIL
        </h1>
      </div>

      {/* Derecha: Versión, Fecha y Menú de Usuario */}
      <div className="flex items-center gap-6">
        <span className="hidden sm:inline-block text-[#E3F2FD] text-xs sm:text-sm font-medium tracking-wide">
          SGE v. 1.0.0
        </span>
        <span className="hidden md:inline-block text-[#E3F2FD] text-xs sm:text-sm font-medium tracking-wide">
          {getCurrentDate()}
        </span>

        {/* Menú de Usuario con Dropdown */}
        {isAuthenticated && (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="text-white hover:text-gray-200 focus:outline-none p-1.5 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Abrir menú de usuario"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Dropdown Box */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-2 border border-gray-100 z-50">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#00408a] font-bold text-sm shrink-0">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
                    <p className="text-xs text-gray-500 capitalize truncate">{userRole}</p>
                  </div>
                </div>
                
                <div className="px-3 py-2 mt-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-medium py-2 rounded-md transition-colors shadow-sm"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}