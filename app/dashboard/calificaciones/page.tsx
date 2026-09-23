import Link from "next/link";
import { cookies } from "next/headers";

import { fetchAPI } from "@/lib/api";
import { Asignacion } from "@/types/Asignacion";
import { PeriodoAcademico } from "@/types/PeriodoAcademico";

import { agruparCursos } from "./_lib/cursos";

interface AsignacionesResponse {
  data: Asignacion[];
  totalRows: number;
}

export default async function CalificacionesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[#00408a]">Calificaciones</h1>

        <p className="mt-4 text-red-600">
          No se pudo identificar al docente autenticado.
        </p>
      </div>
    );
  }

  let periodoActivo: PeriodoAcademico | null = null;
  let asignaciones: Asignacion[] = [];
  let errorMessage: string | null = null;

  try {
    periodoActivo = await fetchAPI<PeriodoAcademico>(
      "/periodo_academico/activo",
    );

    const response = await fetchAPI<AsignacionesResponse>(
      `/asignaciones/docente/${userId}`,
    );

    asignaciones = (response.data ?? []).filter(
      (asignacion) =>
        asignacion.periodoAcademico?.id === periodoActivo?.id,
    );
  } catch (error) {
    console.error("Error cargando cursos del docente:", error);
    errorMessage =
      error instanceof Error
        ? error.message
        : "No se pudieron cargar los cursos.";
  }

  const cursos = agruparCursos(asignaciones);

  return (
    <div className="flex flex-col w-full p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#00408a]">
          Cursos
        </h1>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {errorMessage}
        </div>
      ) : cursos.length === 0 ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-700">
          Aún no tienes cursos asignados para el período activo.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cursos.map((curso) => (
            <Link
            key={curso.id}
            href={`/dashboard/calificaciones/${curso.id}`}
            className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-6 text-center shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
            >
            <span className="mb-4 text-5xl">📖</span>

            <h2 className="font-bold text-gray-800">
                Curso: {curso.nombreMateria}
            </h2>

            <p className="mt-2 text-gray-700">
                Nivel: {curso.tipoNivel}
            </p>

            <p className="text-sm text-gray-600">
                {curso.asignaciones.length} asignación(es)
            </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}