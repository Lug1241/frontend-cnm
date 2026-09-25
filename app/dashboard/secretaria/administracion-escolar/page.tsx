import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MdArrowBack, MdMenuBook } from "react-icons/md";

import { fetchAPI } from "@/lib/api";
import type { Asignacion } from "@/types/Asignacion";
import type { PeriodoAcademico } from "@/types/PeriodoAcademico";

import AdministracionEscolarClient from "./AdministracionEscolarClient";

interface PeriodosResponse {
  data: PeriodoAcademico[];
}

interface AsignacionesResponse {
  data: Asignacion[];
  totalRows: number;
}

function parseId(value?: string) {
  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

export default async function AdministracionEscolarPage({
  searchParams,
}: {
  searchParams: Promise<{
    periodo?: string;
  }>;
}) {
  const cookieStore = await cookies();

  if (cookieStore.get("rol")?.value !== "Secretaria") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const periodoId = parseId(params.periodo);

  let periodos: PeriodoAcademico[] = [];
  let asignaciones: Asignacion[] = [];
  let errorMsg = "";

  try {
    const response =
      await fetchAPI<PeriodosResponse>(
        "/periodo_academico/obtener?limit=100",
      );

    periodos = response.data ?? [];
  } catch (error) {
    errorMsg =
      error instanceof Error
        ? error.message
        : "No se pudieron cargar los períodos académicos.";
  }

  const periodoSeleccionado = periodoId
    ? periodos.find(
        (periodo) => periodo.id === periodoId,
      )
    : null;

  if (!errorMsg && periodoId && periodoSeleccionado) {
    try {
      const response =
        await fetchAPI<AsignacionesResponse>(
          `/asignaciones/administracion-escolar/periodo/${periodoId}`,
        );

      asignaciones = response.data ?? [];
    } catch (error) {
      errorMsg =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las materias del período.";
    }
  }

  if (periodoId && !periodoSeleccionado && !errorMsg) {
    errorMsg =
      "El período académico seleccionado no existe.";
  }

  return (
    <div className="w-full p-4 sm:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {!periodoSeleccionado ? (
          <>
            <h1 className="text-2xl font-bold text-[#1265f3] sm:text-3xl">
              Gestión Escolar - Periodos Académicos
            </h1>

            <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
              {[...periodos]
                .sort((a, b) =>
                  a.descripcion.localeCompare(
                    b.descripcion,
                    "es",
                  ),
                )
                .map((periodo) => (
                  <Link
                    key={periodo.id}
                    href={`/dashboard/secretaria/administracion-escolar?periodo=${periodo.id}`}
                    className="mx-auto flex min-h-[230px] w-full max-w-[330px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-[#00408a] hover:shadow-md"
                  >
                    <MdMenuBook className="mb-5 h-12 w-12 text-gray-800" />

                    <h2 className="text-base font-bold text-gray-900">
                      Periodo: {periodo.descripcion}
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                      Estado: {periodo.estado}
                    </p>
                  </Link>
                ))}
            </div>
          </>
        ) : (
          <>
            <Link
              href="/dashboard/secretaria/administracion-escolar"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#00408a] hover:underline"
            >
              <MdArrowBack />
              Regresar a períodos
            </Link>

            <AdministracionEscolarClient
              asignaciones={asignaciones}
              periodoId={periodoSeleccionado.id}
              periodoDescripcion={
                periodoSeleccionado.descripcion
              }
            />
          </>
        )}
      </div>
    </div>
  );
}