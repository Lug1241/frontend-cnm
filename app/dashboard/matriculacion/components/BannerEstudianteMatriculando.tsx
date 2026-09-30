import React from "react";
import { EstudianteSeleccionado } from "../MatriculacionClient";

interface Props {
  estudiante: EstudianteSeleccionado;
  onCambiarEstudiante: () => void;
}

export default function BannerEstudianteMatriculando({
  estudiante,
  onCambiarEstudiante,
}: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-blue-200 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-start gap-3 sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#003366] text-white">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">
            Matriculando a:
          </span>
          <h2 className="text-lg font-bold text-[#003366]">
            {estudiante.primerNombre} {estudiante.primerApellido}
          </h2>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 sm:text-sm">
            <span>
              <strong className="text-gray-800">Cédula:</strong> {estudiante.nroCedula}
            </span>
            <span>
              <strong className="text-gray-800">Nivel:</strong> {estudiante.nivel}
            </span>
            <span>
              <strong className="text-gray-800">Jornada:</strong> {estudiante.jornada}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onCambiarEstudiante}
        className="inline-flex items-center justify-center gap-1.5 self-start rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#003366] sm:self-auto sm:text-sm"
        title="Cancelar y volver a la lista de estudiantes"
      >
        <svg
          className="h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        Finalizar matrícula
      </button>
    </div>
  );
}

