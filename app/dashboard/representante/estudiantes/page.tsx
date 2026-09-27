import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MdArrowBack, MdInfoOutline } from "react-icons/md";

import { fetchAPI } from "@/lib/api";
import type { EstudianteRepresentante } from "@/types/RepresentanteEstudiantil";
import InformacionEstudiante from "./InformacionEstudiante";

function parseId(value?: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

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

export default async function EstudiantesRepresentantePage({
  searchParams,
}: {
  searchParams: Promise<{ estudiante?: string; vista?: string }>;
}) {
  const cookieStore = await cookies();

  if (cookieStore.get("type")?.value !== "representante") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  let estudiantes: EstudianteRepresentante[] = [];
  let errorMsg = "";

  try {
    estudiantes = await fetchAPI<EstudianteRepresentante[]>(
      "/estudiantes/representante/me/propios",
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudieron cargar los estudiantes.";

    if (message === "UNAUTHORIZED") {
      redirect("/");
    }

    errorMsg = message;
  }

  const estudianteSolicitado = parseId(params.estudiante);
  const estudianteSeleccionado = estudianteSolicitado
    ? estudiantes.find((estudiante) => estudiante.id === estudianteSolicitado)
    : null;
  const mostrarInformacion =
    estudianteSeleccionado && params.vista === "informacion";

  return (
    <div className="w-full space-y-6 p-4 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Información estudiantil
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#00408a] sm:text-3xl">
            {estudianteSeleccionado
              ? nombreEstudiante(estudianteSeleccionado)
              : "Mis estudiantes"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Consulta la información académica de los estudiantes asociados a tu
            cuenta.
          </p>
        </div>

        {estudianteSeleccionado && (
          <Link
            href="/dashboard/representante/estudiantes"
            className="inline-flex items-center gap-2 self-start rounded-md border border-[#00408a] px-4 py-2 text-sm font-semibold text-[#00408a] transition hover:bg-blue-50"
          >
            <MdArrowBack aria-hidden />
            Volver a la lista
          </Link>
        )}
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {errorMsg}
        </div>
      )}

      {estudianteSolicitado && !estudianteSeleccionado && !errorMsg && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          El estudiante solicitado no está asociado a tu cuenta.
        </div>
      )}

      {mostrarInformacion && (
        <InformacionEstudiante estudiante={estudianteSeleccionado} />
      )}

      {!estudianteSeleccionado && !errorMsg && estudiantes.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-gray-800">
            No tienes estudiantes asociados.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Cuando exista una asociación activa, el estudiante aparecerá aquí.
          </p>
        </div>
      )}

      {!estudianteSeleccionado && estudiantes.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-[#00408a] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Estudiante</th>
                <th className="px-4 py-3 text-left">Nivel actual</th>
                <th className="px-4 py-3 text-left">Especialidad</th>
                <th className="w-36 px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((estudiante) => {
                const nombre = nombreEstudiante(estudiante);
                const query = new URLSearchParams({
                  estudiante: String(estudiante.id),
                  vista: "informacion",
                });

                return (
                  <tr
                    key={estudiante.id}
                    className="border-t border-gray-200 transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {nombre}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {estudiante.nivel}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {estudiante.especialidad}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/dashboard/representante/estudiantes?${query.toString()}`}
                        title="Ver información"
                        aria-label={`Ver información de ${nombre}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#00408a] text-[#00408a] transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[#00408a] focus:ring-offset-2"
                      >
                        <MdInfoOutline className="h-6 w-6" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
