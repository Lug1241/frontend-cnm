"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createPeriodo(formData: FormData) {
    try{
        const requestData = {
            descripcion: formData.get("descripcion") as string,
            fechaInicio: formData.get("fechaInicio") as string,
            fechaFin: formData.get("fechaFin") as string,
            estado: "Activo",
        };
        await fetchAPI("/periodo_academico/crear", {
            method: "POST",
            body: JSON.stringify(requestData),
        });
        revalidatePath("/dashboard/configuracion/periodos");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error creating periodo:", error instanceof Error ? error.message : "Unknown error");
        return { success: false, error: error instanceof Error ? error.message : "No se pudo crear el periodo académico." };
        
    }
}
export async function updatePeriodo(id: number, formData: FormData) {
    try {
        const requestData = {
            descripcion: formData.get("descripcion") as string,
            fechaInicio: formData.get("fechaInicio") as string,
            fechaFin: formData.get("fechaFin") as string,
        };
        await fetchAPI(`/periodo_academico/editar/${id}`, {
            method: "PUT",
            body: JSON.stringify(requestData),
        });
        revalidatePath("/dashboard/configuracion/periodos");
        return { success: true };
    } catch (error) {
        console.error("Error updating periodo:", error);
        return { success: false, error: "No se pudo actualizar el periodo académico." };
    }
}
export async function deletePeriodo(id: number) {
    try {
        await fetchAPI(`/periodo_academico/eliminar/${id}`, {
            method: "DELETE",
        });
        revalidatePath("/dashboard/configuracion/periodos");
        return { success: true };
    } catch (error) {
        console.error("Error deleting periodo:", error);
        return { success: false, error: "No se pudo eliminar el periodo académico." };
    }
}