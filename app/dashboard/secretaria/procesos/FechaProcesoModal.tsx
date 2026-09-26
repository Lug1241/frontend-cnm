"use client";

import { useState, useTransition } from "react";
import {
  TIPO_PROCESO_LABELS,
  type FechaProceso,
  type TipoProceso,
} from "@/types/FechaProceso";
import { type FechaProcesoActionResult } from "./actions";

interface FechaProcesoModalProps {
  isOpen: boolean;
  onClose: () => void;
  procesoToEdit?: FechaProceso | null;
  onSaveAction: (
    id: number | null,
    formData: FormData,
  ) => Promise<FechaProcesoActionResult>;
}

const PROCESOS_SECRETARIA: TipoProceso[] = [
  "matricula",
  "actualizacion_datos",
];

export default function FechaProcesoModal({
  isOpen,
  onClose,
  procesoToEdit,
  onSaveAction,
}: FechaProcesoModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isEditing = Boolean(procesoToEdit);

  const closeModal = () => {
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await onSaveAction(procesoToEdit?.id ?? null, formData);

      if (result.success) {
        closeModal();
      } else {
        setErrorMessage(result.error ?? "Ocurrió un error al guardar.");
      }
    });
  };

  const inputClass =
    "rounded-md border border-gray-300 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-[#00408a]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-center text-xl font-bold text-gray-800">
            {isEditing ? "Editar proceso" : "Agregar proceso"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700 sm:col-span-2">
              Proceso
              <select
                name="proceso"
                defaultValue={procesoToEdit?.proceso ?? "matricula"}
                required
                className={inputClass}
              >
                {PROCESOS_SECRETARIA.map((proceso) => (
                  <option key={proceso} value={proceso}>
                    {TIPO_PROCESO_LABELS[proceso]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Fecha inicio
              <input
                type="date"
                name="fechaInicio"
                defaultValue={procesoToEdit?.fechaInicio ?? ""}
                required
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Fecha fin
              <input
                type="date"
                name="fechaFin"
                defaultValue={procesoToEdit?.fechaFin ?? ""}
                required
                className={inputClass}
              />
            </label>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-[#007bff] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0056b3] disabled:opacity-50"
            >
              {isPending ? "Guardando..." : "Guardar"}
            </button>

            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="rounded-md bg-[#dc3545] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#b02a37] disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}