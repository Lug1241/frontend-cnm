"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { type Representante } from "@/types/Representante";

const ESTUDIANTES_PATH = "/dashboard/configuracion/estudiantes";

export interface EstudianteActionResult {
  success: boolean;
  error?: string;
}

export interface RepresentanteDetailResult extends EstudianteActionResult {
  data?: Representante;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function nullableString(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

function estudianteFromFormData(formData: FormData) {
  return {
    nroCedula: String(formData.get("nroCedula") ?? "").trim(),
    primerNombre: String(formData.get("primerNombre") ?? "").trim(),
    segundoNombre: String(formData.get("segundoNombre") ?? "").trim(),
    primerApellido: String(formData.get("primerApellido") ?? "").trim(),
    segundoApellido: String(formData.get("segundoApellido") ?? "").trim(),
    cedulaPdf: nullableString(formData, "cedulaPdf"),
    genero: String(formData.get("genero") ?? ""),
    anioMatricula: Number(formData.get("anioMatricula")),
    jornada: String(formData.get("jornada") ?? ""),
    fechaNacimiento: String(formData.get("fechaNacimiento") ?? ""),
    grupoEtnico: String(formData.get("grupoEtnico") ?? ""),
    especialidad: String(formData.get("especialidad") ?? "").trim(),
    nroMatricula: Number(formData.get("nroMatricula")),
    nacionalidad: String(formData.get("nacionalidad") ?? "").trim(),
    ier: String(formData.get("ier") ?? "").trim(),
    matriculaIerPdf: nullableString(formData, "matriculaIerPdf"),
    direccion: String(formData.get("direccion") ?? "").trim(),
    nivel: String(formData.get("nivel") ?? ""),
    ID_representante: Number(formData.get("representanteId")),
  };
}

export async function createEstudiante(
  formData: FormData,
): Promise<EstudianteActionResult> {
  try {
    await fetchAPI("/estudiantes/crear", {
      method: "POST",
      body: JSON.stringify(estudianteFromFormData(formData)),
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
    await fetchAPI(
      `/estudiantes/editar/${encodeURIComponent(currentCedula)}`,
      {
        method: "PUT",
        body: JSON.stringify(estudianteFromFormData(formData)),
      },
    );
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
