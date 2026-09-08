import type { Representante } from './Representante';

export const GENERO_ESTUDIANTE = [
    "Masculino",
    "Femenino",
]as const;

export const JORNADA_ESTUDIANTE = [
    "Matutina",
    "Vespertina",
]as const;

export const GRUPO_ETNICO_ESTUDIANTE = [
    "Indígena",
    "Mestizo",
    "Afro-descendiente",
    "Negro",
    "Blanco",
]as const;

export const NIVEL_ESTUDIANTE = [
    '1ro Básico Elemental',
    '2do Básico Elemental',
    '1ro Básico Medio',
    '2do Básico Medio',
    '3ro Básico Medio',
    '1ro Básico Superior',
    '2do Básico Superior',
    '3ro Básico Superior',
    '1ro Bachillerato',
    '2do Bachillerato',
    '3ro Bachillerato',
    'Graduado',
] as const;

export type GeneroEstudiante = (typeof GENERO_ESTUDIANTE)[number];
export type JornadaEstudiante = (typeof JORNADA_ESTUDIANTE)[number];
export type GrupoEtnicoEstudiante = (typeof GRUPO_ETNICO_ESTUDIANTE)[number];
export type NivelEstudiante = (typeof NIVEL_ESTUDIANTE)[number];

export interface Estudiante {
  id: number;
  nroCedula: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  cedulaPdf: string | null;
  genero: GeneroEstudiante;
  anioMatricula: number;
  jornada: JornadaEstudiante;
  fechaNacimiento: string;
  grupoEtnico: GrupoEtnicoEstudiante;
  especialidad: string;
  nroMatricula: number;
  nacionalidad: string;
  ier: string;
  matriculaIerPdf: string | null;
  direccion: string;
  nivel: NivelEstudiante;
  representanteId: number;
  representanteCedula: string;
  representante?: Representante;
}
