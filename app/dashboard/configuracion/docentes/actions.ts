"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { type Docente } from "@/types/Docente";

const DOCENTES_PATH = "/dashboard/configuracion/docentes";

export interface DocenteActionResult {
    success: boolean;
    error?: string;
}

export interface PaginatedDocentes {
    data: Docente[];
    totalPages: number;
    currentPage: number;
    totalRows: number;
}

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export async function createDocente(
    formData: FormData,
): Promise<DocenteActionResult> {
    try {
        const requestData = {
            nroCedula: formData.get("nroCedula") as string,
            primerNombre: formData.get("primerNombre") as string,
            segundoNombre: formData.get("segundoNombre") as string,
            primerApellido: formData.get("primerApellido") as string,
            segundoApellido: formData.get("segundoApellido") as string,
            celular: formData.get("celular") as string,
            email: formData.get("email") as string,
            rol: formData.get("rol") as string,
        };

        await fetchAPI(
            "/docentes/crear",
            {
                method: "POST",
                body: JSON.stringify(requestData),
            }
        );

        revalidatePath(DOCENTES_PATH);

        return { success: true };
    } catch (error: unknown) {
        console.error("Error creating docente: ", error);
        return { success: false, error: getErrorMessage(error, "No se pudo crear el docente") };
    }
}

export async function updateDocente(
    nroCedula: string,
    formData: FormData,
): Promise<DocenteActionResult> {
    try {
        const habilitadoValue = formData.get("habilitado");
        
        const requestData = {
            primerNombre: formData.get("primerNombre") as string,
            segundoNombre: formData.get("segundoNombre") as string,
            primerApellido: formData.get("primerApellido") as string,
            segundoApellido: formData.get("segundoApellido") as string,
            celular: formData.get("celular") as string,
            email: formData.get("email") as string,
            rol: formData.get("rol") as string,
            habilitado: habilitadoValue === 'true' || habilitadoValue === 'on',
        };

        await fetchAPI(
            `/docentes/editar/${nroCedula}`,
            {
                method: "PUT",
                body: JSON.stringify(requestData),
            }
        );

        revalidatePath(DOCENTES_PATH);

        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating docente: ", error);
        return { success: false, error: getErrorMessage(error, "No se pudo actualizar el docente") };
    }
}

export async function deleteDocente(
    nroCedula: string,
): Promise<DocenteActionResult> {
    try {
        await fetchAPI(
            `/docentes/eliminar/${nroCedula}`,
            {
                method: "DELETE",
            }
        );

        revalidatePath(DOCENTES_PATH, "page");

        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting docente: ", error);
        return { success: false, error: getErrorMessage(error, "No se pudo eliminar el docente") };
    }
}

export async function getDocentes(
    page: number = 1,
    limit: number = 10,
    search: string = ""
): Promise<{ success: boolean; data?: PaginatedDocentes; error?: string }> {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (search) {
            queryParams.append("search", search);
        }

        const data = (await fetchAPI(
            `/docentes/obtener?${queryParams.toString()}`
        )) as PaginatedDocentes;

        return { success: true, data };
    } catch (error: unknown) {
        console.error("Error fetching docentes: ", error);
        return { success: false, error: getErrorMessage(error, "No se pudieron cargar los docentes") };
    }
}

export async function getDocenteByCedula(
    nroCedula: string
): Promise<{ success: boolean; data?: Docente; error?: string }> {
    try {
        const data = (await fetchAPI(`/docentes/obtener/${nroCedula}`)) as Docente;
        return { success: true, data };
    } catch (error: unknown) {
        console.error("Error fetching docente: ", error);
        return { success: false, error: getErrorMessage(error, "No se pudo cargar la información del docente") };
    }
}

export async function getDocenteByID(
    id: number
): Promise<{ success: boolean; data?: Docente; error?: string }> {
    try {
        const data = (await fetchAPI(`/docentes/obtener/${id}`)) as Docente;
        return { success: true, data };
    } catch (error: unknown) {
        console.error("Error fetching docente by ID: ", error);
        return { success: false, error: getErrorMessage(error, "No se pudo cargar la información del docente") };
    }
}