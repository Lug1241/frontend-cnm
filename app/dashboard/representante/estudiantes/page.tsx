import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { fetchAPI } from "@/lib/api";
import type { ReporteCalificaciones } from "@/types/ReporteCalificaciones";
import type {
  EstudianteRepresentante,
  MatriculaRepresentante,
} from "@/types/RepresentanteEstudiantil";
import CalificacionesRepresentante from "./CalificacionesRepresentante";
import EstudiantesRepresentanteClient from "./EstudiantesRepresentanteClient";

function parseId(value?: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export default async function EstudiantesRepresentantePage({
  searchParams,
}: {
  searchParams: Promise<{
    estudiante?: string;
    vista?: string;
    matricula?: string;
  }>;
}) {
  const cookieStore = await cookies();

  if (cookieStore.get("type")?.value !== "representante") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  let estudiantes: EstudianteRepresentante[] = [];
  let error = "";

  try {
    estudiantes = await fetchAPI<EstudianteRepresentante[]>(
      "/estudiantes/representante/me/propios",
    );
  } catch (requestError) {
    const message =
      requestError instanceof Error
        ? requestError.message
        : "No se pudieron cargar los estudiantes.";

    if (message === "UNAUTHORIZED") redirect("/");
    error = message;
  }

  if (params.vista !== "calificaciones") {
    return (
      <EstudiantesRepresentanteClient estudiantes={estudiantes} error={error} />
    );
  }

  const estudianteId = parseId(params.estudiante);
  const estudiante = estudianteId
    ? estudiantes.find((item) => item.id === estudianteId)
    : null;

  if (!estudiante) {
    return (
      <EstudiantesRepresentanteClient
        estudiantes={estudiantes}
        error={
          error || "El estudiante seleccionado no está asociado a tu cuenta."
        }
      />
    );
  }

  let matriculas: MatriculaRepresentante[] = [];
  let matriculaSeleccionada: MatriculaRepresentante | null = null;
  let reporte: ReporteCalificaciones | null = null;
  let reporteError = "";

  try {
    matriculas = await fetchAPI<MatriculaRepresentante[]>(
      `/matriculas/representante/estudiante/${estudiante.id}`,
    );
  } catch (requestError) {
    reporteError =
      requestError instanceof Error
        ? requestError.message
        : "No se pudieron cargar los períodos académicos.";
  }

  const matriculaId = parseId(params.matricula);
  if (matriculaId && !reporteError) {
    matriculaSeleccionada =
      matriculas.find((matricula) => matricula.id === matriculaId) ?? null;

    if (!matriculaSeleccionada) {
      reporteError = "La matrícula seleccionada no pertenece al estudiante.";
    }
  }

  if (matriculaSeleccionada && !reporteError) {
    try {
      reporte = await fetchAPI<ReporteCalificaciones>(
        `/calificaciones/representante/matricula/${matriculaSeleccionada.id}`,
      );
    } catch (requestError) {
      reporteError =
        requestError instanceof Error
          ? requestError.message
          : "No se pudieron cargar las calificaciones.";
    }
  }

  return (
    <CalificacionesRepresentante
      estudiante={estudiante}
      matriculas={matriculas}
      matriculaSeleccionada={matriculaSeleccionada}
      reporte={reporte}
      error={reporteError}
    />
  );
}
