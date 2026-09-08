"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";

const MATERIAS_PATH = "/dashboard/configuracion/materias";

export interface MateriaActionResult {
  success: boolean;
  error?: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function createMateria(
  formData: FormData,
): Promise<MateriaActionResult> {
  try {
    const requestData = {
      nombre: formData.get("nombre") as string,
      nivel: formData.get("nivel") as string,
      tipo: formData.get("tipo") as string,
      observaciones: formData.get("observaciones") as string,
      edadMin: Number(formData.get("edadMin")),
    };

    await fetchAPI("/materia/crear", {
      method: "POST",
      body: JSON.stringify(requestData),
    });
    revalidatePath(MATERIAS_PATH);

    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating materia:", error);
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo crear la materia."),
    };
  }
}

export async function updateMateria(
  id: number,
  formData: FormData,
): Promise<MateriaActionResult> {
  try {
    const requestData = {
      nombre: formData.get("nombre") as string,
      nivel: formData.get("nivel") as string,
      tipo: formData.get("tipo") as string,
      observaciones: formData.get("observaciones") as string,
      edadMin: Number(formData.get("edadMin")),
    };

    await fetchAPI(`/materia/editar/${id}`, {
      method: "PUT",
      body: JSON.stringify(requestData),
    });
    revalidatePath(MATERIAS_PATH);

    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating materia:", error);
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo actualizar la materia."),
    };
  }
}

export async function deleteMateria(id: number): Promise<MateriaActionResult> {
  try {
    await fetchAPI(`/materia/eliminar/${id}`, {
      method: "DELETE",
    });
    revalidatePath(MATERIAS_PATH);

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting materia:", error);
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo eliminar la materia."),
    };
  }
}
