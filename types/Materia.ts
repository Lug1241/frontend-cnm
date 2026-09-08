export const NIVELES_MATERIA = [
  "1ro BE",
  "2do BE",
  "1ro BM",
  "2do BM",
  "3ro BM",
  "1ro BS",
  "2do BS",
  "3ro BS",
  "1ro BCH",
  "2do BCH",
  "3ro BCH",
  "BCH",
  "BM",
  "BS",
  "BS BCH",
  "BE",
  "BM BS",
  "BM BS BCH",
] as const;

export const TIPOS_MATERIA = [
  "Grupal",
  "Individual",
] as const;

export type NivelMateria = (typeof NIVELES_MATERIA)[number];
export type TipoMateria = (typeof TIPOS_MATERIA)[number];
export type TipoMateriaApi = TipoMateria | Lowercase<TipoMateria>;

export interface Materia {
  id: number;
  nombre: string;
  nivel: NivelMateria;
  tipo: TipoMateriaApi;
  observaciones: string | null;
  edadMin: number;
}
