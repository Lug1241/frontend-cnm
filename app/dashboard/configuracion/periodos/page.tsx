import { fetchAPI } from "@/lib/api";
import PeriodosPage from "./PeriodosPage";
import { PeriodoAcademico } from "@/types/PeriodoAcademico";
interface PeriodosResponsePaginated {
  data: PeriodoAcademico[];
  totalPages: number;
  currentPage: number;
  totalItems?: number;
}

export default async function PeriodosAcademicosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  let periodos: PeriodoAcademico[] = [];
  let errorMsg = "";

  const params = await searchParams;
  const query = params?.q?.toLowerCase() || "";

  try {
    // 2. Llamamos a la API esperando la respuesta paginada
    const response = await fetchAPI<PeriodosResponsePaginated>("/periodo_academico/obtener");

    // 3. Extraemos el arreglo de datos de la propiedad "data" de forma segura
    periodos = response?.data || [];

    // 4. Filtramos si hay una consulta de búsqueda
    if (query) {
      periodos = periodos.filter((p) =>
        p.descripcion?.toLowerCase().includes(query)
      );
    }
  } catch (error: unknown) {
    errorMsg =
      (error as Error).message || "No se pudo cargar la lista de periodos académicos.";
  }

  return <PeriodosPage initialPeriodos={periodos} errorMsg={errorMsg} />;
}