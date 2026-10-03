import type { Asignacion } from "@/types/Asignacion";

export function parseIdsAsignaciones(raw?: string) {
  if (!raw?.trim()) {
    return [];
  }

  return [
    ...new Set(
      raw
        .split(",")
        .map((value) => Number(value.trim()))
        .filter(
          (id) =>
            Number.isSafeInteger(id) &&
            id > 0,
        ),
    ),
  ];
}

export function nombreDocente(asignacion?: Asignacion) {
  const docente = asignacion?.docente;

  if (!docente) {
    return "";
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

function determinarJornada(hora?: string) {
  if (!hora) return "";

  const horaNumerica = Number(
    hora.split(":")[0],
  );

  if (!Number.isFinite(horaNumerica)) {
    return "";
  }

  return horaNumerica < 12
    ? "Matutina"
    : "Vespertina";
}

export function obtenerDatosCurso(
  asignaciones: Asignacion[],
) {
  const primera = asignaciones[0];

  const materia =
    primera?.materia?.nombre ?? "";

  const docente =
    nombreDocente(primera);

  const nivel =
    primera?.materia?.nivel ?? "";

  const paralelos = [
    ...new Set(
      asignaciones
        .map((item) => item.paralelo)
        .filter(Boolean),
    ),
  ];

  const horarios = [
    ...new Set(
      asignaciones
        .map((item) => {
          if (!item.horaInicio && !item.horaFin) {
            return "";
          }

          return [
            item.horaInicio,
            item.horaFin,
          ]
            .filter(Boolean)
            .join(" - ");
        })
        .filter(Boolean),
    ),
  ];

  const jornadas = [
    ...new Set(
      asignaciones
        .map((item) =>
          determinarJornada(item.horaInicio),
        )
        .filter(Boolean),
    ),
  ];

  return {
    materia,
    docente,
    nivel,

    paralelo:
      paralelos.length === 1
        ? paralelos[0]
        : paralelos.length > 1
          ? "Varios"
          : "",

    horario:
      horarios.length === 1
        ? horarios[0]
        : horarios.length > 1
          ? "Varios"
          : "",

    jornada:
      jornadas.length === 1
        ? jornadas[0]
        : jornadas.length > 1
          ? "Mixta"
          : "",
  };
}