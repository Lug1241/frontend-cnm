"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { ReporteCalificaciones } from "@/types/ReporteCalificaciones";
import type {
  EstudianteRepresentante,
  MatriculaRepresentante,
} from "@/types/RepresentanteEstudiantil";
import ReporteCalificacionesRepresentante from "./ReporteCalificacionesRepresentante";

function nombreCompleto(estudiante: EstudianteRepresentante) {
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

export default function CalificacionesRepresentante({
  estudiante,
  matriculas,
  matriculaSeleccionada,
  reporte,
  error,
}: {
  estudiante: EstudianteRepresentante;
  matriculas: MatriculaRepresentante[];
  matriculaSeleccionada: MatriculaRepresentante | null;
  reporte: ReporteCalificaciones | null;
  error?: string;
}) {
  const router = useRouter();
  const nombreCorto = `${estudiante.primerNombre} ${estudiante.primerApellido}`;

  const cambiarPeriodo = (matriculaId: string) => {
    const query = new URLSearchParams({
      estudiante: String(estudiante.id),
      vista: "calificaciones",
    });
    if (matriculaId) query.set("matricula", matriculaId);
    router.replace(`/dashboard/representante/estudiantes?${query.toString()}`);
  };

  return (
    <div className="w-full space-y-7 p-4 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-normal text-gray-900 sm:text-3xl">
          Calificaciones de {nombreCorto}
        </h1>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="periodo-calificaciones">
            Período académico
          </label>
          <select
            id="periodo-calificaciones"
            value={matriculaSeleccionada?.id ?? ""}
            onChange={(event) => cambiarPeriodo(event.target.value)}
            className="rounded-lg border border-gray-500 bg-gray-600 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione un período académico</option>
            {matriculas.map((matricula) => (
              <option key={matricula.id} value={matricula.id}>
                {matricula.periodoAcademico?.descripcion ??
                  `Periodo ${matricula.periodoAcademicoId}`}
              </option>
            ))}
          </select>
          <Link
            href="/dashboard/representante/estudiantes"
            className="rounded-lg bg-blue-500 px-7 py-3 text-center text-white hover:bg-blue-600"
          >
            Volver a lista
          </Link>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {!error && matriculas.length === 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-center text-blue-800">
          El estudiante no tiene períodos académicos registrados.
        </div>
      )}

      {!error && matriculas.length > 0 && !matriculaSeleccionada && (
        <div className="mx-auto mt-24 max-w-2xl rounded-xl border-l-4 border-blue-500 bg-blue-50 p-8 text-center text-gray-700 shadow-sm">
          <p className="text-lg font-bold text-blue-700">
            Seleccione un período académico
          </p>
          <p className="mt-3">
            Para visualizar las calificaciones de <strong>{nombreCorto}</strong>,
            seleccione un período académico del menú desplegable superior.
          </p>
        </div>
      )}

      {!error && matriculaSeleccionada && reporte && (
        <ReporteCalificacionesRepresentante
          cursos={reporte.cursos}
          estudiante={nombreCompleto(estudiante)}
          primerNombre={estudiante.primerNombre}
          primerApellido={estudiante.primerApellido}
          nivel={matriculaSeleccionada.nivel}
          periodo={
            matriculaSeleccionada.periodoAcademico?.descripcion ??
            `Periodo ${matriculaSeleccionada.periodoAcademicoId}`
          }
        />
      )}
    </div>
  );
}
