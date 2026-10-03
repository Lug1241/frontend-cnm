"use server";

import { fetchAPI } from "@/lib/api";
import type {
  HorarioRepresentante,
  MatriculaRepresentante,
} from "@/types/RepresentanteEstudiantil";

export interface HorarioEstudianteResult {
  success: boolean;
  data?: HorarioRepresentante;
  matricula?: MatriculaRepresentante;
  error?: string;
}

export async function obtenerHorarioEstudiante(
  estudianteId: number,
): Promise<HorarioEstudianteResult> {
  if (!Number.isSafeInteger(estudianteId) || estudianteId <= 0) {
    return { success: false, error: "El estudiante seleccionado no es válido." };
  }

  try {
    const matriculas = await fetchAPI<MatriculaRepresentante[]>(
      `/matriculas/representante/estudiante/${estudianteId}`,
    );
    const matricula =
      matriculas.find(
        (item) => item.periodoAcademico?.estado === "Activo",
      ) ?? matriculas.find((item) => item.estado === "En curso");

    if (!matricula) {
      return {
        success: false,
        error: "No existe una matrícula activa para mostrar el horario.",
      };
    }

    const data = await fetchAPI<HorarioRepresentante>(
      `/inscripcion/representante/matricula/${matricula.id}`,
    );

    return { success: true, data, matricula };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo cargar el horario del estudiante.",
    };
  }
}
