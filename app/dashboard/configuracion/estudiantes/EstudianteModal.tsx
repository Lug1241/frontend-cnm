"use client";

import { useState, useTransition } from "react";
import {
    Estudiante,
    GENERO_ESTUDIANTE,
    JORNADA_ESTUDIANTE,
    GRUPO_ETNICO_ESTUDIANTE,
    NIVEL_ESTUDIANTE,
} from "@/types/Estudiante";
import { EstudianteActionResult } from "./actions";

interface EstudianteModalProps {
    isOpen: boolean;
    onClose: () => void;
    estudianteToEdit?: Estudiante | null;
    onSaveAction: (formData: FormData) => Promise<EstudianteActionResult>;
}

function normalizeGenero(genero?: Estudiante["genero"]): string {
    if (!genero) return "";
    return genero.toLowerCase() === "masculino" ? "Masculino" : "Femenino";
}

function normalizeJornada(jornada?: Estudiante["jornada"]): string {
    if (!jornada) return "";
    const normalizedJornada = jornada.toLowerCase();
    if (normalizedJornada === "diurna") return "Matutina";
    if (normalizedJornada === "nocturna") return "Vespertina";
    return JORNADA_ESTUDIANTE.find(
        (option) => option.toLowerCase() === normalizedJornada,
    ) ?? "";
}

function normalizeGrupoEtnico(grupoEtnico?: Estudiante["grupoEtnico"]): string {
    if (!grupoEtnico) return "";
    return grupoEtnico;
}

function normalizeNivel(nivel?: Estudiante["nivel"]): string {
    if (!nivel) return "";
    return nivel;
}

export default function EstudianteModal({
    isOpen,
    onClose,
    estudianteToEdit,
    onSaveAction,
}: EstudianteModalProps) {
    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const isEditing = estudianteToEdit !== null && estudianteToEdit !== undefined;

    const closeModal = () => {
        setErrorMessage(null);
        onClose();
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);

        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
            const result = await onSaveAction(formData);
            if (result.success) {
                closeModal();
                return;
            }

            setErrorMessage(result.error || "Ocurrió un error al guardar.");
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
            <div className="my-4 w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="border-b border-gray-100 px-6 py-5">
                    <h3 className="text-center text-xl font-bold text-gray-800">
                        {isEditing ? "Editar estudiante" : "Agregar estudiante"}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    {errorMessage && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
                            ⚠️ {errorMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Número de cédula</label>
                            <input type="text" name="nroCedula" defaultValue={estudianteToEdit?.nroCedula ?? ""} minLength={10} maxLength={10} required placeholder="Ej. 0102030405" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Primer nombre</label>
                            <input type="text" name="primerNombre" defaultValue={estudianteToEdit?.primerNombre ?? ""} maxLength={50} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Segundo nombre</label>
                            <input type="text" name="segundoNombre" defaultValue={estudianteToEdit?.segundoNombre ?? ""} maxLength={50} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Primer apellido</label>
                            <input type="text" name="primerApellido" defaultValue={estudianteToEdit?.primerApellido ?? ""} maxLength={50} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Segundo apellido</label>
                            <input type="text" name="segundoApellido" defaultValue={estudianteToEdit?.segundoApellido ?? ""} maxLength={50} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Género</label>
                            <select name="genero" defaultValue={normalizeGenero(estudianteToEdit?.genero)} required className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"><option value="" disabled>Seleccione un género</option>{GENERO_ESTUDIANTE.map((genero) => <option key={genero} value={genero}>{genero}</option>)}</select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Año de matrícula</label>
                            <input type="number" name="anioMatricula" defaultValue={estudianteToEdit?.anioMatricula ?? new Date().getFullYear()} min={2000} max={2100} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Jornada</label>
                            <select name="jornada" defaultValue={normalizeJornada(estudianteToEdit?.jornada)} required className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"><option value="" disabled>Seleccione una jornada</option>{JORNADA_ESTUDIANTE.map((jornada) => <option key={jornada} value={jornada}>{jornada}</option>)}</select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Fecha de nacimiento</label>
                            <input type="date" name="fechaNacimiento" defaultValue={estudianteToEdit?.fechaNacimiento?.slice(0, 10) ?? ""} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Grupo étnico</label>
                            <select name="grupoEtnico" defaultValue={normalizeGrupoEtnico(estudianteToEdit?.grupoEtnico)} required className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"><option value="" disabled>Seleccione un grupo étnico</option>{GRUPO_ETNICO_ESTUDIANTE.map((grupo) => <option key={grupo} value={grupo}>{grupo}</option>)}</select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Especialidad</label>
                            <input type="text" name="especialidad" defaultValue={estudianteToEdit?.especialidad ?? ""} maxLength={100} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Número de matrícula</label>
                            <input type="number" name="nroMatricula" defaultValue={estudianteToEdit?.nroMatricula ?? ""} min={1} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Nacionalidad</label>
                            <input type="text" name="nacionalidad" defaultValue={estudianteToEdit?.nacionalidad ?? ""} maxLength={50} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">IER</label>
                            <input type="text" name="ier" defaultValue={estudianteToEdit?.ier ?? ""} maxLength={100} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Nivel</label>
                            <select name="nivel" defaultValue={normalizeNivel(estudianteToEdit?.nivel)} required className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"><option value="" disabled>Seleccione un nivel</option>{NIVEL_ESTUDIANTE.map((nivel) => <option key={nivel} value={nivel}>{nivel}</option>)}</select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">ID del representante</label>
                            <input type="number" name="representanteId" defaultValue={estudianteToEdit?.representanteId ?? ""} min={1} required placeholder="Ej. 12" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                            <span className="text-xs text-gray-500">El ID debe corresponder a un representante existente.</span>
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                            <label className="text-sm font-semibold text-gray-700">Dirección</label>
                            <input type="text" name="direccion" defaultValue={estudianteToEdit?.direccion ?? ""} maxLength={255} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Cédula PDF</label>
                            <input type="text" name="cedulaPdf" defaultValue={estudianteToEdit?.cedulaPdf ?? ""} placeholder="URL o ruta del archivo" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">Matrícula IER PDF</label>
                            <input type="text" name="matriculaIerPdf" defaultValue={estudianteToEdit?.matriculaIerPdf ?? ""} placeholder="URL o ruta del archivo" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]" />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button type="submit" disabled={isPending} className="rounded-md bg-[#007bff] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0056b3] disabled:opacity-50">{isPending ? "Guardando..." : "Guardar"}</button>
                        <button type="button" onClick={closeModal} disabled={isPending} className="rounded-md bg-[#dc3545] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#b02a37] disabled:opacity-50">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
