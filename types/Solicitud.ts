export enum DescripcionSolicitud {
  PARCIAL1_QUIM1 = 'parcial1_quim1',
  PARCIAL2_QUIM1 = 'parcial2_quim1',
  QUIMESTRE1 = 'quimestre1',
  PARCIAL1_QUIM2 = 'parcial1_quim2',
  PARCIAL2_QUIM2 = 'parcial2_quim2',
  QUIMESTRE2 = 'quimestre2',
  NOTA_FINAL = 'nota_final',
}

export enum EstadoSolicitud {
  PENDIENTE = 'Pendiente',
  ACEPTADA = 'Aceptada',
  RECHAZADA = 'Rechazada',
}

export interface Solicitud {
  id: number;
  descripcion: DescripcionSolicitud;
  fechaInicio: string | null;
  fechaFin: string | null;
  motivo: string;
  estado: EstadoSolicitud;
  fechaSolicitud: string;
  docente?: {
    id?: number;
    primerNombre: string;
    primerApellido: string;
  }
}