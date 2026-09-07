export interface PeriodoAcademico {
  id: number;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: "Activo" | "Finalizado";
}