import { fetchAPI } from "@/lib/api";
import { redirect } from "next/navigation";
import CursosVaciosPage from "./CursosVaciosPage";
import { type Asignacion } from "@/types/Asignacion"; 

const PAGE_SIZE = 10;

interface CursosVaciosResponse {
  data: Asignacion[];
  totalPages: number;
  currentPage: number;
  totalRows: number;
}

export default async function CursosVaciosRoute({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  let response: CursosVaciosResponse = {
    data: [],
    totalPages: 0,
    currentPage: page,
    totalRows: 0,
  };
  let errorMsg = "";

  try {
    response = await fetchAPI<CursosVaciosResponse>(
      `/asignaciones/sinMatricula?${queryParams.toString()}`
    );
  } catch (error: any) {
    errorMsg = error.message || "Error al cargar la lista de cursos vacíos.";
  }

  if (!errorMsg && response.totalPages > 0 && page > response.totalPages) {
    const redirectParams = new URLSearchParams();
    if (response.totalPages > 1) {
      redirectParams.set("page", String(response.totalPages));
    }
    redirect(`/dashboard/cursos-vacios?${redirectParams.toString()}`);
  }

  return (
    <CursosVaciosPage
      initialData={response.data ?? []}
      currentPage={response.currentPage || page}
      totalPages={response.totalPages || 0}
      errorMsg={errorMsg}
    />
  );
}