import { fetchAPI } from "@/lib/api";
import { NIVELES_ESTUDIANTE, type Estudiante } from "@/types/Estudiante";
import { type Representante } from "@/types/Representante";
import { redirect } from "next/navigation";
import EstudiantesPage from "./EstudiantesPage";

const PAGE_SIZE = 10;
const ESTUDIANTES_PATH = "/dashboard/estudiantil/estudiantes";

interface Paginated<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalRows: number;
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function EstudiantesRoute({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; nivel?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = parsePage(params.page);
  const search = params.q?.trim() ?? "";
  const level = NIVELES_ESTUDIANTE.includes(
    params.nivel as (typeof NIVELES_ESTUDIANTE)[number],
  )
    ? (params.nivel ?? "")
    : "";
  const query = new URLSearchParams({
    page: String(requestedPage),
    limit: String(PAGE_SIZE),
  });
  if (search) query.set("search", search);
  if (level) query.set("nivel", level);

  let students: Paginated<Estudiante> = {
    data: [],
    totalPages: 0,
    currentPage: requestedPage,
    totalRows: 0,
  };
  let representantes: Representante[] = [];
  let errorMsg = "";

  try {
    const [studentResponse, representativeResponse] = await Promise.all([
      fetchAPI<Paginated<Estudiante>>(
        `/estudiantes/obtener?${query.toString()}`,
      ),
      fetchAPI<Paginated<Representante>>(
        "/representantes/obtener?page=1&limit=1000",
      ),
    ]);
    students = studentResponse;
    representantes = representativeResponse.data ?? [];
  } catch (error: unknown) {
    errorMsg =
      error instanceof Error
        ? error.message
        : "No se pudo cargar la información de estudiantes.";
  }

  if (
    !errorMsg &&
    students.totalPages > 0 &&
    requestedPage > students.totalPages
  ) {
    const redirectParams = new URLSearchParams();
    if (students.totalPages > 1) {
      redirectParams.set("page", String(students.totalPages));
    }
    if (search) redirectParams.set("q", search);
    if (level) redirectParams.set("nivel", level);
    const queryString = redirectParams.toString();
    redirect(
      queryString ? `${ESTUDIANTES_PATH}?${queryString}` : ESTUDIANTES_PATH,
    );
  }

  return (
    <EstudiantesPage
      initialEstudiantes={students.data ?? []}
      representantes={representantes}
      initialSearch={search}
      initialLevel={level}
      currentPage={students.currentPage || requestedPage}
      totalPages={students.totalPages || 0}
      errorMsg={errorMsg}
    />
  );
}
