import { fetchAPI } from "@/lib/api";
import { type Representante } from "@/types/Representante";
import RegistroEstudiantePage from "./RegistroEstudiantePage";

interface RepresentantesResponse {
  data: Representante[];
}

export default async function NuevoEstudianteRoute() {
  let representantes: Representante[] = [];
  let errorMsg = "";

  try {
    const response = await fetchAPI<RepresentantesResponse>(
      "/representantes/obtener?page=1&limit=1000",
    );
    representantes = response.data ?? [];
  } catch (error: unknown) {
    errorMsg =
      error instanceof Error
        ? error.message
        : "No se pudieron cargar los representantes.";
  }

  return (
    <RegistroEstudiantePage
      representantes={representantes}
      initialError={errorMsg}
    />
  );
}
