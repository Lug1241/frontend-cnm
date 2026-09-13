"use client";

import { useState, useTransition } from "react";
import {
  Materia,
  NIVELES_MATERIA,
  TIPOS_MATERIA,
  TipoMateria,
} from "@/types/Materia";
import { MateriaActionResult } from "./actions";

interface MateriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiaToEdit?: Materia | null;
  onSaveAction: (formData: FormData) => Promise<MateriaActionResult>;
}

function normalizeTipo(tipo?: Materia["tipo"]): TipoMateria | "" {
  if (!tipo) return "";
  return tipo.toLowerCase() === "grupal" ? "Grupal" : "Individual";
}

export default function MateriaModal({
  isOpen,
  onClose,
  materiaToEdit,
  onSaveAction,
}: MateriaModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isEditing = materiaToEdit !== null && materiaToEdit !== undefined;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-center text-xl font-bold text-gray-800">
            {isEditing ? "Editar materia" : "Agregar materia"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                defaultValue={materiaToEdit?.nombre ?? ""}
                minLength={2}
                maxLength={50}
                required
                placeholder="Ej. Piano"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Nivel
              </label>
              <select
                name="nivel"
                defaultValue={materiaToEdit?.nivel ?? ""}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              >
                <option value="" disabled>
                  Seleccione un nivel
                </option>
                {NIVELES_MATERIA.map((nivel) => (
                  <option key={nivel} value={nivel}>
                    {nivel}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Tipo
              </label>
              <select
                name="tipo"
                defaultValue={normalizeTipo(materiaToEdit?.tipo)}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              >
                <option value="" disabled>
                  Seleccione un tipo
                </option>
                {TIPOS_MATERIA.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Edad mínima
              </label>
              <input
                type="number"
                name="edadMin"
                defaultValue={materiaToEdit?.edadMin ?? 7}
                min={7}
                step={1}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              />
            </div>

          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isPending}
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
