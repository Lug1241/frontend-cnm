"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function deleteAsignacionVacia(id: string) {
  try {
    await fetchAPI(`/asignaciones/eliminar/${id}`, { method: "DELETE" });
    
    revalidatePath("/dashboard/cursos-vacios");
    
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "No se pudo eliminar el curso vacío.",
    };
  }
}