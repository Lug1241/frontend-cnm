import type { PeriodoAcademico } from "./PeriodoAcademico";
import type { NivelMatricula } from "./ReporteCalificaciones";

export interface EstudianteRepresentante {
  id: number;
  nroCedula: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  cedulaPdf?: string | null;
  genero: string;
  fechaNacimiento: string;
  grupoEtnico: string;
  especialidad: string;
  nacionalidad: string;
  ier: string;
  direccion: string;
  jornada: string;
  nivel: string;
  representanteCedula: string;
}

export interface MatriculaRepresentante {
  id: number;
  nivel: NivelMatricula;
  estado: "Aprobado" | "Reprobado" | "En curso";
  estudianteId: number;
  periodoAcademicoId: number;
  periodoAcademico?: PeriodoAcademico;
}

export interface ClaseHorarioRepresentante {
  idInscripcion: number;
  idAsignacion: number;
  asignatura: string;
  tipoMateria: string | null;
  paralelo: string;
  dia: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes";
  horaInicio: string;
  horaFin: string;
  docente: string | null;
}

export interface HorarioRepresentante {
  matricula: {
    id: number;
    nivel: NivelMatricula;
    periodoAcademicoId: number;
  };
  clases: ClaseHorarioRepresentante[];
}
