import type { Asignacion } from "@/types/Asignacion";

export interface CursoAdministracion {
  id: string;
  nivel: string;
  nombreMateria: string;
  tipo: "Grupal" | "Individual";
  docenteId: number | null;
  docenteNombre: string;
  asignaciones: Asignacion[];
}

const NIVELES_AGRUPACION = new Set([
  "BCH",
  "BM",
  "BS",
  "BS BCH",
  "BE",
  "BM BS",
  "BM BS BCH",
]);

export const ORDEN_NIVELES = [
  "1ro BE",
  "2do BE",
  "BE",
  "1ro BM",
  "2do BM",
  "3ro BM",
  "BM",
  "1ro BS",
  "2do BS",
  "3ro BS",
  "BS",
  "1ro BCH",
  "2do BCH",
  "3ro BCH",
  "BCH",
  "BM BS",
  "BS BCH",
  "BM BS BCH",
];

export const NOMBRES_NIVELES: Record<string, string> = {
  "1ro BE": "1ro Básico Elemental",
  "2do BE": "2do Básico Elemental",
  "1ro BM": "1ro Básico Medio",
  "2do BM": "2do Básico Medio",
  "3ro BM": "3ro Básico Medio",
  "1ro BS": "1ro Básico Superior",
  "2do BS": "2do Básico Superior",
  "3ro BS": "3ro Básico Superior",
  "1ro BCH": "1ro Bachillerato",
  "2do BCH": "2do Bachillerato",
  "3ro BCH": "3ro Bachillerato",
};

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function slug(texto: string) {
  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function nombreDocente(asignacion: Asignacion) {
  const docente = asignacion.docente;

  if (!docente) {
    return "Sin docente";
  }

  return [
    docente.primerNombre,
    docente.segundoNombre,
    docente.primerApellido,
    docente.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function agruparAdministracionEscolar(
  asignaciones: Asignacion[],
): CursoAdministracion[] {
  const cursos: CursoAdministracion[] = [];
  const grupos = new Map<string, CursoAdministracion>();

  asignaciones.forEach((asignacion, index) => {
    const materia = asignacion.materia?.nombre?.trim() || "Sin materia";
    const nivel = asignacion.materia?.nivel?.trim() || "Sin nivel";

    const tipo: "Grupal" | "Individual" =
      asignacion.materia?.tipo?.toLowerCase() === "individual"
        ? "Individual"
        : "Grupal";

    const docente = nombreDocente(asignacion);
    const docenteId = asignacion.docente?.id ?? null;

    const debeAgrupar =
      tipo === "Individual" || NIVELES_AGRUPACION.has(nivel);

    if (!debeAgrupar) {
      cursos.push({
        id:
          asignacion.id != null
            ? `asignacion-${asignacion.id}`
            : `asignacion-${index}`,
        nivel,
        nombreMateria: materia,
        tipo,
        docenteId,
        docenteNombre: docente,
        asignaciones: [asignacion],
      });

      return;
    }

    const identificadorDocente =
      docenteId != null
        ? String(docenteId)
        : normalizar(docente);

    const key = [
      normalizar(nivel),
      normalizar(materia),
      identificadorDocente,
    ].join("|");

    const existente = grupos.get(key);

    if (existente) {
      existente.asignaciones.push(asignacion);
      return;
    }

    grupos.set(key, {
      id: `grupo-${slug(nivel)}-${slug(materia)}-${slug(identificadorDocente)}`,
      nivel,
      nombreMateria: materia,
      tipo,
      docenteId,
      docenteNombre: docente,
      asignaciones: [asignacion],
    });
  });

  cursos.push(...grupos.values());

  return cursos.sort((a, b) => {
    const porMateria = a.nombreMateria.localeCompare(
      b.nombreMateria,
      "es",
    );

    if (porMateria !== 0) {
      return porMateria;
    }

    return a.docenteNombre.localeCompare(
      b.docenteNombre,
      "es",
    );
  });
}

export function ordenarNiveles(niveles: string[]) {
  return [...niveles].sort((a, b) => {
    const posicionA = ORDEN_NIVELES.indexOf(a);
    const posicionB = ORDEN_NIVELES.indexOf(b);

    if (posicionA === -1 && posicionB === -1) {
      return a.localeCompare(b, "es");
    }

    if (posicionA === -1) return 1;
    if (posicionB === -1) return -1;

    return posicionA - posicionB;
  });
}