"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { type Representante } from "@/types/Representante";

const ESTUDIANTES_PATH = "/dashboard/estudiantil/estudiantes";

export interface EstudianteActionResult {
  success: boolean;
  error?: string;
}

export interface RepresentanteDetailResult extends EstudianteActionResult {
  data?: Representante;
}

function eliminarArchivosVacios(formData: FormData) {
  for (const campo of ["copiaCedula", "matricula_IER"]) {
    const valor = formData.get(campo);

    if (valor && typeof valor !== "string" && valor.size === 0) {
      formData.delete(campo);
    }
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function createEstudiante(
  formData: FormData,
): Promise<EstudianteActionResult> {
  try {
    eliminarArchivosVacios(formData);

    await fetchAPI("/estudiantes/crear", {
      method: "POST",
      body: formData,
    });
    revalidatePath(ESTUDIANTES_PATH);
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo crear el estudiante."),
    };
  }
}

export async function updateEstudiante(
  currentCedula: string,
  formData: FormData,
): Promise<EstudianteActionResult> {
  try {
    eliminarArchivosVacios(formData);

    await fetchAPI(`/estudiantes/editar/${encodeURIComponent(currentCedula)}`, {
      method: "PUT",
      body: formData,
    });
    revalidatePath(ESTUDIANTES_PATH);
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo actualizar el estudiante."),
    };
  }
}

export async function deleteEstudiante(
  nroCedula: string,
): Promise<EstudianteActionResult> {
  try {
    await fetchAPI(`/estudiantes/eliminar/${encodeURIComponent(nroCedula)}`, {
      method: "DELETE",
    });
    revalidatePath(ESTUDIANTES_PATH);
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo eliminar el estudiante."),
    };
  }
}

export async function getRepresentanteDetail(
  nroCedula: string,
): Promise<RepresentanteDetailResult> {
  try {
    const data = await fetchAPI<Representante>(
      `/representantes/obtener/${encodeURIComponent(nroCedula)}`,
    );
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(
        error,
        "No se pudo cargar la información del representante.",
      ),
    };
  }
}
