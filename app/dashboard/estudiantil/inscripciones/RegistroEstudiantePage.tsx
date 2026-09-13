"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type Representante } from "@/types/Representante";
import EstudianteFormFields from "../estudiantes/EstudianteFormFields";
import { createEstudiante } from "../estudiantes/actions";

interface RegistroEstudiantePageProps {
  representantes: Representante[];
  initialError: string;
}

export default function RegistroEstudiantePage({
  representantes,
  initialError,
}: RegistroEstudiantePageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState(initialError);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createEstudiante(formData);
      if (result.success) {
        router.push("/dashboard/estudiantil/estudiantes");
        router.refresh();
      } else {
        setErrorMessage(result.error ?? "No se pudo registrar el estudiante.");
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-2xl font-bold text-[#00408a]">
            Registrar estudiante
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Ingresa la información personal, académica y su representante.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-5 p-6">
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              ⚠️ {errorMessage}
            </div>
          )}
          {representantes.length > 0 ? (
            <EstudianteFormFields representantes={representantes} />
          ) : (
            !errorMessage && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Debes registrar al menos un representante antes de crear un
                estudiante.
              </div>
            )
          )}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isPending || representantes.length === 0}
              className="rounded-md bg-[#007bff] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0056b3] disabled:opacity-50"
            >
              {isPending ? "Registrando..." : "Registrar estudiante"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/estudiantil/estudiantes")}
              disabled={isPending}
              className="rounded-md bg-gray-200 px-6 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
