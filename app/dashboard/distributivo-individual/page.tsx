import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { decodificarToken } from "@/lib/auth";
import DistributivoIndividualPage from "./DistributivoIndividualPage";

const PAGE_SIZE = 10;

interface Periodo {
  id: number;
  descripcion: string;
}

interface IndividualResponse {
  data: any[];
  totalPages: number;
  currentPage: number;
  totalRows: number;
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function DistributivoIndividualRoute({
  searchParams,
}: {
  searchParams: Promise<{
    periodo?: string;
    nivel?: string;
    page?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;
  const requestedPage = parsePage(params.page);
  const search = params.search?.trim() ?? "";
  const nivel = params.nivel ?? "";
  const periodo = params.periodo ?? "";
  const cookieStore = await cookies();
  const role = cookieStore.get("rol")?.value ?? "";
  const token = cookieStore.get("token")?.value;
  const decodedToken = decodificarToken(token);
  const isTeacher = role === "Profesor";

  let periodos: Periodo[] = [];
  let docentesList: { id: number; primerNombre: string; primerApellido: string }[] = [];
  let materiasList: { id: number; nombre: string; nivel: string }[] = [];
  let response: IndividualResponse = {
    data: [],
    totalPages: 0,
    currentPage: requestedPage,
    totalRows: 0,
  };
  let errorMsg = "";

  try {
    const [periodosResponse, docentesResponse, materiasResponse] = await Promise.all([
      fetchAPI<{ data: Periodo[] }>("/periodo_academico/obtener"),
      fetchAPI<{ data: any[] }>("/docentes/obtener?limit=1000"),
      fetchAPI<{ data: any[] }>("/materia/obtener/tipo/individual?limit=1000"),
    ]);
    periodos = periodosResponse.data ?? [];
    docentesList = docentesResponse.data ?? [];
    materiasList = materiasResponse.data ?? [];
  } catch (error: unknown) {
    errorMsg = error instanceof Error ? error.message : "No se pudieron cargar los períodos.";
  }

  if (periodo) {
    try {
      const query = new URLSearchParams({
        page: String(requestedPage),
        limit: String(PAGE_SIZE),
      });

      if (isTeacher) {
        const cedula = decodedToken?.id || decodedToken?.nroCedula;
        if (!cedula) {
          errorMsg = "No se encontró la identidad del docente en la sesión.";
        } else {
          const teacherResponse = await fetchAPI<IndividualResponse>(
            `/inscripcion/obtener/docente/${encodeURIComponent(cedula)}/${periodo}?${query.toString()}`,
          );
          response = teacherResponse;
        }
      } else {
        if (nivel) query.set("nivel", nivel);
        if (search) query.set("search", search);
        response = await fetchAPI<IndividualResponse>(
          `/asignaciones/obtener/individuales/${periodo}?${query.toString()}`,
        );
      }
    } catch (error: unknown) {
      errorMsg = error instanceof Error ? error.message : "No se pudo cargar el distributivo individual.";
    }
  }

  if (response.totalPages > 0 && requestedPage > response.totalPages) {
    const redirectParams = new URLSearchParams({ periodo });
    if (nivel) redirectParams.set("nivel", nivel);
    if (search) redirectParams.set("search", search);
    redirectParams.set("page", String(response.totalPages));
    redirect(`/dashboard/distributivo-individual?${redirectParams.toString()}`);
  }

  return (
    <DistributivoIndividualPage
      periodos={periodos}
      asignaciones={response.data ?? []}
      docentesList={docentesList}
      materiasList={materiasList}
      currentPeriodo={periodo}
      currentNivel={nivel}
      initialSearch={search}
      currentPage={response.currentPage || requestedPage}
      totalPages={response.totalPages || 0}
      isTeacher={isTeacher}
      errorMsg={errorMsg}
    />
  );
}
