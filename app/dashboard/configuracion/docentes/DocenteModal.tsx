"use client";

import { useState, useTransition } from "react";
import { type Docente } from "@/types/Docente";
import { type DocenteActionResult } from "./actions";

interface DocenteModalProps {
  isOpen: boolean;
  onClose: () => void;
  docenteToEdit?: Docente | null;
  onSaveAction: (cedula: string | null, formData: FormData) => Promise<DocenteActionResult>;
}

export default function DocenteModal({
  isOpen,
  onClose,
  docenteToEdit,
  onSaveAction,
}: DocenteModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isEditing = docenteToEdit !== null && docenteToEdit !== undefined;

  const closeModal = () => {
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    // Extraemos la cédula actual si estamos editando, o null si estamos creando
    const cedula = isEditing ? docenteToEdit.nroCedula : null;

    startTransition(async () => {
      const result = await onSaveAction(cedula, formData);
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
            {isEditing ? "Editar Docente" : "Agregar Docente"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Nro. Cédula
              </label>
              <input
                type="text"
                name="nroCedula"
                defaultValue={docenteToEdit?.nroCedula ?? ""}
                minLength={7}
                maxLength={10}
                required
                readOnly={isEditing}
                placeholder="Ej. 1712345678"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00408a] ${
                  isEditing ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-white border-gray-300 focus:border-transparent"
                }`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Rol
              </label>
              <input
                type="text"
                name="rol"
                defaultValue={docenteToEdit?.rol ?? "Docente"}
                required
                maxLength={50}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Primer Nombre
              </label>
              <input
                type="text"
                name="primerNombre"
                defaultValue={docenteToEdit?.primerNombre ?? ""}
                required
                maxLength={50}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Segundo Nombre
              </label>
              <input
                type="text"
                name="segundoNombre"
                defaultValue={docenteToEdit?.segundoNombre ?? ""}
                required
                maxLength={50}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Primer Apellido
              </label>
              <input
                type="text"
                name="primerApellido"
                defaultValue={docenteToEdit?.primerApellido ?? ""}
                required
                maxLength={50}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Segundo Apellido
              </label>
              <input
                type="text"
                name="segundoApellido"
                defaultValue={docenteToEdit?.segundoApellido ?? ""}
                required
                maxLength={50}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Celular
              </label>
              <input
                type="text"
                name="celular"
                defaultValue={docenteToEdit?.celular ?? ""}
                required
                minLength={10}
                maxLength={10}
                placeholder="Ej. 0991234567"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={docenteToEdit?.email ?? ""}
                required
                placeholder="ejemplo@correo.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              />
            </div>

            {isEditing && (
              <div className="flex flex-col gap-1.5 sm:col-span-2 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="habilitado"
                    defaultChecked={docenteToEdit?.habilitado ?? false}
                    className="h-4 w-4 rounded border-gray-300 text-[#00408a] focus:ring-[#00408a]"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Docente Habilitado
                  </span>
                </label>
              </div>
            )}
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