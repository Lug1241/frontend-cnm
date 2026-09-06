import Link from "next/link";
import { cookies } from "next/headers";
import { SYSTEM_MODULES, UserType,UserRole } from "@/app/config/menu.config";

export default async function DashboardModules() {
  // Leemos la cookie directamente en el servidor
  const cookieStore = await cookies();
  const typeCookie = cookieStore.get("type");
  const roleCookie = cookieStore.get("role");
  const userType = (typeCookie?.value as UserType) || "representante";
  const userRole = (roleCookie?.value as UserRole) || "profesor";

  // Filtramos los módulos antes de enviar la página al cliente
  const allowedModules = SYSTEM_MODULES.filter((module) =>
    module.allowedTypes.includes(userType) && (!module.allowedRoles || module.allowedRoles.includes(userRole))
  );

  return (
    <div className="flex flex-col w-full p-4 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#00408a] mb-6 sm:mb-10">
        Módulos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
        {allowedModules.map((module) => {
          const IconComponent = module.icon;
          
          return (
            <Link
              key={module.id}
              href={module.path}
              className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 w-full min-h-48 max-w-sm p-6 gap-4 border border-gray-100 group"
            >
              <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <IconComponent className="w-16 h-16 sm:w-20 sm:h-20 text-[#00408a]" />
              </div>
              <span className="font-bold text-gray-800 text-center text-sm sm:text-base">
                {module.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}