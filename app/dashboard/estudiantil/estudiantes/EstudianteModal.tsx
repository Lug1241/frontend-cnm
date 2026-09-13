"use client";

import { useState, useTransition } from "react";
import { type Estudiante } from "@/types/Estudiante";
import { type Representante } from "@/types/Representante";
import { type EstudianteActionResult } from "./actions";
import EstudianteFormFields from "./EstudianteFormFields";

interface EstudianteModalProps {
  estudiante: Estudiante | null;
  representantes: Representante[];
  onClose: () => void;
  onSaveAction: (formData: FormData) => Promise<EstudianteActionResult>;
}

export default function EstudianteModal({
  estudiante,
  representantes,
  onClose,
  onSaveAction,
}: EstudianteModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  if (!estudiante) return null;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await onSaveAction(formData);
      if (result.success) onClose();
      else setErrorMessage(result.error ?? "Ocurrió un error al guardar.");
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="my-4 w-full max-w-5xl rounded-xl bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-center text-xl font-bold text-gray-800">Editar estudiante</h3>
        </div>
        <form onSubmit={submit} className="space-y-5 p-6">
          {errorMessage && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">⚠️ {errorMessage}</div>}
          <EstudianteFormFields estudiante={estudiante} representantes={representantes} />
          <div className="flex justify-center gap-4 pt-4">
            <button type="submit" disabled={isPending} className="rounded-md bg-[#007bff] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0056b3] disabled:opacity-50">{isPending ? "Guardando..." : "Guardar"}</button>
            <button type="button" onClick={onClose} disabled={isPending} className="rounded-md bg-[#dc3545] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#b02a37] disabled:opacity-50">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
