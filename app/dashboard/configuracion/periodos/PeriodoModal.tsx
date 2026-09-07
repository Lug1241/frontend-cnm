"use client";
import { useState, useTransition } from "react";
import { PeriodoAcademico } from "@/types/PeriodoAcademico";

interface PeriodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodoToEdit?: PeriodoAcademico | null; // Si viene con datos, es Edición; si es null/undefined, es Creación
  onSaveAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export default function PeriodoModal({
  isOpen,
  onClose,
  periodoToEdit,
  onSaveAction,
}: PeriodoModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isEditing = !!periodoToEdit;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await onSaveAction(formData);
      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.error || "Ocurrió un error al guardar.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Título dinámico */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 text-center">
            {isEditing ? "Editar periodo" : "Agregar periodo"}
          </h3>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Descripción (Ocupa todo el ancho si prefieres o se adapta) */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Descripción
              </label>
              <input
                type="text"
                name="descripcion"
                defaultValue={periodoToEdit?.descripcion || ""}
                required
                placeholder="Ej. Período 2026-2027"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00408a] focus:border-transparent text-sm"
              />
            </div>

            {/* Fecha de inicio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Fecha inicio
              </label>
              <input
                type="date" // O tipo texto si tu backend maneja el formato string directo como en tu mock
                name="fechaInicio"
                defaultValue={periodoToEdit?.fechaInicio || ""}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00408a] focus:border-transparent text-sm"
              />
            </div>

            {/* Fecha fin */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Fecha fin
              </label>
              <input
                type="date"
                name="fechaFin"
                defaultValue={periodoToEdit?.fechaFin || ""}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00408a] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-center items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-[#007bff] hover:bg-[#0056b3] text-white font-medium text-sm rounded-md shadow-sm transition-colors disabled:opacity-50"
            >
              {isPending ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-6 py-2.5 bg-[#dc3545] hover:bg-[#b02a37] text-white font-medium text-sm rounded-md shadow-sm transition-colors"
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}