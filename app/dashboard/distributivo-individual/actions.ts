"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";

const PATH = "/dashboard/distributivo-individual";

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

export async function createAsignacionIndividual(formData: Record<string, unknown>) {
  try {
    await fetchAPI("/asignaciones/crear", {
      method: "POST",
      body: JSON.stringify(formatPayload(formData)),
    });
    revalidatePath(PATH);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, "No se pudo crear la asignación.") };
  }
}

export async function updateAsignacionIndividual(
  id: string | number,
  formData: Record<string, unknown>,
) {
  try {
    await fetchAPI(`/asignaciones/editar/${id}`, {
      method: "PUT",
      body: JSON.stringify(formatPayload(formData)),
    });
    revalidatePath(PATH);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, "No se pudo actualizar la asignación.") };
  }
}

export async function deleteAsignacionIndividual(id: string | number) {
  try {
    await fetchAPI(`/asignaciones/eliminar/${id}`, { method: "DELETE" });
    revalidatePath(PATH);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, "No se pudo eliminar la asignación.") };
  }
}
