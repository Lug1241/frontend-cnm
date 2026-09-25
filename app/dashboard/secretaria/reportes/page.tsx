import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  MdArrowBack,
  MdEmojiEvents,
  MdLibraryBooks,
  MdMenuBook,
  MdSchool,
  MdVisibility,
} from "react-icons/md";

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

function NivelIcon({ nivel }: { nivel: NivelMatricula }) {
  const className = "h-12 w-12 text-[#00408a]";

  if (nivel.includes("Básico Elemental")) {
    return <MdMenuBook className={className} aria-hidden />;
  }

  if (nivel.includes("Básico Medio")) {
    return <MdLibraryBooks className={className} aria-hidden />;
  }

  if (nivel.includes("Básico Superior")) {
    return <MdSchool className={className} aria-hidden />;
  }

  return <MdEmojiEvents className={className} aria-hidden />;
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
    periodoSolicitado ?? periodoActivo?.id ?? periodos[0]?.id ?? null;

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

  const periodoActual = periodos.find(
    (periodo) => periodo.id === periodoSeleccionado,
  );

  const filasEstudiantes = estudiantes
    .map((estudiante) => {
      const matricula = estudiante.matriculas?.find(
        (item) =>
          item.periodoAcademicoId === periodoSeleccionado &&
          item.nivel === nivelSeleccionado,
      );

      return matricula ? { estudiante, matricula } : null;
    })
    .filter(
      (
        fila,
      ): fila is {
        estudiante: EstudianteReporteResumen;
        matricula: NonNullable<
          EstudianteReporteResumen["matriculas"]
        >[number];
      } => fila !== null,
    );

  return (
    <div className="w-full space-y-6 p-4 sm:p-8">
      {!nivelSeleccionado && (
        <div>
          <h1 className="text-2xl font-bold text-[#00408a] sm:text-3xl">
            Reportes de calificaciones por Nivel
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Selecciona un período académico para consultar los niveles con
            estudiantes matriculados.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {!nivelSeleccionado && (
        <form
          method="get"
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <label className="block max-w-2xl space-y-2 text-sm font-medium text-gray-700">
            Período académico
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <select
                name="periodo"
                defaultValue={periodoSeleccionado ?? ""}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              >
                <option value="">Seleccione un período</option>
                {periodos.map((periodo) => (
                  <option key={periodo.id} value={periodo.id}>
                    {periodo.descripcion}
                    {periodo.estado === "Activo" ? " (Activo)" : ""}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="shrink-0 rounded-md bg-[#00408a] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#00336e]"
              >
                Ver niveles
              </button>
            </div>
          </label>
        </form>
      )}

      {!nivelSeleccionado && periodoSeleccionado && niveles.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Niveles académicos
            </h2>
            <p className="text-sm text-gray-500">
              {periodoActual?.descripcion ?? "Período seleccionado"}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {niveles.map((nivel) => {
              const query = new URLSearchParams({
                periodo: String(periodoSeleccionado),
                nivel,
              });

              return (
                <Link
                  key={nivel}
                  href={`/dashboard/secretaria/reportes?${query.toString()}`}
                  className="group flex min-h-56 flex-col items-center justify-between rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-[#00408a] hover:shadow-md"
                >
                  <div className="flex flex-col items-center">
                    <div className="mb-4 rounded-full bg-blue-50 p-4 transition group-hover:bg-blue-100">
                      <NivelIcon nivel={nivel} />
                    </div>
                    <h3 className="text-base font-bold text-[#00408a]">
                      {nivel}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Accede a los reportes académicos registrados para este nivel.
                    </p>
                  </div>

                  <span className="mt-5 rounded-md bg-[#00408a] px-4 py-2 text-sm font-semibold text-white">
                    Ver Reportes de Estudiantes
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {!nivelSeleccionado &&
        periodoSeleccionado &&
        niveles.length === 0 &&
        !errorMsg && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            No se encontraron niveles con estudiantes matriculados para este período.
          </div>
        )}

      {nivelSeleccionado && (
        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Listado de Estudiantes - {nivelSeleccionado}
              </h2>
              <p className="text-sm text-gray-500">
                {periodoActual?.descripcion ?? "Período seleccionado"}
              </p>
            </div>

            <Link
              href={`/dashboard/secretaria/reportes?periodo=${periodoSeleccionado}`}
              className="inline-flex items-center gap-2 self-start rounded-md border border-[#00408a] px-3 py-2 text-sm font-semibold text-[#00408a] transition hover:bg-blue-50"
            >
              <MdArrowBack aria-hidden />
              Regresar
            </Link>
          </div>

          {filasEstudiantes.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              No hay estudiantes registrados para este nivel.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead className="bg-[#00408a] text-white">
                  <tr>
                    <th className="w-16 px-4 py-3 text-center">No.</th>
                    <th className="px-4 py-3 text-left">Apellidos y Nombres</th>
                    <th className="w-44 px-4 py-3 text-left">Cédula</th>
                    <th className="w-40 px-4 py-3 text-left">Jornada</th>
                    <th className="w-28 px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filasEstudiantes.map(({ estudiante, matricula }, index) => {
                    const query = new URLSearchParams({
                      periodo: String(periodoSeleccionado),
                      nivel: nivelSeleccionado,
                    });

                    return (
                      <tr
                        key={matricula.id}
                        className="border-t border-gray-200 transition hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-center text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {nombreEstudiante(estudiante)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {estudiante.nroCedula}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {estudiante.jornada || ""}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link
                            href={`/dashboard/secretaria/reportes/${matricula.id}?${query.toString()}`}
                            title="Ver notas"
                            aria-label={`Ver notas de ${nombreEstudiante(estudiante)}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#00408a] text-white transition hover:bg-[#00336e]"
                          >
                            <MdVisibility className="h-5 w-5" aria-hidden />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
