export interface Asignacion {
  id?: number;
  paralelo: string;
  horaInicio: string;
  horaFin: string;
  hora1?: string;
  hora2?: string;
  cupos: number;
  dias: string[];

  materia?: {
    id?: number;
    nombre: string;
    nivel: string;
    tipo?: "Grupal" | "Individual";
  };

  docente?: {
    id?: number;
    primerNombre: string;
    primerApellido: string;
  };

  periodoAcademico?: {
    id: number;
    descripcion: string;
  };
}