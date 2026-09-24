import { Asignacion } from "@/types/Asignacion";

export interface CursoDocente {
  id: string;
  nombreMateria: string;
  tipoNivel: "BE" | "Superior";
  tipo: "Grupal" | "Individual";
  asignaciones: Asignacion[];
}

const NIVELES_AGRUPACION = [
  "BCH",
  "BM",
  "BS",
  "BS BCH",
  "BE",
  "BM BS",
  "BM BS BCH",
];

function esNivelBE(nivel?: string) {
  return Boolean(nivel?.toUpperCase().includes("BE"));
}

function normalizarTexto(texto: string) {
  return texto.trim().replace(/\s+/g, " ").toLowerCase();
}

function slug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function agruparCursos(
  asignaciones: Asignacion[],
): CursoDocente[] {
  const paraAgrupar = asignaciones.filter((asignacion) => {
    const tipo = asignacion.materia?.tipo ?? "Grupal";
    const nivel = asignacion.materia?.nivel ?? "";

    return (
      tipo.toLowerCase() === "individual" ||
      NIVELES_AGRUPACION.includes(nivel)
    );
  });

  const sueltos = asignaciones
    .filter((asignacion) => {
      const tipo = asignacion.materia?.tipo ?? "Grupal";
      const nivel = asignacion.materia?.nivel ?? "";

      return (
        tipo.toLowerCase() === "grupal" &&
        !NIVELES_AGRUPACION.includes(nivel)
      );
    })
    .map((asignacion, index): CursoDocente => {
      const materia = asignacion.materia?.nombre ?? "Sin materia";
      const nivel = asignacion.materia?.nivel ?? "";

      return {
        id:
          asignacion.id != null
            ? `asignacion-${asignacion.id}`
            : `asignacion-${slug(materia)}-${index}`,
        nombreMateria: materia,
        tipoNivel: esNivelBE(nivel) ? "BE" : "Superior",
        tipo: "Grupal",
        asignaciones: [asignacion],
      };
    });

  const grupos = new Map<string, CursoDocente>();

  paraAgrupar.forEach((asignacion) => {
    const materia = asignacion.materia?.nombre ?? "Sin materia";
    const nivel = asignacion.materia?.nivel ?? "";
    const tipoNivel = esNivelBE(nivel) ? "BE" : "Superior";

    const tipo: "Grupal" | "Individual" =
      asignacion.materia?.tipo?.toLowerCase() === "individual"
        ? "Individual"
        : "Grupal";

    const key = `${normalizarTexto(materia)}_${tipoNivel}`;

    const existente = grupos.get(key);

    if (existente) {
      existente.asignaciones.push(asignacion);
      return;
    }

    grupos.set(key, {
      id: `grupo-${slug(materia)}-${tipoNivel.toLowerCase()}`,
      nombreMateria: materia,
      tipoNivel,
      tipo,
      asignaciones: [asignacion],
    });
  });

  return [...sueltos, ...grupos.values()];
}