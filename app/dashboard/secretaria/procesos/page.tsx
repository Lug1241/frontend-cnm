import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import {
  type FechasProcesosResponse,
  type TipoProceso,
} from "@/types/FechaProceso";
import FechasProcesosPage from "./FechasProcesosPage";

const PAGE_SIZE = 10;
const FECHAS_PROCESOS_PATH = "/dashboard/secretaria/procesos";

const PROCESOS_SECRETARIA: TipoProceso[] = [
  "matricula",
  "actualizacion_datos",
];

function parsePage(value?: string) {
  const page = Number(value);

  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function parseProceso(value?: string): TipoProceso | "" {
  return PROCESOS_SECRETARIA.includes(value as TipoProceso)
    ? (value as TipoProceso)
    : "";
}

export default async function FechasProcesosRoute({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    proceso?: string;
  }>;
}) {
  const cookieStore = await cookies();

  if (cookieStore.get("rol")?.value !== "Secretaria") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const requestedPage = parsePage(params.page);
  const proceso = parseProceso(params.proceso);

  const backendSearch = proceso
    ? proceso
    : PROCESOS_SECRETARIA.join(",");

  const query = new URLSearchParams({
    page: String(requestedPage),
    limit: String(PAGE_SIZE),
    search: backendSearch,
  });

  let response: FechasProcesosResponse = {
    data: [],
    totalPages: 0,
    currentPage: requestedPage,
    totalRows: 0,
  };

  let errorMsg = "";

  try {
    response = await fetchAPI<FechasProcesosResponse>(
      `/fechas_procesos/obtener?${query.toString()}`,
    );
  } catch (error: unknown) {
    errorMsg =
      error instanceof Error
        ? error.message
        : "No se pudo cargar la lista de procesos.";
  }

  if (
    !errorMsg &&
    response.totalPages > 0 &&
    requestedPage > response.totalPages
  ) {
    const redirectParams = new URLSearchParams();

    if (response.totalPages > 1) {
      redirectParams.set("page", String(response.totalPages));
    }

    if (proceso) {
      redirectParams.set("proceso", proceso);
    }

    const queryString = redirectParams.toString();

    redirect(
      queryString
        ? `${FECHAS_PROCESOS_PATH}?${queryString}`
        : FECHAS_PROCESOS_PATH,
    );
  }

  return (
    <FechasProcesosPage
      initialProcesos={response.data ?? []}
      initialProceso={proceso}
      currentPage={response.currentPage || requestedPage}
      totalPages={response.totalPages || 0}
      errorMsg={errorMsg}
    />
  );
}