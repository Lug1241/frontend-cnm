import { fetchAPI } from "@/lib/api";
import DistributivoClient from "./DistributivoPage";
import { redirect } from "next/navigation";

const PAGE_SIZE = 10;

export interface Asignacion {
  id?: number;
  paralelo: string;
  horaInicio: string;
  horaFin: string;
  cupos: number;
  dias: string[];
  materia?: {
    nombre: string;
    nivel: string;
  };
  docente?: {
    primerNombre: string;
    primerApellido: string;
  };
}

export interface Periodo {
  id: number;
  descripcion: string;
}

interface DistributivoResponsePaginated {
  data: Asignacion[];
  totalPages: number;
  currentPage: number;
  totalRows: number;
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function DistributivoPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; grupo?: string; page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const periodo = params.periodo || "";
  const grupo = params.grupo || "";
  const search = params.search?.trim() ?? "";
  const requestedPage = parsePage(params.page);

  // 1. Obtener catálogos (Periodos, Docentes, Materias)
  let periodos: Periodo[] = [];
  let docentesList: { id: number; primerNombre: string; primerApellido: string }[] = [];
  let materiasList: { id: number; nombre: string; nivel: string }[] = [];

  try {
    const [resPeriodos, resDocentes, resMaterias] = await Promise.all([
      fetchAPI<{ data: Periodo[] }>("/periodo_academico/obtener").catch(() => ({ data: [] })),
      fetchAPI<{ data: any[] }>("/docentes/obtener?limit=1000").catch(() => ({ data: [] })),
      fetchAPI<{ data: any[] }>("/materia/obtener/tipo/grupal?limit=1000").catch(() => ({ data: [] })),
    ]);

    periodos = resPeriodos.data || [];
    docentesList = resDocentes.data || [];
    materiasList = resMaterias.data || [];
  } catch (error) {
    console.error("Error cargando catálogos:", error);
  }

  // 2. Preparar parámetros de URL para delegar todo al backend
  const queryParams = new URLSearchParams({
    page: String(requestedPage),
    limit: String(PAGE_SIZE),
  });
  if (search) queryParams.set("search", search);
  if (grupo) queryParams.set("grupo", grupo); // El nuevo endpoint de NestJS leerá esto

  let response: DistributivoResponsePaginated = {
    data: [],
    totalPages: 0,
    currentPage: requestedPage,
    totalRows: 0,
  };

  if (periodo) {
    try {
      // Llamada unificada: Asumimos que prepararemos este endpoint en el backend
      response = await fetchAPI<DistributivoResponsePaginated>(
        `/asignaciones/obtener/periodo/${periodo}?${queryParams.toString()}`
      );
    } catch (error) {
      console.error("Error obteniendo distributivo:", error);
    }
  }

  // Redirección si la página solicitada excede el límite (Igual que en Docentes)
  if (response.totalPages > 0 && requestedPage > response.totalPages) {
    const redirectParams = new URLSearchParams();
    if (response.totalPages > 1) redirectParams.set("page", String(response.totalPages));
    if (periodo) redirectParams.set("periodo", periodo);
    if (grupo) redirectParams.set("grupo", grupo);
    if (search) redirectParams.set("search", search);

    redirect(`/dashboard/distributivo?${redirectParams.toString()}`);
  }

  return (
    <DistributivoClient 
      periodos={periodos} 
      asignaciones={response.data ?? []} 
      docentesList={docentesList}
      materiasList={materiasList}
      currentPeriodo={periodo}
      currentGrupo={grupo}
      initialSearch={search}
      currentPage={response.currentPage || requestedPage}
      totalPages={response.totalPages || 0}
    />
  );
}