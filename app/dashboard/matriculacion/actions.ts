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

export interface EstadoPeriodoMatricula {
  periodoActivo: boolean;
  proceso?: string;
  fechaInicio?: string;
  fechaFin?: string;
  mensaje: string;
}

export async function obtenerEstadoPeriodoMatriculaAction(): Promise<{
  success: boolean;
  data?: EstadoPeriodoMatricula;
  error?: string;
}> {
  try {
    const response = await fetchAPI<EstadoPeriodoMatricula>("/fechas_procesos/matricula");
    return {
      success: true,
      data: response,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo verificar el período de matrícula."),
    };
  }
}

export interface VerificacionDocsRepresentante {
  datosActualizados: boolean;
  message: string;
  faltantes?: string[];
}

export async function verificarDocumentosRepresentanteAction(cedula: string): Promise<{
  success: boolean;
  data?: VerificacionDocsRepresentante;
  error?: string;
}> {
  try {
    const response = await fetchAPI<VerificacionDocsRepresentante>(
      `/representantes/verificar-documentos/${encodeURIComponent(cedula)}`,
    );
    return {
      success: true,
      data: response,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "No se pudieron verificar los documentos del representante."),
    };
  }
}

export interface VerificacionDocsEstudiante {
  datosActualizados: boolean;
  message: string;
}

export async function verificarDocumentosEstudianteAction(cedula: string): Promise<{
  success: boolean;
  data?: VerificacionDocsEstudiante;
  error?: string;
}> {
  try {
    const response = await fetchAPI<VerificacionDocsEstudiante>(
      `/estudiantes/verificar-cedula/${encodeURIComponent(cedula)}`,
    );
    return {
      success: true,
      data: response,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "No se pudieron verificar los documentos del estudiante."),
    };
  }
}

export interface EstudianteRepresentanteItem {
  id: number;
  nroCedula: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  fechaNacimiento?: string;
  genero: string;
  jornada: string;
  nivel: string;
}

export async function obtenerEstudiantesRepresentanteAction(cedula: string): Promise<{
  success: boolean;
  data: EstudianteRepresentanteItem[];
  error?: string;
}> {
  try {
    const response = await fetchAPI<EstudianteRepresentanteItem[]>(
      `/estudiantes/representante/${encodeURIComponent(cedula)}`,
    );
    return {
      success: true,
      data: Array.isArray(response) ? response : [],
    };
  } catch (error: unknown) {
    const message = getErrorMessage(error, "");
    if (message.toLowerCase().includes("no se encontraron") || message.toLowerCase().includes("404")) {
      return {
        success: true,
        data: [],
      };
    }
    return {
      success: false,
      data: [],
      error: getErrorMessage(error, "No se pudieron obtener los estudiantes del representante."),
    };
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