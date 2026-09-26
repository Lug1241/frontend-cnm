"use client";

import React, { useState } from "react";
import {
  EstudianteRepresentanteItem,
  verificarDocumentosEstudianteAction,
} from "../actions";
import { EstudianteSeleccionado } from "../MatriculacionClient";

interface Props {
  estudiantes: EstudianteRepresentanteItem[];
  periodoMatriculaActivo: boolean;
  docsRepresentanteValidos: boolean;
  onSelectEstudiante: (estudiante: EstudianteSeleccionado) => void;
  mensajePeriodo?: string;
}

export default function TablaEstudiantesRepresentante({
  estudiantes,
  periodoMatriculaActivo,
  docsRepresentanteValidos,
  onSelectEstudiante,
  mensajePeriodo,
}: Props) {
  const [estudiantePendienteModal, setEstudiantePendienteModal] = useState<{
    nombre: string;
    mensaje: string;
  } | null>(null);
  const [verificandoCedula, setVerificandoCedula] = useState<string | null>(null);

  const calcularEdad = (fechaNacimiento?: string): number | string => {
    if (!fechaNacimiento) return "-";
    const limpia = fechaNacimiento.split("T")[0];
    const partes = limpia.split("-").map(Number);
    if (partes.length !== 3) return "-";
    const [year, month, day] = partes;
    const hoy = new Date();
    let edad = hoy.getFullYear() - year;
    const mesActual = hoy.getMonth() + 1;
    const diaActual = hoy.getDate();
    if (mesActual < month || (mesActual === month && diaActual < day)) {
      edad--;
    }
    return edad >= 0 ? edad : "-";
  };

  const handleIniciarMatricula = async (item: EstudianteRepresentanteItem) => {
    if (!periodoMatriculaActivo) {
      alert(
        mensajePeriodo ||
          "El período de matrícula no está activo actualmente. No es posible matricular.",
      );
      return;
    }

    if (!docsRepresentanteValidos) {
      alert(
        "Debe actualizar sus documentos (cédula y croquis) en 'Información representante' antes de matricular estudiantes.",
      );
      return;
    }

    setVerificandoCedula(item.nroCedula);
    try {
      const verificacion = await verificarDocumentosEstudianteAction(item.nroCedula);

      if (!verificacion.success || !verificacion.data?.datosActualizados) {
        setEstudiantePendienteModal({
          nombre: `${item.primerNombre} ${item.primerApellido}`,
          mensaje:
            verificacion.data?.message ||
            "El estudiante debe actualizar la cédula antes de matricularse.",
        });
        return;
      }

      onSelectEstudiante({
        id: item.id,
        nroCedula: item.nroCedula,
        primerNombre: item.primerNombre,
        primerApellido: item.primerApellido,
        nivel: item.nivel,
        jornada: item.jornada,
      });
    } finally {
      setVerificandoCedula(null);
    }
  };

  const puedeMatricular = periodoMatriculaActivo && docsRepresentanteValidos;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-[#003366]">Estudiantes a cargo</h2>
        <p className="text-xs text-gray-500 sm:text-sm">
          Seleccione un estudiante para revisar o gestionar su inscripción en el
          período lectivo activo.
        </p>
      </div>

      {estudiantes.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          No tienes estudiantes registrados a tu cargo.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-[#00408A] text-xs font-semibold uppercase tracking-wider text-white">
              <tr>
                <th className="px-4 py-3">Cédula</th>
                <th className="px-4 py-3">Primer nombre</th>
                <th className="px-4 py-3">Primer apellido</th>
                <th className="px-4 py-3 text-center">Edad</th>
                <th className="px-4 py-3">Género</th>
                <th className="px-4 py-3">Jornada</th>
                <th className="px-4 py-3">Nivel</th>
                <th className="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {estudiantes.map((estudiante) => {
                const enVerificacion = verificandoCedula === estudiante.nroCedula;
                return (
                  <tr
                    key={estudiante.id}
                    className="transition-colors hover:bg-gray-50/80"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                      {estudiante.nroCedula}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {estudiante.primerNombre}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {estudiante.primerApellido}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">
                      {calcularEdad(estudiante.fechaNacimiento)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {estudiante.genero}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {estudiante.jornada}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {estudiante.nivel}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => void handleIniciarMatricula(estudiante)}
                        disabled={!puedeMatricular || enVerificacion}
                        title={
                          !periodoMatriculaActivo
                            ? "Período de matrícula inactivo"
                            : !docsRepresentanteValidos
                              ? "Debe actualizar sus documentos de representante"
                              : "Empezar matrícula"
                        }
                        className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors ${
                          puedeMatricular
                            ? "text-[#28a745] hover:bg-green-50 hover:text-[#218838]"
                            : "cursor-not-allowed text-gray-300"
                        }`}
                      >
                        {enVerificacion ? (
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                        ) : (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de documentación pendiente del estudiante */}
      {estudiantePendienteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 text-amber-600">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-xl font-bold">
                ⚠️
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                Documentación pendiente
              </h3>
            </div>

            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <p className="font-medium text-gray-800">
                Estudiante: {estudiantePendienteModal.nombre}
              </p>
              <p>{estudiantePendienteModal.mensaje}</p>

              <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                <strong>Para continuar con la matrícula debe:</strong>
                <ul className="mt-1.5 list-disc space-y-1 pl-4">
                  <li>Actualizar los datos del estudiante</li>
                  <li>Cargar el documento de cédula vigente en PDF</li>
                </ul>
              </div>

              <p className="text-xs text-gray-500">
                Por favor, solicite o realice la actualización de los documentos del
                estudiante antes de iniciar su matriculación.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setEstudiantePendienteModal(null)}
                className="rounded-md bg-[#003F89] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003F89]"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

