"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";

const FECHAS_NOTAS_PATH = "/dashboard/vicerrector/fechas-notas";

export interface FechaNotaActionResult {
  success: boolean;
  error?: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function buildRequestData(formData: FormData) {
  const descripcion = formData.get("descripcion");
  const fechaInicio = formData.get("fechaInicio");
  const fechaFin = formData.get("fechaFin");

  if (
    typeof descripcion !== "string" ||
    typeof fechaInicio !== "string" ||
    typeof fechaFin !== "string" ||
    !descripcion ||
    !fechaInicio ||
    !fechaFin
  ) {
    throw new Error("Debe completar todos los campos.");
  }

  if (fechaInicio > fechaFin) {
    throw new Error(
      "La fecha de inicio no puede ser mayor que la fecha de fin.",
    );
  }

  return {
    fechaInicio,
    fechaFin,
    proceso: "fechas_notas" as const,
    descripcion,
  };
}

export async function createFechaNota(
  formData: FormData,
): Promise<FechaNotaActionResult> {
  try {
    const requestData = buildRequestData(formData);

    await fetchAPI("/fechas_procesos/crear", {
      method: "POST",
      body: JSON.stringify(requestData),
    });

    revalidatePath(FECHAS_NOTAS_PATH);

    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating fecha nota:", error);

    return {
      success: false,
      error: getErrorMessage(
        error,
        "No se pudo crear la fecha para notas.",
      ),
    };
  }
}

export async function updateFechaNota(
  id: number,
  formData: FormData,
): Promise<FechaNotaActionResult> {
  try {
    const requestData = buildRequestData(formData);

    await fetchAPI(`/fechas_procesos/editar/${id}`, {
      method: "PUT",
      body: JSON.stringify(requestData),
    });

    revalidatePath(FECHAS_NOTAS_PATH);

    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating fecha nota:", error);

    return {
      success: false,
      error: getErrorMessage(
        error,
        "No se pudo actualizar la fecha para notas.",
      ),
    };
  }
}

export async function deleteFechaNota(
  id: number,
): Promise<FechaNotaActionResult> {
  try {
    await fetchAPI(`/fechas_procesos/eliminar/${id}`, {
      method: "DELETE",
    });

    revalidatePath(FECHAS_NOTAS_PATH);

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting fecha nota:", error);

    return {
      success: false,
      error: getErrorMessage(
        error,
        "No se pudo eliminar la fecha para notas.",
      ),
    };
  }
}