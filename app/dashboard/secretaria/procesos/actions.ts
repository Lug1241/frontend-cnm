"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { type FechaProceso } from "@/types/FechaProceso";

const FECHAS_PROCESOS_PATH = "/dashboard/secretaria/procesos";

export interface FechaProcesoActionResult {
  success: boolean;
  data?: FechaProceso;
  error?: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function createFechaProceso(
  formData: FormData,
): Promise<FechaProcesoActionResult> {
  try {
    const requestData = {
      fechaInicio: formData.get("fechaInicio") as string,
      fechaFin: formData.get("fechaFin") as string,
      proceso: formData.get("proceso") as string,
    };

    const data = await fetchAPI<FechaProceso>("/fechas_procesos/crear", {
      method: "POST",
      body: JSON.stringify(requestData),
    });

    revalidatePath(FECHAS_PROCESOS_PATH);

    return {
      success: true,
      data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo crear el proceso."),
    };
  }
}

export async function updateFechaProceso(
  id: number,
  formData: FormData,
): Promise<FechaProcesoActionResult> {
  try {
    const requestData = {
      fechaInicio: formData.get("fechaInicio") as string,
      fechaFin: formData.get("fechaFin") as string,
      proceso: formData.get("proceso") as string,
    };

    const data = await fetchAPI<FechaProceso>(
      `/fechas_procesos/editar/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(requestData),
      },
    );

    revalidatePath(FECHAS_PROCESOS_PATH);

    return {
      success: true,
      data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo actualizar el proceso."),
    };
  }
}

export async function deleteFechaProceso(
  id: number,
): Promise<FechaProcesoActionResult> {
  try {
    const data = await fetchAPI<FechaProceso>(
      `/fechas_procesos/eliminar/${id}`,
      {
        method: "DELETE",
      },
    );

    revalidatePath(FECHAS_PROCESOS_PATH);

    return {
      success: true,
      data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo eliminar el proceso."),
    };
  }
}