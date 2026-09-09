"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";

const REPRESENTANTES_PATH = "/dashboard/configuracion/representantes";

export interface RepresentanteActionResult {
  success: boolean;
  error?: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function representanteFromFormData(formData: FormData) {
  return {
    nroCedula: String(formData.get("nroCedula") ?? "").trim(),
    primerNombre: String(formData.get("primerNombre") ?? "").trim(),
    segundoNombre: String(formData.get("segundoNombre") ?? "").trim(),
    primerApellido: String(formData.get("primerApellido") ?? "").trim(),
    segundoApellido: String(formData.get("segundoApellido") ?? "").trim(),
    celular: String(formData.get("celular") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    convencional: String(formData.get("convencional") ?? "").trim(),
    emergencia: String(formData.get("emergencia") ?? "").trim(),
  };
}

export async function createRepresentante(
  formData: FormData,
): Promise<RepresentanteActionResult> {
  try {
    await fetchAPI("/representantes/crear", {
      method: "POST",
      body: JSON.stringify(representanteFromFormData(formData)),
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
    const requestData = {
      ...representanteFromFormData(formData),
      nroCedula: undefined,
    };
    await fetchAPI(
      `/representantes/editar/${encodeURIComponent(nroCedula)}`,
      { method: "PUT", body: JSON.stringify(requestData) },
    );
    revalidatePath(REPRESENTANTES_PATH);
    revalidatePath("/dashboard/configuracion/estudiantes");
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
