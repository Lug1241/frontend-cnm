"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type Representante } from "@/types/Representante";
import EstudianteFormFields from "../estudiantes/EstudianteFormFields";
import { createEstudiante } from "../estudiantes/actions";
import RepresentanteModal from "../representantes/RepresentanteModal";
import {
  createRepresentante,
  getRepresentanteByCedula,
} from "../representantes/actions";

export default function RegistroEstudiantePage() {
  const router = useRouter();

  const [isSearching, startSearchTransition] = useTransition();
  const [isSubmitting, startSubmitTransition] = useTransition();

  const [cedulaBusqueda, setCedulaBusqueda] = useState("");
  const [representanteSeleccionado, setRepresentanteSeleccionado] =
    useState<Representante | null>(null);
  const [representanteNoEncontrado, setRepresentanteNoEncontrado] =
    useState(false);
  const [isRepresentanteModalOpen, setIsRepresentanteModalOpen] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const buscarRepresentante = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const cedula = cedulaBusqueda.trim();

    setErrorMessage("");
    setRepresentanteSeleccionado(null);
    setRepresentanteNoEncontrado(false);

    if (!/^\d{7,10}$/.test(cedula)) {
      setErrorMessage("La cédula debe contener entre 7 y 10 dígitos.");
      return;
    }

    startSearchTransition(async () => {
      const result = await getRepresentanteByCedula(cedula);

      if (!result.success) {
        setErrorMessage(
          result.error ?? "No se pudo buscar el representante.",
        );
        return;
      }

      if (result.data) {
        setRepresentanteSeleccionado(result.data);
        return;
      }

      setRepresentanteNoEncontrado(true);
    });
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!representanteSeleccionado) {
      setErrorMessage(
        "Debes seleccionar o registrar un representante antes de crear al estudiante.",
      );
      return;
    }

    const formData = new FormData(event.currentTarget);

    startSubmitTransition(async () => {
      const result = await createEstudiante(formData);

      if (result.success) {
        router.push(
          "/dashboard/estudiantil/estudiantes?toast=estudiante-creado",
        );
        router.refresh();
      } else {
        setErrorMessage(
          result.error ?? "No se pudo registrar el estudiante.",
        );
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
            Busca primero al representante para continuar con el registro del
            estudiante.
          </p>
        </div>

        <div className="space-y-6 p-6">
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              ⚠️ {errorMessage}
            </div>
          )}

          <form
            onSubmit={buscarRepresentante}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              Buscar representante
            </h3>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex flex-1 flex-col gap-1.5 text-sm font-semibold text-gray-700">
                Nro. cédula
                <input
                  value={cedulaBusqueda}
                  onChange={(event) =>
                    setCedulaBusqueda(event.target.value)
                  }
                  inputMode="numeric"
                  pattern="[0-9]{7,10}"
                  minLength={7}
                  maxLength={10}
                  required
                  disabled={isSearching}
                  className="rounded-md border border-gray-300 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-[#00408a] disabled:bg-gray-100"
                />
              </label>

              <button
                type="submit"
                disabled={isSearching}
                className="rounded-md bg-[#007bff] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0056b3] disabled:opacity-50"
              >
                {isSearching ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </form>

          {representanteSeleccionado && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="font-semibold text-green-800">
                Representante encontrado
              </p>

              <p className="mt-1 text-sm text-green-700">
                {representanteSeleccionado.primerNombre}{" "}
                {representanteSeleccionado.segundoNombre}{" "}
                {representanteSeleccionado.primerApellido}{" "}
                {representanteSeleccionado.segundoApellido}
              </p>

              <p className="text-sm text-green-700">
                Cédula: {representanteSeleccionado.nroCedula}
              </p>

              <p className="text-sm text-green-700">
                Correo: {representanteSeleccionado.email}
              </p>
            </div>
          )}

          {representanteNoEncontrado && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">
                Representante no encontrado
              </p>

              <p className="mt-1 text-sm text-amber-700">
                No existe un representante registrado con la cédula ingresada.
              </p>

              <button
                type="button"
                onClick={() => setIsRepresentanteModalOpen(true)}
                className="mt-3 rounded-md bg-[#007bff] px-5 py-2 text-sm font-medium text-white hover:bg-[#0056b3]"
              >
                Agregar representante
              </button>
            </div>
          )}

          {representanteSeleccionado && (
            <form onSubmit={submit} className="space-y-5">
              <div className="border-t border-gray-200 pt-5">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                  Datos del estudiante
                </h3>

                <EstudianteFormFields
                  representanteId={representanteSeleccionado.id}
                />
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-[#007bff] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0056b3] disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Registrando..."
                    : "Registrar estudiante"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/dashboard/estudiantil/estudiantes")
                  }
                  disabled={isSubmitting}
                  className="rounded-md bg-gray-200 px-6 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <RepresentanteModal
        isOpen={isRepresentanteModalOpen}
        onClose={() => setIsRepresentanteModalOpen(false)}
        onSaveAction={async (_cedula, formData) => {
          const result = await createRepresentante(formData);

          if (result.success && result.data) {
            setRepresentanteSeleccionado(result.data);
            setRepresentanteNoEncontrado(false);
            setCedulaBusqueda(result.data.nroCedula);
          }

          return result;
        }}
      />
    </div>
  );
}