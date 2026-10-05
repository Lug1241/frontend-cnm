import type {
  ResultadoQuimestreReporte,
  ResultadoFinalReporte,
} from "./ReporteCalificaciones";
export interface EstudianteCurso {
  nro: number;
  idInscripcion: number;
  idEstudiante: number;
  nombreCompleto: string;
  nivel: string;
  idAsignacion: number;
  reporte?: ReporteDocente;
  registros?: Calificacion[];
}
export type EtapaCalificacion =
  "Q1_P1" | "Q1_P2" | "Q1_EXAMEN" | "Q2_P1" | "Q2_P2" | "Q2_EXAMEN" | "FINAL";
export interface Calificacion {
  id: number;
  inscripcionId: number;
  etapa: EtapaCalificacion;
  tipoPlantilla: "GENERAL" | "BASICO_ELEMENTAL";
  insumo1: number | null;
  insumo2: number | null;
  evaluacion: number | null;
  mejoramiento: number | null;
  comportamiento: number[] | null;
  notaExamen: number | null;
}
export interface DetalleParcial {
  insumo1: number;
  insumo2: number;
  evaluacion: number;
  mejoramiento?: number | null;
  ponderacion70: number;
  ponderacion30: number;
  promedioParcial?: number;
  notaParcial?: number;
  promedioInsumos?: number;
  promedioMejora?: number | null;
  promedioSumativas?: number;
  criteriosComportamiento?: number[];
  promedioComportamiento?: number;
  valoracionComportamiento?: string;
}
export interface ReporteDocente {
  idInscripcion: number;
  tipoCalificacion: "BE" | "Superior";
  detalleParciales: {
    q1: { p1: DetalleParcial | null; p2: DetalleParcial | null };
    q2: { p1: DetalleParcial | null; p2: DetalleParcial | null };
  };
  quimestre1: ResultadoQuimestreReporte | null;
  quimestre2: ResultadoQuimestreReporte | null;
  final: ResultadoFinalReporte | null;
}
export interface CalificacionesDocenteResponse {
  estudiantes: ReporteDocente[];
  registros: Calificacion[];
  etapasHabilitadas: EtapaCalificacion[];
}
export type DatosCalificacion = Pick<
  Calificacion,
  | "insumo1"
  | "insumo2"
  | "evaluacion"
  | "mejoramiento"
  | "comportamiento"
  | "notaExamen"
>;
