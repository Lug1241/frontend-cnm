import Link from "next/link";
import { cookies } from "next/headers";
import { SYSTEM_MODULES, UserType, UserRole } from "@/app/config/menu.config";

export default async function DashboardModules() {
  // Leemos la cookie directamente en el servidor
  const cookieStore = await cookies();
  const typeCookie = cookieStore.get("type");
  const roleCookie = cookieStore.get("rol");
  const userType = (typeCookie?.value as UserType) || "representante";
  const userRole = roleCookie?.value as UserRole;

  const allowedModules = SYSTEM_MODULES.filter(
    (module) =>
      module.allowedTypes.includes(userType) &&
      !module.excludedRoles?.includes(userRole) &&
      (!module.allowedRoles || module.allowedRoles.includes(userRole)),
  );
  const gridModules = allowedModules.filter((module) => !module.hideInGrid);

  return (
    <div className="flex flex-col w-full p-4 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#00408a] mb-6 sm:mb-10">
        Módulos
      </h2>

      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 sm:gap-6 lg:gap-8">
        {gridModules.map((module) => (
          <Link
            key={module.id}
            href={module.path}
            className="group flex min-h-48 w-full flex-col items-center justify-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
