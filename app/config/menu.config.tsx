export type UserType = "docente" | "representante";
export type UserRole =
  "Administrador" | "Profesor" | "Secretaria" | "Inspector" | "Vicerrector";

export interface SubModule {
  id: string;
  label: string;
  path: string;
  icon?: string;
  allowedTypes?: UserType[];
  allowedRoles?: string[];
}

export interface SystemModule {
  id: string;
  label: string;
  icon: string;
  path: string;
  allowedTypes: UserType[];
  allowedRoles?: string[];
  submodules?: SubModule[];
  hideInGrid?: boolean;
}

export const SYSTEM_MODULES: SystemModule[] = [
  {
    id: "inicio",
    label: "Inicio",
    icon: "🏠",
    path: "/dashboard",
    allowedTypes: ["docente", "representante"],
    hideInGrid: true,
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: "⚙️",
    path: "/dashboard/configuracion/periodos",
    allowedTypes: ["docente"],
    allowedRoles: ["Administrador"],
    submodules: [
      {
        id: "conf-periodos",
        label: "Periodos académicos",
        path: "/dashboard/configuracion/periodos",
        icon: "🎓",
      },
      {
        id: "conf-materias",
        label: "Materias",
        path: "/dashboard/configuracion/materias",
        icon: "📘",
      },
      {
        id: "conf-docentes",
        label: "Docentes",
        path: "/dashboard/configuracion/docentes",
        icon: "🧑‍🏫",
      },
      {
        id: "conf-distributivo",
        label: "Distributivo",
        path: "/dashboard/configuracion/distributivo",
        icon: "🏢",
      },
      {
        id: "conf-cursos",
        label: "Cursos vacíos",
        path: "/dashboard/configuracion/cursos-vacios",
        icon: "📦",
      },
    ],
  },
  {
    id: "estudiantil",
    label: "Estudiantil",
    icon: "👥",
    path: "/dashboard/estudiantil",
    allowedTypes: ["docente"],
    allowedRoles: ["Administrador"],
    submodules: [
      {
        id: "est-representantes",
        label: "Representantes",
        path: "/dashboard/estudiantil/representantes",
        icon: "👤",
      },
      {
        id: "est-estudiantes",
        label: "Estudiantes",
        path: "/dashboard/estudiantil/estudiantes",
        icon: "🎓",
      },
      {
        id: "est-registro",
        label: "Registro de estudiantes",
        path: "/dashboard/estudiantil/inscripciones",
        icon: "➕",
      },
    ],
  },
  {
    id: "calificaciones",
    label: "Calificaciones",
    icon: "📊",
    path: "/dashboard/calificaciones",
    allowedTypes: ["docente", "representante"],
  },
  {
    id: "solicitudes",
    label: "Solicitudes",
    icon: "📨",
    path: "/dashboard/solicitudes",
    allowedTypes: ["docente", "representante"],
  },
  {
    id: "cambiar-contrasena",
    label: "Cambiar contraseña",
    icon: "🔐",
    path: "/dashboard/perfil/contrasena",
    allowedTypes: ["docente", "representante"],
  },
  {
    id: "matriculacion-grupales",
    label: "Matriculacion materias grupales",
    icon: "✏️",
    path: "/dashboard/matriculacion/grupales",
    allowedTypes: ["docente", "representante"],
  },
];

// Función utilitaria para filtrar módulos y submódulos según type y rol
export const filterModulesByUser = (
  modules: SystemModule[],
  type: UserType,
  role: UserRole,
) => {
  return modules
    .filter((module) => {
      if (!module.allowedTypes.includes(type)) return false;
      if (module.allowedRoles && module.allowedRoles.length > 0) {
        if (!module.allowedRoles.includes(role)) return false;
      }
      return true;
    })
    .map((module) => {
      if (module.submodules) {
        const filteredSub = module.submodules.filter((sub) => {
          if (sub.allowedTypes && !sub.allowedTypes.includes(type))
            return false;
          if (
            sub.allowedRoles &&
            sub.allowedRoles.length > 0 &&
            !sub.allowedRoles.includes(role)
          )
            return false;
          return true;
        });
        return { ...module, submodules: filteredSub };
      }
      return module;
    });
};
