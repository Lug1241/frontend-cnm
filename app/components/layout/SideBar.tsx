"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SYSTEM_MODULES, UserType, filterModulesByUser ,UserRole} from "@/app/config/menu.config";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface SidebarProps {
  userType: UserType;
  userRole: UserRole;
}

export default function Sidebar({ userType, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  
  // 1. Estado para controlar si la barra lateral está colapsada o expandida
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Ocultar el Sidebar si estamos en la vista de Módulos (inicio)
  if (pathname === "/dashboard") return null;

  const allowedModules = filterModulesByUser(SYSTEM_MODULES, userType, userRole);

  const toggleAccordion = (id: string) => {
    // Si está colapsado, no abrimos acordeones en línea
    if (isCollapsed) return;
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <aside 
      className={`bg-[#00408a] min-h-screen text-white flex-shrink-0 shadow-xl transition-all duration-300 ease-in-out hidden md:flex md:flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* HEADER DEL SIDEBAR: Título/Menú + Botón de Colapsar */}
      <div className="flex items-center justify-between p-4 border-b border-white/20 h-16">
        {!isCollapsed && (
          <span className="font-bold text-lg truncate">
            Menú Principal
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-white/10 text-white transition-colors mx-auto"
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? (
            <MdChevronRight className="w-6 h-6" />
          ) : (
            <MdChevronLeft className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* NAVEGACIÓN DE MÓDULOS */}
      <nav className="flex flex-col p-2 gap-1 overflow-y-auto flex-1">
        {allowedModules.map((module) => {
          const hasSubmodules = module.submodules && module.submodules.length > 0;
          const isActive = pathname.startsWith(module.path);

          return (
            <div key={module.id} className="flex flex-col">
              <button
                onClick={() => hasSubmodules ? toggleAccordion(module.id) : null}
                className={`flex items-center justify-between w-full p-3 rounded-md transition-colors group relative ${
                  isActive ? "bg-white/20 font-bold" : "hover:bg-white/10"
                }`}
                title={isCollapsed ? module.label : undefined} // Tooltip nativo al pasar el mouse si está colapsado
              >
                {!hasSubmodules ? (
                  <Link href={module.path} className="w-full flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">{module.icon}</span>
                    {!isCollapsed && <span className="truncate text-sm">{module.label}</span>}
                  </Link>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      <span className="text-xl flex-shrink-0">{module.icon}</span>
                      {!isCollapsed && <span className="truncate text-sm">{module.label}</span>}
                    </span>
                  </div>
                )}

                {/* Flecha del acordeón (solo si no está colapsado y tiene submódulos) */}
                {hasSubmodules && !isCollapsed && (
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${openAccordion === module.id ? "rotate-180" : ""}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* SUBMÓDULOS (Solo se muestran si el menú está expandido y el acordeón está abierto) */}
              {hasSubmodules && !isCollapsed && (
                <div 
                  className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${
                    openAccordion === module.id ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
                  }`}
                >
                  {module.submodules!.map((sub) => {
                    const isSubActive = pathname === sub.path;
                    return (
                      <Link
                        key={sub.id}
                        href={sub.path}
                        className={`flex items-center gap-3 pl-10 pr-3 py-2 rounded-md text-sm transition-colors ${
                          isSubActive ? "bg-white text-[#00408a] font-bold" : "text-gray-200 hover:bg-white/10"
                        }`}
                      >
                        {sub.icon && <span className="text-base flex-shrink-0">{sub.icon}</span>}
                        <span className="truncate">{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}