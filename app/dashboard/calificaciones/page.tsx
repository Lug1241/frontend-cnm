import { cookies } from "next/headers";
import { fetchAPI } from "@/lib/api";
import { Asignacion } from "@/types/Asignacion";
import { PeriodoAcademico } from "@/types/PeriodoAcademico";

interface AsignacionesResponse {
  data: Asignacion[];
  totalRows: number;
}

interface CursoDocente {
  id: string;
  nombreMateria: string;
  tipoNivel: "BE" | "Superior";
  tipo: "Grupal" | "Individual";
  asignaciones: Asignacion[];
}

const NIVELES_AGRUPACION = [
  "BCH",
  "BM",
  "BS",
  "BS BCH",
  "BE",
  "BM BS",
  "BM BS BCH",
];

function esNivelBE(nivel?: string) {
  return Boolean(nivel?.toUpperCase().includes("BE"));
}

function normalizarTexto(texto: string) {
  return texto.trim().replace(/\s+/g, " ").toLowerCase();
}

function agruparCursos(asignaciones: Asignacion[]): CursoDocente[] {
  const paraAgrupar = asignaciones.filter((asignacion) => {
    const tipo = asignacion.materia?.tipo ?? "Grupal";
    const nivel = asignacion.materia?.nivel ?? "";

    return (
      tipo.toLowerCase() === "individual" ||
      NIVELES_AGRUPACION.includes(nivel)
    );
  });

  const sueltos = asignaciones
    .filter((asignacion) => {
      const tipo = asignacion.materia?.tipo ?? "Grupal";
      const nivel = asignacion.materia?.nivel ?? "";

      return (
        tipo.toLowerCase() === "grupal" &&
        !NIVELES_AGRUPACION.includes(nivel)
      );
    })
    .map((asignacion, index): CursoDocente => {
      const materia = asignacion.materia?.nombre ?? "Sin materia";
      const nivel = asignacion.materia?.nivel ?? "";

      return {
        id: String(
          asignacion.id ??
            `curso-${normalizarTexto(materia)}-${index}`,
        ),
        nombreMateria: materia,
        tipoNivel: esNivelBE(nivel) ? "BE" : "Superior",
        tipo: "Grupal",
        asignaciones: [asignacion],
      };
    });

  const grupos = new Map<string, CursoDocente>();

  paraAgrupar.forEach((asignacion) => {
    const materia = asignacion.materia?.nombre ?? "Sin materia";
    const nivel = asignacion.materia?.nivel ?? "";
    const tipoNivel = esNivelBE(nivel) ? "BE" : "Superior";
    const tipo =
      asignacion.materia?.tipo?.toLowerCase() === "individual"
        ? "Individual"
        : "Grupal";

    const key = `${normalizarTexto(materia)}_${tipoNivel}`;

    const existente = grupos.get(key);

    if (existente) {
      existente.asignaciones.push(asignacion);
      return;
    }

    grupos.set(key, {
      id: `grupo-${normalizarTexto(materia)}-${tipoNivel.toLowerCase()}`,
      nombreMateria: materia,
      tipoNivel,
      tipo,
      asignaciones: [asignacion],
    });
  });

  return [...sueltos, ...grupos.values()];
}

export default async function CalificacionesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[#00408a]">Calificaciones</h1>

        <p className="mt-4 text-red-600">
          No se pudo identificar al docente autenticado.
        </p>
      </div>
    );
  }

  let periodoActivo: PeriodoAcademico | null = null;
  let asignaciones: Asignacion[] = [];
  let errorMessage: string | null = null;

  try {
    periodoActivo = await fetchAPI<PeriodoAcademico>(
      "/periodo_academico/activo",
    );

    const response = await fetchAPI<AsignacionesResponse>(
      `/asignaciones/docente/${userId}`,
    );

    asignaciones = (response.data ?? []).filter(
      (asignacion) =>
        asignacion.periodoAcademico?.id === periodoActivo?.id,
    );
  } catch (error) {
    console.error("Error cargando cursos del docente:", error);
    errorMessage =
      error instanceof Error
        ? error.message
        : "No se pudieron cargar los cursos.";
  }

  const cursos = agruparCursos(asignaciones);

  return (
    <div className="flex flex-col w-full p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#00408a]">
          Cursos
        </h1>

        {periodoActivo && (
          <p className="mt-2 text-sm text-gray-500">
            Período académico: {periodoActivo.descripcion}
          </p>
        )}
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {errorMessage}
        </div>
      ) : cursos.length === 0 ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-700">
          Aún no tienes cursos asignados para el período activo.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cursos.map((curso) => (
            <div
              key={curso.id}
              className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg"
            >
              <span className="mb-4 text-5xl">📖</span>

              <h2 className="font-bold text-gray-800">
                Curso: {curso.nombreMateria}
              </h2>

              <p className="mt-2 text-gray-700">
                Nivel: {curso.tipoNivel}
              </p>

              <p className="text-sm text-gray-600">
                {curso.asignaciones.length} asignación(es)
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}