"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { decodificarToken } from "@/lib/auth";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function crearSolicitud(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decodedData = decodificarToken(token);
    console.log("CONTENIDO DEL TOKEN:", decodedData);
    const cedulaDocente = decodedData?.id || "";

    const payload = {
      motivo: String(formData.get("motivo") ?? ""),
      descripcion: String(formData.get("descripcion") ?? ""),
      cedula: cedulaDocente,
      fechaSolicitud: new Date().toISOString(),
    };

    await fetchAPI("/solicitudes/crear", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    revalidatePath("/dashboard/solicitudes_profesor");
    return { success: true };
  } catch (error) {
    return { 
        success: false, 
        error: getErrorMessage(error, "No se pudo crear la solicitud.")
    };
  }
}

export async function eliminarSolicitud(id: number) {
  try {
    await fetchAPI(`/solicitudes/eliminar/${id}`, {
      method: "DELETE",
    });

    revalidatePath("/dashboard/solicitudes_profesor");
    return { success: true };
  } catch (error) {
    return { 
        success: false, 
        error: getErrorMessage(error, "No se pudo eliminar la solicitud.") 
    };
  }
}