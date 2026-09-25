import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  MdArrowBack,
  MdEdit,
  MdSave,
} from "react-icons/md";

import { fetchAPI } from "@/lib/api";
import type { Asignacion } from "@/types/Asignacion";
import type {
  ReporteAsignacionesAdministracion,
} from "@/types/AdministracionEscolar";
import type {
  FechaProceso,
  FechasProcesosResponse,
} from "@/types/FechaProceso";
import type { PeriodoAcademico } from "@/types/PeriodoAcademico";

import BotonImprimir from "../BotonImprimir";
import {
  obtenerDatosCurso,
  parseIdsAsignaciones,
} from "../_lib/detalleCurso";

import CalificacionesTabs from "./CalificacionesTabs";

interface AsignacionesResponse {
  data: Asignacion[];
  totalRows: number;
}

export default async function CalificacionesCursoPage({
  searchParams,
}: {
  searchParams: Promise<{
    periodo?: string;
    ids?: string;
    nivel?: string;
    curso?: string;
  }>;
}) {
  const cookieStore = await cookies();

  if (cookieStore.get("rol")?.value !== "Secretaria") {
    redirect("/dashboard");
  }

  const params = await searchParams;

  const periodoId = Number(params.periodo);
  const ids = parseIdsAsignaciones(params.ids);

  if (
    !Number.isSafeInteger(periodoId) ||
    periodoId < 1 ||
    ids.length === 0
  ) {
    notFound();
  }

  const idsQuery = ids.join(",");

  let periodo: PeriodoAcademico | null = null;
  let asignaciones: Asignacion[] = [];

  let reporte: ReporteAsignacionesAdministracion = {
    asignacionIds: ids,
    estudiantes: [],
  };

  let fechas: FechaProceso[] = [];
  let errorMsg = "";

  try {
    const [
      periodoResponse,
      asignacionesResponse,
      reporteResponse,
    ] = await Promise.all([
      fetchAPI<PeriodoAcademico>(
        `/periodo_academico/obtener/${periodoId}`,
      ),

      fetchAPI<AsignacionesResponse>(
        `/asignaciones/administracion-escolar/periodo/${periodoId}`,
      ),

      fetchAPI<ReporteAsignacionesAdministracion>(
        `/calificaciones/reporte/asignaciones?ids=${idsQuery}`,
      ),
    ]);

    periodo = periodoResponse;

    asignaciones = asignacionesResponse.data.filter(
      (asignacion) =>
        typeof asignacion.id === "number" &&
        ids.includes(asignacion.id),
    );

    reporte = reporteResponse;
  } catch (error) {
    errorMsg =
      error instanceof Error
        ? error.message
        : "No se pudieron cargar las calificaciones.";
  }

  try {
    const fechasResponse =
      await fetchAPI<FechasProcesosResponse>(
        "/fechas_procesos/obtener?limit=100&search=fechas_notas",
      );

    fechas = fechasResponse.data ?? [];
  } catch {
    fechas = [];
  }

  const datosCurso = obtenerDatosCurso(asignaciones);

  const backQuery = new URLSearchParams({
    periodo: String(periodoId),
  });

  if (params.nivel) {
    backQuery.set("nivel", params.nivel);
  }

  if (params.curso) {
    backQuery.set("curso", params.curso);
  }

  const backHref = `/dashboard/secretaria/administracion-escolar?${backQuery.toString()}`;

  return (
    <div className="w-full p-4 sm:p-6">
      <div className="mx-auto w-full max-w-[1500px] space-y-5">
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-md border border-[#00408a] px-3 py-2 text-sm font-semibold text-[#00408a] transition hover:bg-blue-50"
          >
            <MdArrowBack />
            Regresar
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              title="Edición no disponible para Secretaría"
              className="inline-flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-md bg-amber-400 text-gray-700 opacity-60"
            >
              <MdEdit className="h-5 w-5" />
            </button>

            <button
              type="button"
              disabled
              title="Guardado no disponible para Secretaría"
              className="inline-flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-md bg-emerald-600 text-white opacity-60"
            >
              <MdSave className="h-5 w-5" />
            </button>

            <BotonImprimir />
          </div>
        </div>

        {errorMsg ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMsg}
          </div>
        ) : (
          <section className="administracion-print">
            <CalificacionesTabs
              estudiantes={reporte.estudiantes}
              fechas={fechas}
              materia={datosCurso.materia}
              docente={datosCurso.docente}
              nivel={datosCurso.nivel}
              paralelo={
                datosCurso.paralelo === "Varios"
                  ? "Múltiples"
                  : datosCurso.paralelo
              }
              jornada={datosCurso.jornada}
              periodo={periodo?.descripcion ?? ""}
            />
          </section>
        )}
      </div>
    </div>
  );
}
