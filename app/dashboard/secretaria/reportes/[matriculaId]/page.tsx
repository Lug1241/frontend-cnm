import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { fetchAPI } from "@/lib/api";
import type { ReporteCalificaciones } from "@/types/ReporteCalificaciones";
import ReporteNotasTabs from "./ReporteNotasTabs";

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

  if (queryParams.periodo) {
    backQuery.set("periodo", queryParams.periodo);
  }
  if (queryParams.nivel) {
    backQuery.set("nivel", queryParams.nivel);
  }

  const backHref = backQuery.toString()
    ? `/dashboard/secretaria/reportes?${backQuery.toString()}`
    : "/dashboard/secretaria/reportes";

  let reporte: ReporteCalificaciones | null = null;
  let errorMsg = "";

  try {
    reporte = await fetchAPI<ReporteCalificaciones>(
      `/calificaciones/reporte/matricula/${idMatricula}`,
    );
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
          className="text-sm font-semibold text-[#00408a] hover:underline"
        >
          ← Volver a reportes
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg || "No se encontró el reporte solicitado."}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-8">
      <div className="print:hidden">
        <Link
          href={backHref}
          className="text-sm font-semibold text-[#00408a] hover:underline"
        >
          ← Volver a reportes
        </Link>
      </div>

      <header className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-[#00408a] sm:text-3xl">
          Reporte de Calificaciones
        </h1>
        <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
          <p>
            <span className="font-semibold text-gray-800">Estudiante:</span>{" "}
            {reporte.estudiante?.nombreCompleto || "—"}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Cédula:</span>{" "}
            {reporte.estudiante?.nroCedula || "—"}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Nivel:</span>{" "}
            {reporte.matricula.nivel || "—"}
          </p>
        </div>
      </header>

      <ReporteNotasTabs cursos={reporte.cursos} />
    </div>
  );
}
