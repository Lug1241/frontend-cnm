"use server";

import { fetchAPI } from "@/lib/api";
import { error } from "console";
import { revalidatePath } from "next/cache";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatPayload(formData: Record<string, unknown>) {
    return {
        ...formData,
        ID_docente: String(formData.ID_docente),
        ID_materia: Number(formData.ID_materia),
        ID_periodo_academico: Number(formData.ID_periodo_academico),
        cupos: Number(formData.cupos),
    };
}

export async function createAsignacion(formData: Record<string, unknown>) {
  if (!formData.ID_periodo_academico || formData.ID_periodo_academico === "") {
    return {
      success: false,
      error: getErrorMessage(error, 'El período académico es obligatorio.'),
    };
  }

  try {
    await fetchAPI("/asignaciones/crear", {
      method: "POST",
      body: JSON.stringify(formatPayload(formData)),
    });
    revalidatePath("/dashboard/distributivo");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: getErrorMessage(error, "Error al crear la asignación.") 
    };
  }
}

export async function updateAsignacion(id: string | number, formData: Record<string, unknown>) {
  try {
    await fetchAPI(`/asignaciones/editar/${id}`, {
      method: "PUT",
      body: JSON.stringify(formatPayload(formData)),
    });
    revalidatePath("/dashboard/distributivo");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: getErrorMessage(error, "Error al actualizar la asignación.") 
    };
  }
}

export async function deleteAsignacion(id: string | number) {
  try {
    await fetchAPI(`/asignaciones/eliminar/${id}`, {
      method: "DELETE",
    });
    revalidatePath("/dashboard/distributivo");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: getErrorMessage(error, "Error al eliminar la asignación.") 
    };
  }
}