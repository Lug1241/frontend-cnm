"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";

const ESTUDIANTES_PATH = "/dashboard/configuracion/estudiantes";

export interface EstudianteActionResult {
  success: boolean;
  error?: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function createEstudiante(
  formData: FormData,
): Promise<EstudianteActionResult> {
  try {
    const requestData = {
      nroCedula: formData.get("nroCedula") as string,
      primerNombre: formData.get("primerNombre") as string,
      segundoNombre: formData.get("segundoNombre") as string,
      primerApellido: formData.get("primerApellido") as string,
      segundoApellido: formData.get("segundoApellido") as string,
      cedulaPdf: (formData.get("cedulaPdf") as string) || null,
      genero: formData.get("genero") as string,
      anioMatricula: Number(formData.get("anioMatricula")),
      jornada: formData.get("jornada") as string,
      fechaNacimiento: formData.get("fechaNacimiento") as string,
      grupoEtnico: formData.get("grupoEtnico") as string,
      especialidad: formData.get("especialidad") as string,
      nroMatricula: Number(formData.get("nroMatricula")),
      nacionalidad: formData.get("nacionalidad") as string,
      ier: formData.get("ier") as string,
      matriculaIerPdf: (formData.get("matriculaIerPdf") as string) || null,
      direccion: formData.get("direccion") as string,
      nivel: formData.get("nivel") as string,
      ID_representante: Number(formData.get("representanteId")),
    };

    await fetchAPI("/estudiantes/crear", {
      method: "POST",
      body: JSON.stringify(requestData),
    });
    revalidatePath(ESTUDIANTES_PATH);

    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating estudiante:", error);
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo crear el estudiante."),
    };
  }
}

export async function updateEstudiante(
  nroCedula: string,
  formData: FormData,
): Promise<EstudianteActionResult> {
  try {
    const requestData = {
      nroCedula: formData.get("nroCedula") as string,
      primerNombre: formData.get("primerNombre") as string,
      segundoNombre: formData.get("segundoNombre") as string,
      primerApellido: formData.get("primerApellido") as string,
      segundoApellido: formData.get("segundoApellido") as string,
      cedulaPdf: (formData.get("cedulaPdf") as string) || null,
      genero: formData.get("genero") as string,
      anioMatricula: Number(formData.get("anioMatricula")),
      jornada: formData.get("jornada") as string,
      fechaNacimiento: formData.get("fechaNacimiento") as string,
      grupoEtnico: formData.get("grupoEtnico") as string,
      especialidad: formData.get("especialidad") as string,
      nroMatricula: Number(formData.get("nroMatricula")),
      nacionalidad: formData.get("nacionalidad") as string,
      ier: formData.get("ier") as string,
      matriculaIerPdf: (formData.get("matriculaIerPdf") as string) || null,
      direccion: formData.get("direccion") as string,
      nivel: formData.get("nivel") as string,
      ID_representante: Number(formData.get("representanteId")),
    };

    await fetchAPI(`/estudiantes/editar/${encodeURIComponent(nroCedula)}`, {
      method: "PUT",
      body: JSON.stringify(requestData),
    });
    revalidatePath(ESTUDIANTES_PATH);

    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating estudiante:", error);
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
    console.error("Error deleting estudiante:", error);
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo eliminar el estudiante."),
    };
  }
}
