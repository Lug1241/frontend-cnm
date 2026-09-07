import { fetchAPI } from "@/lib/api";
import { Materia } from "@/types/Materia";
import { redirect } from "next/navigation";
import MateriasPage from "./MateriasPage";

const PAGE_SIZE = 10;

interface MateriasResponsePaginated {
  data: Materia[];
  totalPages: number;
  currentPage: number;
  totalRows: number;
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function MateriasRoute({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = parsePage(params.page);
  const search = params.q?.trim() ?? "";
  const queryParams = new URLSearchParams({
    page: String(requestedPage),
    limit: String(PAGE_SIZE),
  });

  if (search) queryParams.set("search", search);

  let response: MateriasResponsePaginated = {
    data: [],
    totalPages: 0,
    currentPage: requestedPage,
    totalRows: 0,
  };
  let errorMsg = "";

  try {
    response = await fetchAPI<MateriasResponsePaginated>(
      `/materia/obtener?${queryParams.toString()}`,
    );
  } catch (error: unknown) {
    errorMsg =
      error instanceof Error
        ? error.message
        : "No se pudo cargar la lista de materias.";
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
        ? `/dashboard/configuracion/materias?${queryString}`
        : "/dashboard/configuracion/materias",
    );
  }

  return (
    <MateriasPage
      initialMaterias={response.data ?? []}
      initialSearch={search}
      currentPage={response.currentPage || requestedPage}
      totalPages={response.totalPages || 0}
      errorMsg={errorMsg}
    />
  );
}
