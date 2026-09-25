import type {
  ResultadoFinalReporte,
  ResultadoQuimestreReporte,
} from "@/types/ReporteCalificaciones";

export interface EstudianteListaAdministracion {
  nro: number;
  idEstudiante: number;
  nombreCompleto: string;
  nivel: string;
  idAsignaciones: number[];
  idInscripciones: number[];
}

export interface DetalleParcialAdministracion {
  insumo1: number;
  insumo2: number;
  evaluacion: number;
  ponderacion70: number;
  ponderacion30: number;

  // Superior
  promedioParcial?: number;
  criteriosComportamiento?: number[];
  promedioComportamiento?: number;
  valoracionComportamiento?: string;

  // Básico Elemental
  mejoramiento?: number | null;
  promedioInsumos?: number;
  promedioMejora?: number | null;
  promedioSumativas?: number;
  notaParcial?: number;
}

export interface DetalleParcialesAdministracion {
  q1: {
    p1: DetalleParcialAdministracion | null;
    p2: DetalleParcialAdministracion | null;
  };
  q2: {
    p1: DetalleParcialAdministracion | null;
    p2: DetalleParcialAdministracion | null;
  };
}

export interface FilaCalificacionAdministracion {
  idInscripcion: number;
  idAsignacion: number | null;
  idMatricula: number | null;
  idEstudiante: number | null;
  nombreCompleto: string;
  nivel: string | null;

  asignatura: string;
  tipoMateria: string | null;
  tipoCalificacion: "BE" | "Superior";

  docente: {
    id: number | null;
    nombreCompleto: string;
  } | null;

  detalleParciales: DetalleParcialesAdministracion;

  quimestre1: ResultadoQuimestreReporte | null;
  quimestre2: ResultadoQuimestreReporte | null;
  final: ResultadoFinalReporte | null;
}

export interface ReporteAsignacionesAdministracion {
  asignacionIds: number[];
  estudiantes: FilaCalificacionAdministracion[];
}