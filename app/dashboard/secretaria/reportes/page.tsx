import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { fetchAPI } from "@/lib/api";
import type { PeriodoAcademico } from "@/types/PeriodoAcademico";
import type {
  EstudianteReporteResumen,
  NivelMatricula,
} from "@/types/ReporteCalificaciones";

interface PeriodosResponse {
  data: PeriodoAcademico[];
}

function parseId(value?: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function nombreEstudiante(estudiante: EstudianteReporteResumen) {
  return [
    estudiante.primerApellido,
    estudiante.segundoApellido,
    estudiante.primerNombre,
    estudiante.segundoNombre,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function ReportesSecretariaPage({
  searchParams,
}: {
  searchParams: Promise<{
    periodo?: string;
    nivel?: string;
  }>;
}) {
  const cookieStore = await cookies();

  if (cookieStore.get("rol")?.value !== "Secretaria") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const periodoSolicitado = parseId(params.periodo);

  let periodos: PeriodoAcademico[] = [];
  let periodoActivo: PeriodoAcademico | null = null;
  let niveles: NivelMatricula[] = [];
  let estudiantes: EstudianteReporteResumen[] = [];
  let errorMsg = "";

  try {
    const [periodosResponse, activoResponse] = await Promise.all([
      fetchAPI<PeriodosResponse>("/periodo_academico/obtener?limit=100"),
      fetchAPI<PeriodoAcademico>("/periodo_academico/activo").catch(() => null),
    ]);

    periodos = periodosResponse.data ?? [];
    periodoActivo = activoResponse;
  } catch (error) {
    errorMsg =
      error instanceof Error
        ? error.message
        : "No se pudieron cargar los períodos académicos.";
  }

  const periodoSeleccionado =
    periodoSolicitado ??
    periodoActivo?.id ??
    periodos[0]?.id ??
    null;

  if (!errorMsg && periodoSeleccionado) {
    try {
      niveles = await fetchAPI<NivelMatricula[]>(
        `/matriculas/periodo/${periodoSeleccionado}/niveles`,
      );
    } catch (error) {
      errorMsg =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los niveles del período.";
    }
  }

  const nivelSeleccionado =
    params.nivel && niveles.includes(params.nivel as NivelMatricula)
      ? (params.nivel as NivelMatricula)
      : null;

  if (!errorMsg && periodoSeleccionado && nivelSeleccionado) {
    try {
      estudiantes = await fetchAPI<EstudianteReporteResumen[]>(
        `/estudiantes/matricula/${encodeURIComponent(nivelSeleccionado)}/periodo/${periodoSeleccionado}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los estudiantes.";

      if (!message.includes("No se encontró ningún estudiante")) {
        errorMsg = message;
      }
    }
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl font-bold text-[#00408a] sm:text-3xl">
          Reportes de Secretaría
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Consulta las calificaciones de los estudiantes por período académico y
          nivel de matrícula.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <form
        method="get"
        className="grid gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end"
      >
        <label className="space-y-2 text-sm font-medium text-gray-700">
          Período académico
          <select
            name="periodo"
            defaultValue={periodoSeleccionado ?? ""}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
          >
            <option value="">Seleccione un período</option>
            {periodos.map((periodo) => (
              <option key={periodo.id} value={periodo.id}>
                {periodo.descripcion}
                {periodo.estado === "Activo" ? " (Activo)" : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-gray-700">
          Nivel
          <select
            name="nivel"
            defaultValue={nivelSeleccionado ?? ""}
            disabled={!periodoSeleccionado || niveles.length === 0}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
          >
            <option value="">Seleccione un nivel</option>
            {niveles.map((nivel) => (
              <option key={nivel} value={nivel}>
                {nivel}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="rounded-md bg-[#00408a] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#00336e]"
        >
          Consultar
        </button>
      </form>

      {periodoSeleccionado && niveles.length === 0 && !errorMsg && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          No hay niveles con estudiantes matriculados en este período.
        </div>
      )}

      {nivelSeleccionado && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Estudiantes
            </h2>
            <p className="text-sm text-gray-500">{nivelSeleccionado}</p>
          </div>

          {estudiantes.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              No hay estudiantes matriculados en el nivel seleccionado.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {estudiantes.map((estudiante) => {
                const matricula = estudiante.matriculas?.find(
                  (item) =>
                    item.periodoAcademicoId === periodoSeleccionado &&
                    item.nivel === nivelSeleccionado,
                );

                if (!matricula) return null;

                const query = new URLSearchParams({
                  periodo: String(periodoSeleccionado),
                  nivel: nivelSeleccionado,
                });

                return (
                  <Link
                    key={matricula.id}
                    href={`/dashboard/secretaria/reportes/${matricula.id}?${query.toString()}`}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#00408a] hover:shadow-md"
                  >
                    <p className="font-semibold text-gray-800">
                      {nombreEstudiante(estudiante)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Cédula: {estudiante.nroCedula}
                    </p>
                    <p className="mt-4 text-sm font-medium text-[#00408a]">
                      Ver reporte de calificaciones →
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
