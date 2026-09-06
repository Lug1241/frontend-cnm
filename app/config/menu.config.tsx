import { IconType } from "react-icons";
import { 
  MdOutlineLeaderboard, 
  MdOutlineMail, 
  MdOutlinePersonAdd, 
  MdOutlineSettings, 
  MdOutlineLock, 
  MdOutlineGroupAdd, 
  MdOutlinePeople 
} from "react-icons/md";

export type UserType = "docente" | "representante";
export type UserRole = "admin" | "profesor" | "secrearia" | "inspector" | "vicerrector";

export interface SubModule {
  id: string;
  label: string;
  path: string;
  allowedTypes?: UserType[]; 
  allowedRoles?: UserRole[];   
}

export interface SystemModule {
  id: string;
  label: string;
  icon: IconType;
  path: string;
  allowedTypes: UserType[];
  allowedRoles?: UserRole[]; 
  submodules?: SubModule[];
}

export const SYSTEM_MODULES: SystemModule[] = [
  {
    id: "calificaciones",
    label: "Calificaciones",
    icon: MdOutlineLeaderboard, 
    path: "/dashboard/calificaciones",
    allowedTypes: ["docente", "representante"],
    allowedRoles: ["admin", "profesor", "secrearia","inspector", "vicerrector"],
  },
  {
    id: "solicitudes",
    label: "Solicitudes",
    icon: MdOutlineMail,
    path: "/dashboard/solicitudes",
    allowedTypes: ["docente"],
    allowedRoles: ["admin", "profesor", "secrearia","inspector", "vicerrector"],
  },
  {
    id: "matriculacion-individual",
    label: "Matriculación individual",
    icon: MdOutlinePersonAdd,
    path: "/dashboard/matriculacion/individual",
    allowedTypes: ["docente"], 
    allowedRoles: ["admin", "profesor","inspector", "vicerrector"],
  },

  {
    id: "cambiar-contrasena",
    label: "Cambiar contraseña",
    icon: MdOutlineLock,
    path: "/dashboard/perfil/contrasena",
    allowedTypes: ["docente", "representante"],
  },
  {
    id: "matriculacion-grupales",
    label: "Matriculacion materias grupales",
    icon: MdOutlineGroupAdd,
    path: "/dashboard/matriculacion/grupales",
    allowedTypes: ["docente","representante"],
  },
  {
    id: "Configuracion",
    label: "Docentes",
    icon: MdOutlineSettings,
    path: "/dashboard/docentes",
    allowedTypes: ["docente"],
    allowedRoles: ["admin"],
  }
];

// Función utilitaria para filtrar módulos y submódulos según type y rol
export const filterModulesByUser = (modules: SystemModule[], type: UserType, role: UserRole) => {
  return modules
    .filter((module) => {
      // 1. Validar el Type
      if (!module.allowedTypes.includes(type)) return false;
      // 2. Validar el Rol (si el módulo exige roles específicos)
      if (module.allowedRoles && module.allowedRoles.length > 0) {
        if (!module.allowedRoles.includes(role)) return false;
      }
      return true;
    })
    .map((module) => {
      // 3. Filtrar submódulos internos con la misma lógica
      if (module.submodules) {
        const filteredSub = module.submodules.filter((sub) => {
          if (sub.allowedTypes && !sub.allowedTypes.includes(type)) return false;
          if (sub.allowedRoles && sub.allowedRoles.length > 0 && !sub.allowedRoles.includes(role)) return false;
          return true;
        });
        return { ...module, submodules: filteredSub };
      }
      return module;
    });
};