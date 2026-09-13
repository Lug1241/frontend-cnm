"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";

const REPRESENTANTES_PATH = "/dashboard/estudiantil/representantes";

export interface RepresentanteActionResult {
  success: boolean;
  error?: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function createRepresentante(
  formData: FormData,
): Promise<RepresentanteActionResult> {
  try {
    await fetchAPI("/representantes/crear", {
      method: "POST",
      body: formData,
    });
    revalidatePath(REPRESENTANTES_PATH);
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo crear el representante."),
    };
  }
}

export async function updateRepresentante(
  nroCedula: string,
  formData: FormData,
): Promise<RepresentanteActionResult> {
  try {
    await fetchAPI(`/representantes/editar/${encodeURIComponent(nroCedula)}`, {
      method: "PUT",
      body: formData,
    });
    revalidatePath(REPRESENTANTES_PATH);
    revalidatePath("/dashboard/estudiantil/estudiantes");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo actualizar el representante."),
    };
  }
}

export async function deleteRepresentante(
  nroCedula: string,
): Promise<RepresentanteActionResult> {
  try {
    await fetchAPI(
      `/representantes/eliminar/${encodeURIComponent(nroCedula)}`,
      { method: "DELETE" },
    );
    revalidatePath(REPRESENTANTES_PATH);
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo eliminar el representante."),
    };
  }
}
