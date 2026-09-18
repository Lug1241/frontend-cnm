export type TipoProceso =
  | "matricula"
  | "actualizacion_datos"
  | "fechas_notas";

export type DescripcionFechaNota =
  | "parcial1_quim1"
  | "parcial2_quim1"
  | "quimestre1"
  | "parcial1_quim2"
  | "parcial2_quim2"
  | "quimestre2"
  | "nota_final";

export interface FechaProceso {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  proceso: TipoProceso;
  descripcion?: DescripcionFechaNota | null;
}

export interface FechasProcesosResponse {
  data: FechaProceso[];
  totalPages: number;
  currentPage: number;
  totalRows: number;
}

export const TIPO_PROCESO_LABELS: Record<TipoProceso, string> = {
  matricula: "Matrícula",
  actualizacion_datos: "Actualización de datos",
  fechas_notas: "Fechas de notas",
};

export const DESCRIPCION_FECHA_NOTA_LABELS: Record<
  DescripcionFechaNota,
  string
> = {
  parcial1_quim1: "Parcial 1 - Quimestre 1",
  parcial2_quim1: "Parcial 2 - Quimestre 1",
  quimestre1: "Quimestre 1",
  parcial1_quim2: "Parcial 1 - Quimestre 2",
  parcial2_quim2: "Parcial 2 - Quimestre 2",
  quimestre2: "Quimestre 2",
  nota_final: "Nota Final",
};

export const ORDEN_FECHAS_NOTAS: DescripcionFechaNota[] = [
  "parcial1_quim1",
  "parcial2_quim1",
  "quimestre1",
  "parcial1_quim2",
  "parcial2_quim2",
  "quimestre2",
  "nota_final",
];

export const DESCRIPCIONES_FECHAS_NOTAS = ORDEN_FECHAS_NOTAS.map(
  (value) => ({
    value,
    label: DESCRIPCION_FECHA_NOTA_LABELS[value],
  }),
);

export function getDescripcionFechaNotaLabel(
  descripcion?: DescripcionFechaNota | null,
): string {
  if (!descripcion) return "";

  return DESCRIPCION_FECHA_NOTA_LABELS[descripcion];
}