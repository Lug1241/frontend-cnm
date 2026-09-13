import type { Representante } from "./Representante";

export const GENEROS_ESTUDIANTE = ["Masculino", "Femenino"] as const;
export const JORNADAS_ESTUDIANTE = ["Matutina", "Vespertina"] as const;
export const GRUPOS_ETNICOS_ESTUDIANTE = [
  "Indígena",
  "Mestizo",
  "Afro-descendiente",
  "Negro",
  "Blanco",
] as const;
export const NIVELES_ESTUDIANTE = [
  "1ro Básico Elemental",
  "2do Básico Elemental",
  "1ro Básico Medio",
  "2do Básico Medio",
  "3ro Básico Medio",
  "1ro Básico Superior",
  "2do Básico Superior",
  "3ro Básico Superior",
  "1ro Bachillerato",
  "2do Bachillerato",
  "3ro Bachillerato",
  "Graduado",
] as const;

export interface Estudiante {
  id?: number;
  nroCedula: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  cedulaPdf?: string | null;
  genero: (typeof GENEROS_ESTUDIANTE)[number];
  anioMatricula: number;
  jornada: (typeof JORNADAS_ESTUDIANTE)[number];
  fechaNacimiento: string;
  grupoEtnico: (typeof GRUPOS_ETNICOS_ESTUDIANTE)[number];
  especialidad: string;
  nroMatricula: number;
  nacionalidad: string;
  ier: string;
  matriculaIerPdf?: string | null;
  direccion: string;
  nivel: (typeof NIVELES_ESTUDIANTE)[number];
  representanteId: number;
  representanteCedula: string;
  representante?: Representante;
}
