"use server";

import { fetchAPI } from "@/lib/api"; // Aquí sí es válido porque es un entorno de servidor

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export interface MateriaMatriculacion {
  id: number;
  nombre: string;
  nivel: string;
  tipo: string;
}

export interface AsignacionMatriculacion {
  id: number;
  paralelo: string;
  horaInicio: string;
  horaFin: string;
  hora1?: string;
  hora2?: string;
  dias: string[];
  cupos: number;
  materia?: { id?: number; nombre: string; nivel: string; tipo?: string };
  docente?: { primerNombre: string; primerApellido: string };
}

export interface InscripcionMatriculacion {
  id: number;
  asignacion: AsignacionMatriculacion;
}

export interface AsignacionesPaginated {
  data: AsignacionMatriculacion[];
  totalPages: number;
  currentPage: number;
  totalRows: number;
}

export async function buscarEstudiantesAction(term: string) {
  try {
    const params = new URLSearchParams({ search: term, limit: "10" });
    const response = await fetchAPI<{
      data: Array<{
        id: number;
        nroCedula: string;
        primerNombre: string;
        primerApellido: string;
        nivel: string;
        jornada: string;
      }>;
    }>(`/estudiantes/obtenerPorApellido?${params.toString()}`);
    return response.data || [];
  } catch (error) {
    console.error("Error buscando estudiantes:", error);
    return []; // Retornamos un arreglo vacío para no romper la interfaz
  }
}

export async function obtenerMateriasAction(tipo: "Grupal" | "Individual") {
  try {
    const response = await fetchAPI<{ data: MateriaMatriculacion[] }>(
      `/materia/obtener/tipo/${encodeURIComponent(tipo)}?page=1&limit=1000`,
    );
    return response.data || [];
  } catch (error) {
    console.error("Error cargando materias:", error);
    return [];
  }
}

export async function obtenerAsignacionesAction({
  periodoId,
  nivel,
  materia,
  jornada,
  tipo,
  page = 1,
  limit = 5,
}: {
  periodoId: number;
  nivel: string;
  materia: string;
  jornada: string;
  tipo: "Grupal" | "Individual";
  page?: number;
  limit?: number;
}) {
  try {
    const params = new URLSearchParams({ tipo, page: String(page), limit: String(limit) });
    if (jornada) params.set("jornada", jornada);
    return await fetchAPI<AsignacionesPaginated>(
      `/asignaciones/obtener/materias/${periodoId}/${encodeURIComponent(nivel)}/${encodeURIComponent(materia)}?${params.toString()}`,
      {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      },
    );
  } catch (error) {
    throw new Error(getErrorMessage(error, "No se pudieron cargar las asignaciones."));
  }
}

export async function obtenerMatriculaAction(estudianteId: number, periodoId: number) {
  return fetchAPI<{ id: number } | null>(
    `/matriculas/estudiante/periodo/${estudianteId}/${periodoId}`,
  );
}

export async function crearMatriculaAction(payload: {
  nivel: string;
  estado: "En curso";
  ID_estudiante: number;
  ID_periodo_academico: number;
}) {
  return fetchAPI<{ id: number }>("/matriculas/crear", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function obtenerInscripcionesAction(matriculaId: number) {
  const response = await fetchAPI<InscripcionMatriculacion[] | { data: InscripcionMatriculacion[] }>(
    `/inscripcion/obtener/matricula/${matriculaId}`,
  );
  const inscripciones = Array.isArray(response) ? response : response.data || [];
  return inscripciones
    .filter((inscripcion) => Boolean(inscripcion.id && inscripcion.asignacion?.id));
}

export async function eliminarInscripcionesAction(inscripcionIds: number[]) {
  const deletedIds: number[] = [];
  try {
    for (const inscripcionId of inscripcionIds) {
      try {
        await fetchAPI(`/inscripcion/eliminar/${inscripcionId}`, { method: "DELETE" });
      } catch (error) {
        const message = getErrorMessage(error, "");
        if (!message.toLowerCase().includes("ya fue eliminada")) throw error;
      }
      deletedIds.push(inscripcionId);
    }
    return { success: true, deletedIds };
  } catch (error) {
    return {
      success: false,
      deletedIds,
      error: getErrorMessage(error, "No se pudo eliminar la inscripción."),
    };
  }
}

export async function crearInscripcionesAction(matriculaId: number, asignacionesIds: number[]) {
  const createdIds: number[] = [];
  try {
    for (const asignacionId of asignacionesIds) {
      await fetchAPI("/inscripcion/crear", {
        method: "POST",
        body: JSON.stringify({ ID_matricula: matriculaId, ID_asignacion: asignacionId }),
      });
      createdIds.push(asignacionId);
    }
    return { success: true, createdIds };
  } catch (error) {
    return {
      success: false,
      createdIds,
      error: getErrorMessage(error, "No se pudo guardar la inscripción."),
    };
  }
}