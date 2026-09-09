import { fetchAPI } from "@/lib/api";
import { type Representante } from "@/types/Representante";
import { redirect } from "next/navigation";
import RepresentantesPage from "./RepresentantesPage";

const PAGE_SIZE = 10;
const REPRESENTANTES_PATH = "/dashboard/configuracion/representantes";

interface RepresentantesResponse {
  data: Representante[];
  totalPages: number;
  currentPage: number;
  totalRows: number;
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function RepresentantesRoute({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = parsePage(params.page);
  const search = params.q?.trim() ?? "";
  const query = new URLSearchParams({
    page: String(requestedPage),
    limit: String(PAGE_SIZE),
  });
  if (search) query.set("search", search);

  let response: RepresentantesResponse = {
    data: [],
    totalPages: 0,
    currentPage: requestedPage,
    totalRows: 0,
  };
  let errorMsg = "";

  try {
    response = await fetchAPI<RepresentantesResponse>(
      `/representantes/obtener?${query.toString()}`,
    );
  } catch (error: unknown) {
    errorMsg =
      error instanceof Error
        ? error.message
        : "No se pudo cargar la lista de representantes.";
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
    if (search) redirectParams.set("q", search);
    const queryString = redirectParams.toString();
    redirect(
      queryString
        ? `${REPRESENTANTES_PATH}?${queryString}`
        : REPRESENTANTES_PATH,
    );
  }

  return (
    <RepresentantesPage
      initialRepresentantes={response.data ?? []}
      initialSearch={search}
      currentPage={response.currentPage || requestedPage}
      totalPages={response.totalPages || 0}
      errorMsg={errorMsg}
    />
  );
}
