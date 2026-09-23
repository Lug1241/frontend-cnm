import { notFound } from "next/navigation";
import { getCurrentDocente } from "../_lib/docente";

import { fetchAPI } from "@/lib/api";
import { Asignacion } from "@/types/Asignacion";
import { PeriodoAcademico } from "@/types/PeriodoAcademico";
import { EstudianteCurso } from "@/types/Calificaciones";

import type { FechaProceso } from "@/types/FechaProceso";
import GradesWorkspace from "./GradesWorkspace";

import {
  agruparCursos,
} from "../_lib/cursos";


interface AsignacionesResponse {
  data: Asignacion[];
}

interface FechasProcesosResponse {
  data: FechaProceso[];
}

interface EstudianteAsignacion {
  nro: number;
  idInscripcion: number;
  idEstudiante: number;
  nombreCompleto: string;
  nivel: string;
}

function determinarJornada(horaInicio?: string) {
  if (!horaInicio) return "—";

  const hora = Number(horaInicio.split(":")[0]);

  if (Number.isNaN(hora)) return "—";

  return hora < 12 ? "Matutina" : "Vespertina";
}

export default async function CursoCalificacionesPage({
  params,
}: {
  params: Promise<{ cursoId: string }>;
}) {
  const { cursoId } = await params;

  const docenteActual = await getCurrentDocente();

  const periodoActivo =
    await fetchAPI<PeriodoAcademico>(
      "/periodo_academico/activo",
    );

  let fechasNotas: FechaProceso[] = [];

  try {
    const fechasResponse =
      await fetchAPI<FechasProcesosResponse>(
        "/fechas_procesos/obtener?page=1&limit=20&search=fechas_notas",
      );

    fechasNotas = fechasResponse.data ?? [];
  } catch (error) {
    console.error("Error cargando fechas de notas:", error);
  }

  const response =
    await fetchAPI<AsignacionesResponse>(
      `/asignaciones/docente/${docenteActual.id}`,
    );

  const asignacionesPeriodo = (response.data ?? []).filter(
    (asignacion) =>
      asignacion.periodoAcademico?.id === periodoActivo.id,
  );

  const cursos = agruparCursos(asignacionesPeriodo);

  const curso = cursos.find(
    (item) => item.id === cursoId,
  );

  if (!curso) {
    notFound();
  }

  const respuestas = await Promise.all(
    curso.asignaciones
      .filter(
        (
          asignacion,
        ): asignacion is Asignacion & { id: number } =>
          typeof asignacion.id === "number",
      )
      .map(async (asignacion) => {
        const estudiantes =
          await fetchAPI<EstudianteAsignacion[]>(
            `/inscripcion/asignacion/${asignacion.id}`,
          );

        return estudiantes.map((estudiante) => ({
          ...estudiante,
          idAsignacion: asignacion.id,
        }));
      }),
  );

  const estudiantes: EstudianteCurso[] =
    respuestas
      .flat()
      .sort((a, b) =>
        a.nombreCompleto.localeCompare(
          b.nombreCompleto,
          "es",
        ),
      )
      .map((estudiante, index) => ({
        ...estudiante,
        nro: index + 1,
      }));

    const nombreDocente =
    `${docenteActual.primerNombre} ${docenteActual.primerApellido}`.trim();

  return (
    <div className="w-full p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-center text-2xl font-bold text-[#00408a] sm:text-3xl">
          Gestión de Calificaciones
        </h1>
      </div>

      <div className="mb-6 rounded-md border border-gray-200 bg-white p-5">
        <h2 className="text-center text-xl font-bold">
          CONSERVATORIO NACIONAL DE MÚSICA
        </h2>
        
        <div className="mt-5 grid gap-2 text-sm md:grid-cols-2">
          <div>
            <strong>Profesor:</strong>{" "}
            {nombreDocente || "—"}
          </div>

          <div>
            <strong>Asignatura:</strong>{" "}
            {curso.nombreMateria}
          </div>

          <div>
            <strong>Curso:</strong>{" "}
            Niveles {curso.tipoNivel}
          </div>

          <div>
            <strong>Paralelo:</strong>{" "}
            {curso.asignaciones.length > 1
              ? "Múltiples"
              : curso.asignaciones[0]?.paralelo || "—"}
          </div>

          <div>
            <strong>Año Lectivo:</strong>{" "}
            {periodoActivo.descripcion}
          </div>

          <div>
            <strong>Jornada:</strong>{" "}
            {determinarJornada(curso.asignaciones[0]?.horaInicio)}
          </div>
        </div>
      </div>

      <GradesWorkspace
        estudiantes={estudiantes}
        esBE={curso.tipoNivel === "BE"}
        fechasNotas={fechasNotas}
      />
    </div>
  );
}