"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MdCalendarMonth,
  MdChecklist,
  MdClose,
  MdInfoOutline,
} from "react-icons/md";

import type {
  EstudianteRepresentante,
  HorarioRepresentante,
  MatriculaRepresentante,
} from "@/types/RepresentanteEstudiantil";
import { obtenerHorarioEstudiante } from "./actions";
import HorarioEstudiante from "./HorarioEstudiante";
import InformacionEstudiante from "./InformacionEstudiante";

function nombreEstudiante(estudiante: EstudianteRepresentante) {
  return [
    estudiante.primerNombre,
    estudiante.segundoNombre,
    estudiante.primerApellido,
    estudiante.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

interface HorarioVisible {
  estudiante: EstudianteRepresentante;
  horario?: HorarioRepresentante;
  matricula?: MatriculaRepresentante;
  error?: string;
}

export default function EstudiantesRepresentanteClient({
  estudiantes,
  error,
}: {
  estudiantes: EstudianteRepresentante[];
  error?: string;
}) {
  const [informacion, setInformacion] =
    useState<EstudianteRepresentante | null>(null);
  const [horario, setHorario] = useState<HorarioVisible | null>(null);
  const [cargandoHorario, setCargandoHorario] = useState<number | null>(null);

  const verHorario = async (estudiante: EstudianteRepresentante) => {
    setCargandoHorario(estudiante.id);
    setHorario({ estudiante });
    const result = await obtenerHorarioEstudiante(estudiante.id);
    setHorario({
      estudiante,
      horario: result.data,
      matricula: result.matricula,
      error: result.error,
    });
    setCargandoHorario(null);
  };

  return (
    <div className="w-full space-y-10 p-4 sm:p-8">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {!error && estudiantes.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          No tienes estudiantes asociados.
        </div>
      )}

      {estudiantes.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
          <table className="w-full min-w-[760px] border-collapse text-base">
            <thead className="bg-[#004b91] text-white">
              <tr>
                <th className="border-r border-white/60 px-4 py-3 text-center">
                  Estudiante
                </th>
                <th className="border-r border-white/60 px-4 py-3 text-center">
                  Nivel
                </th>
                <th className="border-r border-white/60 px-4 py-3 text-center">
                  Especialidad
                </th>
                <th className="w-52 px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((estudiante) => {
                const nombre = nombreEstudiante(estudiante);
                const hrefCalificaciones =
                  "/dashboard/representante/estudiantes?" +
                  new URLSearchParams({
                    estudiante: String(estudiante.id),
                    vista: "calificaciones",
                  }).toString();

                return (
                  <tr key={estudiante.id} className="border-t border-gray-300">
                    <td className="border-r border-gray-300 px-4 py-3 text-center">
                      {nombre}
                    </td>
                    <td className="border-r border-gray-300 px-4 py-3 text-center">
                      {estudiante.nivel}
                    </td>
                    <td className="border-r border-gray-300 px-4 py-3 text-center">
                      {estudiante.especialidad}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-6 text-green-700">
                        <Link
                          href={hrefCalificaciones}
                          title="Ver calificaciones"
                          aria-label={`Ver calificaciones de ${nombre}`}
                          className="rounded p-1 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-700"
                        >
                          <MdChecklist className="h-7 w-7" aria-hidden />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setInformacion(estudiante)}
                          title="Ver información"
                          aria-label={`Ver información de ${nombre}`}
                          className="rounded p-1 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-700"
                        >
                          <MdInfoOutline className="h-7 w-7" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => void verHorario(estudiante)}
                          disabled={cargandoHorario === estudiante.id}
                          title="Ver horario"
                          aria-label={`Ver horario de ${nombre}`}
                          className="rounded p-1 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-50"
                        >
                          <MdCalendarMonth className="h-7 w-7" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {horario && (
        <section className="rounded-xl border border-[#004b91] bg-white p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b-2 border-[#004b91] pb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#004b91]">
                Horario de: {horario.estudiante.primerNombre}{" "}
                {horario.estudiante.primerApellido}
              </h2>
              {horario.matricula && (
                <p className="mt-1 text-sm text-gray-500">
                  {horario.matricula.periodoAcademico?.descripcion} ·{" "}
                  {horario.matricula.nivel}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setHorario(null)}
              aria-label="Cerrar horario"
              className="rounded-md border border-gray-400 p-3 text-gray-500 hover:bg-gray-50"
            >
              <MdClose className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {cargandoHorario === horario.estudiante.id && (
            <p className="py-8 text-center text-gray-500">Cargando horario...</p>
          )}
          {!cargandoHorario && horario.error && (
            <div
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800"
            >
              {horario.error}
            </div>
          )}
          {!cargandoHorario && horario.horario && (
            <HorarioEstudiante clases={horario.horario.clases} />
          )}
        </section>
      )}

      {informacion && (
        <InformacionEstudiante
          estudiante={informacion}
          onClose={() => setInformacion(null)}
        />
      )}
    </div>
  );
}
