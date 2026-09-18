import { fetchAPI } from "@/lib/api";

import {
  ORDEN_FECHAS_NOTAS,
  type FechaProceso,
} from "@/types/FechaProceso";

import FechasNotasPage from "./FechasNotasPage";

const PAGE_SIZE = 10;

interface FechasProcesosResponse {
  data: FechaProceso[];
  totalPages: number;
  currentPage: number;
  totalRows: number;
}

function parsePage(value?: string) {
  const page = Number(value);

  return Number.isSafeInteger(page) && page > 0
    ? page
    : 1;
}

function ordenarFechasNotas(
  fechas: FechaProceso[],
): FechaProceso[] {
  return [...fechas].sort((a, b) => {
    const indexA = a.descripcion
      ? ORDEN_FECHAS_NOTAS.indexOf(a.descripcion)
      : -1;

    const indexB = b.descripcion
      ? ORDEN_FECHAS_NOTAS.indexOf(b.descripcion)
      : -1;

    return indexA - indexB;
  });
}

export default async function FechasNotasRoute({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = parsePage(params.page);

  const queryParams = new URLSearchParams({
    page: String(requestedPage),
    limit: String(PAGE_SIZE),
    search: "fechas_notas",
  });

  let response: FechasProcesosResponse = {
    data: [],
    totalPages: 0,
    currentPage: requestedPage,
    totalRows: 0,
  };

  let errorMsg = "";

  try {
    response =
      await fetchAPI<FechasProcesosResponse>(
        `/fechas_procesos/obtener?${queryParams.toString()}`,
      );
  } catch (error: unknown) {
    errorMsg =
      error instanceof Error
        ? error.message
        : "No se pudieron cargar las fechas para notas.";
  }

  const fechasOrdenadas = ordenarFechasNotas(
    response.data ?? [],
  );

  return (
    <FechasNotasPage
      initialFechas={fechasOrdenadas}
      currentPage={
        response.currentPage || requestedPage
      }
      totalPages={response.totalPages || 0}
      errorMsg={errorMsg}
    />
  );
}