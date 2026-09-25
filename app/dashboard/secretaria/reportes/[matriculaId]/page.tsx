import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

import { fetchAPI } from "@/lib/api";
import type { PeriodoAcademico } from "@/types/PeriodoAcademico";
import type { ReporteCalificaciones } from "@/types/ReporteCalificaciones";
import ReporteNotasTabs from "./ReporteNotasTabs";

function obtenerAnioLectivo(descripcion?: string) {
  return descripcion?.replace(/^Periodo\s*/i, "").trim() || "";
}

export default async function ReporteEstudiantePage({
  params,
  searchParams,
}: {
  params: Promise<{ matriculaId: string }>;
  searchParams: Promise<{ periodo?: string; nivel?: string }>;
}) {
  const cookieStore = await cookies();

  if (cookieStore.get("rol")?.value !== "Secretaria") {
    redirect("/dashboard");
  }

  const { matriculaId } = await params;
  const idMatricula = Number(matriculaId);

  if (!Number.isSafeInteger(idMatricula) || idMatricula < 1) {
    notFound();
  }

  const queryParams = await searchParams;
  const backQuery = new URLSearchParams();

  if (queryParams.periodo) backQuery.set("periodo", queryParams.periodo);
  if (queryParams.nivel) backQuery.set("nivel", queryParams.nivel);

  const backHref = backQuery.toString()
    ? `/dashboard/secretaria/reportes?${backQuery.toString()}`
    : "/dashboard/secretaria/reportes";

  let reporte: ReporteCalificaciones | null = null;
  let periodo: PeriodoAcademico | null = null;
  let errorMsg = "";

  try {
    reporte = await fetchAPI<ReporteCalificaciones>(
      `/calificaciones/reporte/matricula/${idMatricula}`,
    );

    if (reporte.matricula.periodoAcademicoId) {
      periodo = await fetchAPI<PeriodoAcademico>(
        `/periodo_academico/obtener/${reporte.matricula.periodoAcademicoId}`,
      ).catch(() => null);
    }
  } catch (error) {
    errorMsg =
      error instanceof Error
        ? error.message
        : "No se pudo cargar el reporte del estudiante.";
  }

  if (!reporte) {
    return (
      <div className="w-full space-y-5 p-4 sm:p-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#00408a] hover:underline"
        >
          <MdArrowBack aria-hidden />
          Volver a reportes
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg || "No se encontró el reporte solicitado."}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 p-4 sm:p-8">
      <div className="print:hidden flex items-center">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#00408a] hover:underline"
        >
          <MdArrowBack aria-hidden />
          Regresar
        </Link>
      </div>

      <section className="reporte-certificado-print space-y-4 bg-white">
        <header className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm print:rounded-none print:border-gray-400 print:shadow-none">
          <div className="grid grid-cols-[92px_1fr_210px] items-center gap-4">
            <div className="flex justify-start">
              <Image
                src="/ConservatorioNacional.png"
                alt="Conservatorio Nacional de Música"
                width={82}
                height={82}
                className="h-auto max-h-20 w-auto object-contain"
                priority
              />
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold tracking-wide text-[#00408a] sm:text-2xl">
                CONSERVATORIO NACIONAL DE MÚSICA
              </h1>
              <p className="mt-1 text-base font-semibold text-gray-700">
                CERTIFICADO DE PROMOCIÓN
              </p>
            </div>

            <div className="flex justify-end">
              <Image
                src="/Ministerio.png"
                alt="Ministerio de Educación"
                width={200}
                height={40}
                className="h-auto max-h-16 w-auto max-w-[200px] object-contain"
                priority
              />
            </div>
          </div>

          <div className="mt-5 grid gap-x-8 gap-y-2 border-t border-gray-200 pt-4 text-sm text-gray-700 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-gray-900">Estudiante:</span>{" "}
              {reporte.estudiante?.nombreCompleto || ""}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Cédula:</span>{" "}
              {reporte.estudiante?.nroCedula || ""}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Nivel:</span>{" "}
              {reporte.matricula.nivel || ""}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Año Lectivo:</span>{" "}
              {obtenerAnioLectivo(periodo?.descripcion)}
            </p>
          </div>
        </header>

        <ReporteNotasTabs cursos={reporte.cursos} />
      </section>
    </div>
  );
}
