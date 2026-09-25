import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  notFound,
  redirect,
} from "next/navigation";
import { MdArrowBack } from "react-icons/md";

import { fetchAPI } from "@/lib/api";
import type { Asignacion } from "@/types/Asignacion";
import type {
  EstudianteListaAdministracion,
} from "@/types/AdministracionEscolar";
import type {
  PeriodoAcademico,
} from "@/types/PeriodoAcademico";

import BotonImprimir from "../BotonImprimir";
import {
  obtenerDatosCurso,
  parseIdsAsignaciones,
} from "../_lib/detalleCurso";

interface AsignacionesResponse {
  data: Asignacion[];
  totalRows: number;
}

export default async function ListaCursoPage({
  searchParams,
}: {
  searchParams: Promise<{
    periodo?: string;
    ids?: string;
  }>;
}) {
  const cookieStore = await cookies();

  if (
    cookieStore.get("rol")?.value !==
    "Secretaria"
  ) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  const periodoId = Number(params.periodo);
  const ids =
    parseIdsAsignaciones(params.ids);

  if (
    !Number.isSafeInteger(periodoId) ||
    periodoId < 1 ||
    ids.length === 0
  ) {
    notFound();
  }

  const idsQuery = ids.join(",");

  let periodo: PeriodoAcademico | null =
    null;

  let asignaciones: Asignacion[] = [];
  let estudiantes: EstudianteListaAdministracion[] =
    [];
  let errorMsg = "";

  try {
    const [
      periodoResponse,
      asignacionesResponse,
      estudiantesResponse,
    ] = await Promise.all([
      fetchAPI<PeriodoAcademico>(
        `/periodo_academico/obtener/${periodoId}`,
      ),

      fetchAPI<AsignacionesResponse>(
        `/asignaciones/administracion-escolar/periodo/${periodoId}`,
      ),

      fetchAPI<
        EstudianteListaAdministracion[]
      >(
        `/inscripcion/asignaciones?ids=${idsQuery}`,
      ),
    ]);

    periodo = periodoResponse;

    asignaciones =
      asignacionesResponse.data.filter(
        (asignacion) =>
          typeof asignacion.id === "number" &&
          ids.includes(asignacion.id),
      );

    estudiantes = estudiantesResponse;
  } catch (error) {
    errorMsg =
      error instanceof Error
        ? error.message
        : "No se pudo cargar el listado de estudiantes.";
  }

  const datosCurso =
    obtenerDatosCurso(asignaciones);

  const backHref =
    `/dashboard/secretaria/administracion-escolar?periodo=${periodoId}`;

  return (
    <div className="w-full space-y-5 p-4 sm:p-8">
      <div className="print:hidden mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-md border border-[#00408a] px-3 py-2 text-sm font-semibold text-[#00408a] transition hover:bg-blue-50"
        >
          <MdArrowBack />
          Regresar
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            Exportaciones:
          </span>

          <BotonImprimir />
        </div>
      </div>

      {errorMsg ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      ) : (
        <section className="administracion-print mx-auto w-full max-w-6xl space-y-4 bg-white">
          <header className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm print:rounded-none print:shadow-none">
            <div className="grid grid-cols-[90px_1fr] items-center gap-4">
              <Image
                src="/ConservatorioNacional.png"
                alt="Conservatorio Nacional de Música"
                width={80}
                height={80}
                className="h-auto max-h-20 w-auto object-contain"
                priority
              />

              <div className="text-center">
                <h1 className="text-xl font-bold text-[#00408a] sm:text-2xl">
                  CONSERVATORIO NACIONAL DE MÚSICA
                </h1>

                <p className="mt-1 font-semibold text-gray-700">
                  LISTADO DE ESTUDIANTES
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-x-8 gap-y-2 border-t border-gray-200 pt-4 text-sm text-gray-700 sm:grid-cols-2">
              <p>
                <strong>Profesor:</strong>{" "}
                {datosCurso.docente}
              </p>

              <p>
                <strong>Asignatura:</strong>{" "}
                {datosCurso.materia}
              </p>

              <p>
                <strong>Año Lectivo:</strong>{" "}
                {periodo?.descripcion ?? ""}
              </p>

              <p>
                <strong>Paralelo:</strong>{" "}
                {datosCurso.paralelo}
              </p>

              <p>
                <strong>Jornada:</strong>{" "}
                {datosCurso.jornada}
              </p>
            </div>
          </header>

          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#c7dcf8] text-black">
                <tr>
                  <th className="w-20 border border-gray-300 px-4 py-3 text-center">
                    Nro
                  </th>

                  <th className="border border-gray-300 px-4 py-3 text-left">
                    Nómina de Estudiantes
                  </th>
                </tr>
              </thead>

              <tbody>
                {estudiantes.map(
                  (estudiante) => (
                    <tr
                      key={
                        estudiante.idEstudiante
                      }
                      className="even:bg-gray-50"
                    >
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {estudiante.nro}
                      </td>

                      <td className="border border-gray-300 px-4 py-3">
                        {
                          estudiante.nombreCompleto
                        }
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {estudiantes.length === 0 && (
            <p className="py-5 text-center text-sm text-gray-500">
              No existen estudiantes inscritos en este curso.
            </p>
          )}
        </section>
      )}
    </div>
  );
}