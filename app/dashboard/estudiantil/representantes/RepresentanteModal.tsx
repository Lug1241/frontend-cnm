"use client";

import { useState, useTransition } from "react";
import { type Representante } from "@/types/Representante";
import { type RepresentanteActionResult } from "./actions";

interface RepresentanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  representanteToEdit?: Representante | null;
  onSaveAction: (
    cedula: string | null,
    formData: FormData,
  ) => Promise<RepresentanteActionResult>;
}

const nameFields = [
  ["primerNombre", "Primer nombre"],
  ["segundoNombre", "Segundo nombre"],
  ["primerApellido", "Primer apellido"],
  ["segundoApellido", "Segundo apellido"],
] as const;

export default function RepresentanteModal({
  isOpen,
  onClose,
  representanteToEdit,
  onSaveAction,
}: RepresentanteModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;
  const isEditing = Boolean(representanteToEdit);

  const closeModal = () => {
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await onSaveAction(
        representanteToEdit?.nroCedula ?? null,
        formData,
      );
      if (result.success) closeModal();
      else setErrorMessage(result.error ?? "Ocurrió un error al guardar.");
    });
  };

  const inputClass =
    "rounded-md border border-gray-300 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-[#00408a]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="my-4 w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-center text-xl font-bold text-gray-800">
            {isEditing ? "Editar representante" : "Agregar representante"}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
              ⚠️ {errorMessage}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Nro. cédula
              <input
                name="nroCedula"
                defaultValue={representanteToEdit?.nroCedula ?? ""}
                inputMode="numeric"
                pattern="[0-9]{7,10}"
                minLength={7}
                maxLength={10}
                required
                readOnly={isEditing}
                className={`${inputClass} ${isEditing ? "bg-gray-100 text-gray-500" : ""}`}
              />
            </label>
            {nameFields.map(([name, label]) => (
              <label
                key={name}
                className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700"
              >
                {label}
                <input
                  name={name}
                  defaultValue={representanteToEdit?.[name] ?? ""}
                  minLength={2}
                  maxLength={50}
                  required
                  className={inputClass}
                />
              </label>
            ))}
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Celular
              <input name="celular" defaultValue={representanteToEdit?.celular ?? ""} inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} required className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Correo electrónico
              <input type="email" name="email" defaultValue={representanteToEdit?.email ?? ""} required className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Teléfono convencional
              <input name="convencional" defaultValue={representanteToEdit?.convencional ?? ""} inputMode="numeric" pattern="[0-9]{7,10}" maxLength={10} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Contacto de emergencia
              <input name="emergencia" defaultValue={representanteToEdit?.emergencia ?? ""} inputMode="numeric" pattern="[0-9]{7,10}" minLength={7} maxLength={10} required className={inputClass} />
            </label>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <button type="submit" disabled={isPending} className="rounded-md bg-[#007bff] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0056b3] disabled:opacity-50">
              {isPending ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={closeModal} disabled={isPending} className="rounded-md bg-[#dc3545] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#b02a37] disabled:opacity-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
