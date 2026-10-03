"use client";

import { ArchivoPdfLink } from "@/app/components/ui/ArchivoPdf";
import type { EstudianteRepresentante } from "@/types/RepresentanteEstudiantil";

const inputClass =
  "h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-600";

function fechaInput(value?: string) {
  return value?.slice(0, 10) ?? "";
}

function Campo({
  label,
  value,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  type?: "text" | "date";
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
      <span>
        {label}
        {required ? ": *" : ":"}
      </span>
      <input
        type={type}
        value={value}
        disabled
        readOnly
        className={inputClass}
      />
    </label>
  );
}

export default function InformacionEstudiante({
  estudiante,
  onClose,
}: {
  estudiante: EstudianteRepresentante;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-informacion-estudiante"
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="p-5 sm:p-7">
          <h2
            id="titulo-informacion-estudiante"
            className="mb-6 text-center text-2xl font-bold text-gray-900"
          >
            Información completa de {estudiante.primerNombre}{" "}
            {estudiante.primerApellido}
          </h2>

          <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
            <Campo
              label="Número de cédula"
              value={estudiante.nroCedula}
              required
            />
            <Campo label="Nivel" value={estudiante.nivel} />
            <Campo
              label="Primer nombre"
              value={estudiante.primerNombre}
              required
            />
            <Campo
              label="Primer apellido"
              value={estudiante.primerApellido}
              required
            />
            <Campo
              label="Segundo nombre"
              value={estudiante.segundoNombre ?? ""}
            />
            <Campo
              label="Segundo apellido"
              value={estudiante.segundoApellido ?? ""}
            />
            <Campo
              label="Fecha de nacimiento"
              value={fechaInput(estudiante.fechaNacimiento)}
              type="date"
              required
            />
            <Campo label="Género" value={estudiante.genero} required />
            <Campo
              label="Grupo étnico"
              value={estudiante.grupoEtnico}
              required
            />
            <Campo label="Dirección" value={estudiante.direccion} required />
            <Campo
              label="Especialidad"
              value={estudiante.especialidad}
              required
            />
            <Campo label="Jornada" value={estudiante.jornada} required />
            <Campo label="IER" value={estudiante.ier} required />
            <Campo
              label="# de cédula representante"
              value={estudiante.representanteCedula}
            />
          </div>

          <div className="mt-6 rounded-lg border-2 border-dashed border-blue-500 p-5">
            <p className="font-bold text-gray-900">
              Copia de Cédula Estudiante:
            </p>
            <div className="mt-2 text-sm">
              <span className="mr-2 text-gray-500">Archivo actual:</span>
              <ArchivoPdfLink ruta={estudiante.cedulaPdf} />
            </div>
            <input
              type="file"
              disabled
              className="mt-4 w-full rounded-md bg-blue-500 px-3 py-3 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-white file:px-3 file:py-2 file:text-blue-600"
            />
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              disabled
              className="rounded-md bg-blue-400 px-6 py-2.5 font-semibold text-white opacity-70"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-red-500 px-6 py-2.5 font-semibold text-white hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
