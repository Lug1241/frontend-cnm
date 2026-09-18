"use client";

import { useState, useTransition } from "react";
import {
  DESCRIPCIONES_FECHAS_NOTAS,
  type DescripcionFechaNota,
  type FechaProceso,
} from "@/types/FechaProceso";
import type { FechaNotaActionResult } from "./actions";

interface FechaNotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fechaToEdit?: FechaProceso | null;
  fechasExistentes: FechaProceso[];
  onSaveAction: (
    formData: FormData,
  ) => Promise<FechaNotaActionResult>;
}

export default function FechaNotaModal({
  isOpen,
  onClose,
  fechaToEdit,
  fechasExistentes,
  onSaveAction,
}: FechaNotaModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  if (!isOpen) return null;

  const isEditing = Boolean(fechaToEdit);

  const todasUtilizadas = DESCRIPCIONES_FECHAS_NOTAS.every(
    (opcion) =>
      fechasExistentes.some(
        (fecha) => fecha.descripcion === opcion.value,
      ),
  );

  const primeraDisponible =
    DESCRIPCIONES_FECHAS_NOTAS.find(
      (opcion) =>
        !fechasExistentes.some(
          (fecha) => fecha.descripcion === opcion.value,
        ),
    )?.value ?? "";

  const descripcionInicial: DescripcionFechaNota | "" =
    fechaToEdit?.descripcion ?? primeraDisponible;

  const closeModal = () => {
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    const fechaInicio = String(
      formData.get("fechaInicio") ?? "",
    );

    const fechaFin = String(
      formData.get("fechaFin") ?? "",
    );

    if (fechaInicio > fechaFin) {
      setErrorMessage(
        "La fecha de inicio no puede ser mayor que la fecha de fin.",
      );
      return;
    }

    startTransition(async () => {
      const result = await onSaveAction(formData);

      if (result.success) {
        closeModal();
        return;
      }

      setErrorMessage(
        result.error ?? "Ocurrió un error al guardar.",
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-center text-xl font-bold text-gray-800">
            {isEditing
              ? "Editar fecha para notas"
              : "Agregar fecha para notas"}
          </h3>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
              ⚠️ {errorMessage}
            </div>
          )}

          {!isEditing && todasUtilizadas && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center text-sm text-amber-700">
              Todas las fechas de notas ya han sido registradas.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label
                htmlFor="descripcion"
                className="text-sm font-semibold text-gray-700"
              >
                Descripción
              </label>

              <select
                id="descripcion"
                name="descripcion"
                defaultValue={descripcionInicial}
                required
                disabled={!isEditing && todasUtilizadas}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a] disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="" disabled>
                  Seleccione una descripción
                </option>

                {DESCRIPCIONES_FECHAS_NOTAS.map(
                  (opcion) => {
                    const yaUtilizada =
                      fechasExistentes.some(
                        (fecha) =>
                          fecha.descripcion ===
                          opcion.value,
                      );

                    return (
                      <option
                        key={opcion.value}
                        value={opcion.value}
                        disabled={
                          !isEditing && yaUtilizada
                        }
                      >
                        {opcion.label}
                      </option>
                    );
                  },
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fechaInicio"
                className="text-sm font-semibold text-gray-700"
              >
                Fecha de inicio
              </label>

              <input
                id="fechaInicio"
                type="date"
                name="fechaInicio"
                defaultValue={
                  fechaToEdit?.fechaInicio ?? ""
                }
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fechaFin"
                className="text-sm font-semibold text-gray-700"
              >
                Fecha de fin
              </label>

              <input
                id="fechaFin"
                type="date"
                name="fechaFin"
                defaultValue={
                  fechaToEdit?.fechaFin ?? ""
                }
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              type="submit"
              disabled={
                isPending ||
                (!isEditing && todasUtilizadas)
              }
              className="rounded-md bg-[#007bff] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0056b3] disabled:opacity-50"
            >
              {isPending ? "Guardando..." : "Guardar"}
            </button>

            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="rounded-md bg-[#dc3545] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#b02a37] disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}