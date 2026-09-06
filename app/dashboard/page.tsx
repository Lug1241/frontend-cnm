import Link from "next/link";
import { cookies } from "next/headers";
import { SYSTEM_MODULES, UserType,UserRole } from "@/app/config/menu.config";

export default async function DashboardModules() {
  // Leemos la cookie directamente en el servidor
  const cookieStore = await cookies();
  const typeCookie = cookieStore.get("type");
  const roleCookie = cookieStore.get("rol");
  const userType = (typeCookie?.value as UserType) || "representante";
  const userRole = (roleCookie?.value as UserRole);

  const allowedModules = SYSTEM_MODULES.filter((module) =>
    module.allowedTypes.includes(userType) && (!module.allowedRoles || module.allowedRoles.includes(userRole))
  );
  const gridModules = allowedModules.filter(module => !module.hideInGrid);

 return (
    <div className="flex flex-col w-full p-4 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#00408a] mb-6 sm:mb-10">
        Módulos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
        {gridModules.map((module) => (
          <Link
            key={module.id}
            href={module.path}
            className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 w-full min-h-48 max-w-sm p-6 gap-4 border border-gray-100 group"
          >
            <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {/* Aquí renderizamos el emoji */}
              <span className="text-6xl">{module.icon}</span>
            </div>
            <span className="font-bold text-gray-800 text-center text-sm sm:text-base">
              {module.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}