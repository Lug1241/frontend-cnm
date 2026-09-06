"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SYSTEM_MODULES, UserType, filterModulesByUser, UserRole } from "@/app/config/menu.config";

interface SidebarProps {
  userType: UserType;
  userRole: UserRole;
}

export default function Sidebar({ userType, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // 1. Ocultar el Sidebar si estamos en la vista de Módulos (inicio)
  if (pathname === "/dashboard") return null;

  const allowedModules = filterModulesByUser(SYSTEM_MODULES, userType, userRole);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <aside className="w-full md:w-64 bg-[#00408a] min-h-screen text-white shrink-0 shadow-xl overflow-y-auto hidden md:flex md:flex-col">
      <div className="p-4 sm:p-6 font-bold text-lg border-b border-white/20">
        Menú Principal
      </div>

      <nav className="flex flex-col p-2 sm:p-4 gap-2">
        {allowedModules.map((module) => {
          const hasSubmodules = module.submodules && module.submodules.length > 0;
          const isActive = pathname.startsWith(module.path);

          return (
            <div key={module.id} className="flex flex-col">
              <button
                onClick={() => hasSubmodules ? toggleAccordion(module.id) : null}
                className={`flex items-center justify-between w-full text-left p-3 rounded-md transition-colors ${
                  isActive ? "bg-white/20 font-bold" : "hover:bg-white/10"
                }`}
              >
                {!hasSubmodules ? (
                  <Link href={module.path} className="w-full flex items-center gap-3">
                    {/* Renderizamos el emoji directamente */}
                    <span className="text-xl shrink-0">{module.icon}</span>
                    {module.label}
                  </Link>
                ) : (
                  <span className="w-full flex items-center gap-3">
                    <span className="text-xl shrink-0">{module.icon}</span>
                    {module.label}
                  </span>
                )}

                {hasSubmodules && (
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${openAccordion === module.id ? "rotate-180" : ""}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {hasSubmodules && (
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
                        className={`pl-12 pr-3 py-2 rounded-md text-sm transition-colors ${
                          isSubActive ? "bg-white text-[#00408a] font-bold" : "text-gray-200 hover:bg-white/10"
                        }`}
                      >
                        {sub.label}
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