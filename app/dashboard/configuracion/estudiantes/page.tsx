import { fetchAPI } from "@/lib/api";
import { Estudiante } from "@/types/Estudiante";
import { redirect } from "next/navigation";
import EstudiantesPage from "./EstudiantesPage";

interface EstudiantesResponsePaginated {
  data: Estudiante[];
  totalPages: number;
  currentPage: number;
  totalRows: number;
}

const PAGE_SIZE = 10;

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function EstudiantesRoute({
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

  let response: EstudiantesResponsePaginated = {
    data: [],
    totalPages: 0,
    currentPage: requestedPage,
    totalRows: 0,
  };
  let errorMsg = "";

  try {
    response = await fetchAPI<EstudiantesResponsePaginated>(
      `/estudiantes/obtener?${queryParams.toString()}`,
    );
  } catch (error: unknown) {
    errorMsg =
      error instanceof Error
        ? error.message
        : "No se pudo cargar la lista de estudiantes.";
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
    if (search) {
      redirectParams.set("q", search);
    }
    const queryString = redirectParams.toString();

    redirect(
        queryString
          ? `/dashboard/configuracion/estudiantes?${queryString}`
          : `/dashboard/configuracion/estudiantes`
    );
  }

  return (
    <EstudiantesPage
      initialEstudiantes={response.data ?? []}
      initialSearch={search}
      currentPage={response.currentPage || requestedPage}
      totalPages={response.totalPages || 0}
      errorMsg={errorMsg}
    />
  );
}