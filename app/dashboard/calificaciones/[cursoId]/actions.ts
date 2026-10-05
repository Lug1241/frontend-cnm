"use server";
import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";
import type {
  DatosCalificacion,
  EtapaCalificacion,
} from "@/types/Calificaciones";
export async function guardarCalificacion(
  id: number,
  etapa: EtapaCalificacion,
  datos: DatosCalificacion,
) {
  try {
    await fetchAPI("/calificaciones/inscripcion/" + id + "/etapa/" + etapa, {
      method: "PUT",
      body: JSON.stringify(datos),
    });
    revalidatePath("/dashboard/calificaciones", "layout");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo guardar la calificación",
    };
  }
}
