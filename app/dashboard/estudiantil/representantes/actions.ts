"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { type Representante } from "@/types/Representante";

const REPRESENTANTES_PATH = "/dashboard/estudiantil/representantes";

export interface BuscarRepresentanteResult {
  success: boolean;
  data?: Representante | null;
  error?: string;
}

export interface RepresentanteActionResult {
  success: boolean;
  data?: Representante;
  error?: string;
}

function eliminarArchivosVacios(formData: FormData) {
  for (const campo of ["copiaCedula", "croquis"]) {
    const valor = formData.get(campo);

    if (valor && typeof valor !== "string" && valor.size === 0) {
      formData.delete(campo);
    }
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function createRepresentante(
  formData: FormData,
): Promise<RepresentanteActionResult> {
  try {
    eliminarArchivosVacios(formData);
    
    const representante =  await fetchAPI<Representante>(
      "/representantes/crear", 
      {
        method: "POST",
        body: formData,
    });

    revalidatePath(REPRESENTANTES_PATH);
    
    return { 
      success: true,
      data: representante,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo crear el representante."),
    };
  }
}

export async function getRepresentanteByCedula(
  nroCedula: string,
): Promise<BuscarRepresentanteResult> {
  try {
    const representante = await fetchAPI<Representante>(
      `/representantes/obtener/${encodeURIComponent(nroCedula)}`,
    );

    return {
      success: true,
      data: representante,
    };
  } catch (error: unknown) {
    const message = getErrorMessage(
      error,
      "No se pudo buscar el representante.",
    );

    if (message === "Representante no encontrado") {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: false,
      error: message,
    };
  }
}

export async function updateRepresentante(
  nroCedula: string,
  formData: FormData,
): Promise<RepresentanteActionResult> {
  try{
    eliminarArchivosVacios(formData);
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
