export type NivelMatricula =
  | "1ro Básico Elemental"
  | "2do Básico Elemental"
  | "1ro Básico Medio"
  | "2do Básico Medio"
  | "3ro Básico Medio"
  | "1ro Básico Superior"
  | "2do Básico Superior"
  | "3ro Básico Superior"
  | "1ro Bachillerato"
  | "2do Bachillerato"
  | "3ro Bachillerato";

export interface MatriculaResumen {
  id: number;
  nivel: NivelMatricula;
  periodoAcademicoId: number;
}

export interface EstudianteReporteResumen {
  id?: number;
  nroCedula: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  matriculas?: MatriculaResumen[];
}

export interface ResultadoQuimestreReporte {
  parcial1: number;
  parcial2: number;
  promedioParciales: number;
  ponderacion70: number;
  examen: number;
  ponderacion30: number;
  promedioQuimestral: number;
  comportamiento?: number;
  valoracionComportamiento?: string;
}

export interface ResultadoFinalReporte {
  primerQuimestre: number;
  segundoQuimestre: number;
  promedioAnual?: number;
  comportamiento?: number;
  valoracionComportamiento?: string;
  examenRecuperacion?: number | null;
  promedioFinal: number;
  estado: "Aprobado" | "Supletorio" | "Reprobado";
}

export interface CursoReporte {
  idInscripcion: number;
  idAsignacion: number | null;
  asignatura: string;
  nivelMateria: string | null;
  tipoMateria: string | null;
  tipoCalificacion: "BE" | "Superior";
  docente: {
    id: number | null;
    nombreCompleto: string;
  } | null;
  quimestre1: ResultadoQuimestreReporte | null;
  quimestre2: ResultadoQuimestreReporte | null;
  final: ResultadoFinalReporte | null;
}

export interface ReporteCalificaciones {
  matricula: {
    id: number;
    nivel: NivelMatricula | null;
    periodoAcademicoId: number | null;
  };
  estudiante: {
    id?: number;
    nroCedula: string;
    nombreCompleto: string;
  } | null;
  cursos: CursoReporte[];
}
