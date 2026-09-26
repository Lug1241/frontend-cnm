"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BuscadorEstudiante from "./components/BuscadorEstudiante";
import BuscadorMateria from "./components/BuscadorMateria";
import HorarioMatriz from "./components/HorarioMatriz";
import TablaSeleccionadas from "./components/TablaSeleccionadas";
import AlertaPeriodoInactivo from "./components/AlertaPeriodoInactivo";
import TablaEstudiantesRepresentante from "./components/TablaEstudiantesRepresentante";
import BannerEstudianteMatriculando from "./components/BannerEstudianteMatriculando";
import Toast from "@/app/components/ui/Toast";
import { UserType } from "@/app/config/menu.config";
import {
  AsignacionMatriculacion,
  crearInscripcionesAction,
  crearMatriculaAction,
  eliminarInscripcionesAction,
  obtenerAsignacionesAction,
  obtenerInscripcionesAction,
  obtenerMateriasAction,
  obtenerMatriculaAction,
  InscripcionMatriculacion,
  MateriaMatriculacion,
  EstadoPeriodoMatricula,
  VerificacionDocsRepresentante,
  EstudianteRepresentanteItem,
} from "./actions";

// Define los tipos base (ajústalos según tus interfaces globales)
export interface EstudianteSeleccionado {
  id: number;
  nroCedula: string;
  primerNombre: string;
  primerApellido: string;
  nivel: string;
  jornada: string;
}

interface PeriodoActivo {
  id: number;
  descripcion: string;
}

function normalizarNivelMateria(nivel: string) {
  const equivalencias: Record<string, string> = {
    "1ro Básico Elemental": "1ro BE",
    "2do Básico Elemental": "2do BE",
    "1ro Básico Medio": "1ro BM",
    "2do Básico Medio": "2do BM",
    "3ro Básico Medio": "3ro BM",
    "1ro Básico Superior": "1ro BS",
    "2do Básico Superior": "2do BS",
    "3ro Básico Superior": "3ro BS",
    "1ro Bachillerato": "1ro BCH",
    "2do Bachillerato": "2do BCH",
    "3ro Bachillerato": "3ro BCH",
  };

  return equivalencias[nivel] ?? nivel;
}

export default function MatriculacionClient({
  periodoActivo,
  tipoInicial,
  userType = "docente",
  estadoPeriodoMatricula,
  verificacionDocsRepresentante,
  estudiantesRepresentante = [],
}: {
  periodoActivo: PeriodoActivo | null;
  tipoInicial: "grupales" | "individuales";
  userType?: UserType;
  estadoPeriodoMatricula?: EstadoPeriodoMatricula | null;
  verificacionDocsRepresentante?: VerificacionDocsRepresentante | null;
  estudiantesRepresentante?: EstudianteRepresentanteItem[];
}) {
  const [estudiante, setEstudiante] = useState<EstudianteSeleccionado | null>(null);
  const [matriculaId, setMatriculaId] = useState<number | null>(null);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<AsignacionMatriculacion[]>([]);
  const [asignacionesPersistidas, setAsignacionesPersistidas] = useState<number[]>([]);
  const [inscripcionesPersistidas, setInscripcionesPersistidas] = useState<Record<number, number>>({});
  const [inscripcionesAEliminar, setInscripcionesAEliminar] = useState<number[]>([]);
  const [materias, setMaterias] = useState<MateriaMatriculacion[]>([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<MateriaMatriculacion | null>(null);
  const [jornadaFiltro, setJornadaFiltro] = useState("");
  const [materiaSearch, setMateriaSearch] = useState("");
  const [asignaciones, setAsignaciones] = useState<AsignacionMatriculacion[]>([]);
  const [asignacionesPage, setAsignacionesPage] = useState(1);
  const [asignacionesTotalPages, setAsignacionesTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const materiaSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const asignacionesRequestId = useRef(0);

  const tipoActivo = tipoInicial === "grupales" ? "Grupal" : "Individual";

  useEffect(() => {
    let active = true;
    obtenerMateriasAction(tipoActivo)
      .then((result) => {
        if (active) setMaterias(result);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tipoActivo]);

  useEffect(() => () => {
    if (materiaSearchTimeout.current) clearTimeout(materiaSearchTimeout.current);
  }, []);

  const handleStudentSelect = async (selected: EstudianteSeleccionado) => {
    if (!periodoActivo) return;
    if (selected.nivel === "Graduado") {
      setErrorMsg("No es posible matricular a un estudiante con estado Graduado.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);
    try {
      const currentMatricula = await obtenerMatriculaAction(selected.id, periodoActivo.id);
      const existingInscripciones: InscripcionMatriculacion[] = currentMatricula
        ? await obtenerInscripcionesAction(currentMatricula.id)
        : [];
      const existingAssignments = existingInscripciones.map((item) => item.asignacion);
      setEstudiante(selected);
      setJornadaFiltro("");
      setMatriculaId(currentMatricula?.id ?? null);
      setMateriasSeleccionadas(existingAssignments);
      setAsignacionesPersistidas(existingAssignments.map((assignment) => assignment.id));
      setInscripcionesPersistidas(Object.fromEntries(
        existingInscripciones.map((item) => [item.asignacion.id, item.id]),
      ));
      setInscripcionesAEliminar([]);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "No se pudo preparar la matrícula.");
    } finally {
      setIsLoading(false);
    }
  };

  const cargarAsignaciones = async (materia: string, page = 1, jornada = jornadaFiltro) => {
    if (!estudiante || !periodoActivo || !materia.trim()) return;
    const requestId = ++asignacionesRequestId.current;

    try {
      setIsLoading(true);
      const response = await obtenerAsignacionesAction({
        periodoId: periodoActivo.id,
        nivel: normalizarNivelMateria(estudiante.nivel),
        materia: materia.trim(),
        jornada,
        tipo: tipoActivo,
        page,
      });
      if (requestId !== asignacionesRequestId.current) return;
      setAsignaciones(response.data);
      setAsignacionesPage(response.currentPage);
      setAsignacionesTotalPages(response.totalPages);
    } catch (error) {
      if (requestId === asignacionesRequestId.current) {
        setErrorMsg(error instanceof Error ? error.message : "No se pudieron cargar los horarios.");
      }
    } finally {
      if (requestId === asignacionesRequestId.current) setIsLoading(false);
    }
  };

  const handleMateriaSelect = async (materia: MateriaMatriculacion | null) => {
    if (materiaSearchTimeout.current) clearTimeout(materiaSearchTimeout.current);
    ++asignacionesRequestId.current;
    setMateriaSeleccionada(materia);
    setMateriaSearch(materia?.nombre ?? "");
    setAsignaciones([]);
    setAsignacionesPage(1);
    if (!materia || !estudiante || !periodoActivo) return;
    await cargarAsignaciones(materia.nombre, 1);
  };

  const handleMateriaTyping = (text: string) => {
    if (materiaSearchTimeout.current) clearTimeout(materiaSearchTimeout.current);
    const term = text.trim();
    setMateriaSearch(term);
    ++asignacionesRequestId.current;

    if (term.length < 2 || !estudiante || !periodoActivo) {
      setAsignaciones([]);
      setAsignacionesPage(1);
      setAsignacionesTotalPages(0);
      return;
    }

    materiaSearchTimeout.current = setTimeout(async () => {
      await cargarAsignaciones(term, 1);
    }, 300);
  };

  const handleJornadaChange = async (jornada: string) => {
    if (materiaSearchTimeout.current) clearTimeout(materiaSearchTimeout.current);
    ++asignacionesRequestId.current;
    setJornadaFiltro(jornada);
    if (!materiaSearch.trim()) return;
    await cargarAsignaciones(materiaSearch, 1, jornada);
  };

  const changeAsignacionesPage = async (page: number) => {
    if (page < 1 || page > asignacionesTotalPages || !materiaSearch.trim()) return;
    if (materiaSearchTimeout.current) clearTimeout(materiaSearchTimeout.current);
    ++asignacionesRequestId.current;
    await cargarAsignaciones(materiaSearch, page);
  };

  const toggleAsignacion = (asignacion: AsignacionMatriculacion) => {
    if (asignacion.cupos <= 0 && !materiasSeleccionadas.some((item) => item.id === asignacion.id)) return;
    if (materiasSeleccionadas.some((item) => item.materia?.id === asignacion.materia?.id && item.id !== asignacion.id)) {
      setErrorMsg("No puedes seleccionar otra asignación de la misma materia.");
      return;
    }
    setMateriasSeleccionadas((current) => {
      if (!current.some((item) => item.id === asignacion.id)) return [...current, asignacion];
      const inscriptionId = inscripcionesPersistidas[asignacion.id];
      if (inscriptionId) setInscripcionesAEliminar((pending) =>
        pending.includes(inscriptionId) ? pending : [...pending, inscriptionId],
      );
      return current.filter((item) => item.id !== asignacion.id);
    });
  };

  const removeAsignacion = (asignacionId: number) => {
    const inscriptionId = inscripcionesPersistidas[asignacionId];
    if (inscriptionId && !inscripcionesAEliminar.includes(inscriptionId)) {
      setInscripcionesAEliminar((current) => [...current, inscriptionId]);
    }
    setMateriasSeleccionadas((current) => current.filter((item) => item.id !== asignacionId));
  };

  const handleFinalizar = async () => {
    if (!estudiante || !periodoActivo) return;
    const pendingAssignments = materiasSeleccionadas.filter(
      (item) => !asignacionesPersistidas.includes(item.id),
    );
    if (pendingAssignments.length === 0 && inscripcionesAEliminar.length === 0) return;
    setErrorMsg("");
    setIsFinalizing(true);
    try {
      const currentMatriculaId = matriculaId ?? (await crearMatriculaAction({
        nivel: estudiante.nivel,
        estado: "En curso",
        ID_estudiante: estudiante.id,
        ID_periodo_academico: periodoActivo.id,
      })).id;
      if (!matriculaId) setMatriculaId(currentMatriculaId);
      const deleted = await eliminarInscripcionesAction(inscripcionesAEliminar);
      if (!deleted.success) throw new Error(deleted.error);
      const result = await crearInscripcionesAction(
        currentMatriculaId,
        pendingAssignments.map((item) => item.id),
      );
      setAsignacionesPersistidas((current) => [
        ...current,
        ...result.createdIds,
      ]);
      if (!result.success) throw new Error(result.error);
      const refreshedInscripciones = await obtenerInscripcionesAction(currentMatriculaId);
      setMateriasSeleccionadas(refreshedInscripciones.map((item) => item.asignacion));
      setAsignacionesPersistidas(refreshedInscripciones.map((item) => item.asignacion.id));
      setInscripcionesPersistidas(Object.fromEntries(
        refreshedInscripciones.map((item) => [item.asignacion.id, item.id]),
      ));
      setInscripcionesAEliminar([]);
      setSuccessMsg("La inscripción finalizó con éxito.");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "No se pudo finalizar la matrícula.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const resetStudent = () => {
    setEstudiante(null);
    setMatriculaId(null);
    setMateriasSeleccionadas([]);
    setAsignacionesPersistidas([]);
    setInscripcionesPersistidas({});
    setInscripcionesAEliminar([]);
    setMateriaSeleccionada(null);
    setMateriaSearch("");
    setAsignaciones([]);
    setAsignacionesPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#003366]">
              {userType === "representante"
                ? `Periodo académico activo ${periodoActivo?.descripcion || ""}`
                : "Matriculación"}
            </h1>
            {userType !== "representante" && (
              <p className="mt-1 text-sm text-gray-500">
                Periodo {periodoActivo?.descripcion || "no disponible"}
              </p>
            )}
          </div>
          {estudiante && userType !== "representante" && (
            <button onClick={resetStudent} className="text-sm font-medium text-[#003366] hover:underline">
              Cambiar estudiante
            </button>
          )}
        </div>
      </div>

      {userType === "representante" &&
        estadoPeriodoMatricula &&
        !estadoPeriodoMatricula.periodoActivo && (
          <div className="px-4 sm:px-6">
            <AlertaPeriodoInactivo
              mensaje={estadoPeriodoMatricula.mensaje}
              fechaInicio={estadoPeriodoMatricula.fechaInicio}
              fechaFin={estadoPeriodoMatricula.fechaFin}
            />
          </div>
        )}

      {userType === "representante" &&
        verificacionDocsRepresentante &&
        !verificacionDocsRepresentante.datosActualizados && (
          <div className="mx-4 my-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 sm:mx-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-amber-800">
                  Documentación del representante pendiente
                </p>
                <p className="mt-0.5 text-xs text-amber-700 sm:text-sm">
                  {verificacionDocsRepresentante.message} (
                  {verificacionDocsRepresentante.faltantes?.join(", ") ||
                    "Cédula / Croquis"}
                  ).
                </p>
              </div>
              <Link
                href="/dashboard/representante/perfil"
                className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#003F89] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#003366]"
              >
                Actualizar documentos
              </Link>
            </div>
          </div>
        )}

      {!periodoActivo && (
        <div className="mx-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mx-6">
          No existe un periodo académico activo.
        </div>
      )}

      {errorMsg && (
        <div className="mx-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-6">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <Toast message={successMsg} onClose={() => setSuccessMsg("")} />
      )}

      {!estudiante ? (
        <div className="px-4 sm:px-6">
          {userType === "representante" ? (
            <TablaEstudiantesRepresentante
              estudiantes={estudiantesRepresentante}
              periodoMatriculaActivo={estadoPeriodoMatricula?.periodoActivo ?? true}
              docsRepresentanteValidos={
                verificacionDocsRepresentante?.datosActualizados ?? true
              }
              onSelectEstudiante={handleStudentSelect}
              mensajePeriodo={estadoPeriodoMatricula?.mensaje}
            />
          ) : (
            <div className="max-w-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <BuscadorEstudiante onSelect={handleStudentSelect} />
            </div>
          )}
          {isLoading && <p className="mt-3 text-sm text-gray-500">Preparando matrícula...</p>}
        </div>
      ) : (
        <>
          {userType === "representante" && (
            <div className="px-4 sm:px-6">
              <BannerEstudianteMatriculando
                estudiante={estudiante}
                onCambiarEstudiante={resetStudent}
              />
            </div>
          )}
          <div className="grid grid-cols-1 gap-5 px-4 pb-6 sm:px-6 lg:grid-cols-12">
          <section className="border border-gray-200 bg-white p-5 shadow-sm lg:col-span-5">
            <div className="mb-5 border-b border-gray-200 pb-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Estudiante</p>
              <h2 className="mt-1 text-lg font-semibold text-[#003366]">
                {estudiante.primerApellido} {estudiante.primerNombre}
              </h2>
              <p className="text-sm text-gray-500">{estudiante.nivel} · {estudiante.jornada}</p>
            </div>

            <BuscadorMateria
              materias={materias}
              selected={materiaSeleccionada}
              tipo={tipoActivo}
              onSelect={handleMateriaSelect}
              onTyping={handleMateriaTyping}
            />

            <label className="mt-3 block text-sm text-gray-700">
              Jornada
              <select
                value={jornadaFiltro}
                onChange={(event) => void handleJornadaChange(event.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#003366] focus:outline-none"
              >
                <option value="">Todas las jornadas</option>
                <option value="Matutina">Matutina</option>
                <option value="Vespertina">Vespertina</option>
              </select>
            </label>

            <div className="mt-4 space-y-2">
              {isLoading && <p className="text-sm text-gray-500">Cargando opciones...</p>}
              {!isLoading && materiaSeleccionada && asignaciones.length === 0 && (
                <p className="text-sm text-gray-500">No hay horarios disponibles para esta materia.</p>
              )}
              {asignaciones.map((asignacion) => {
                const selected = materiasSeleccionadas.some((item) => item.id === asignacion.id);
                return (
                  <button
                    key={asignacion.id}
                    onClick={() => toggleAsignacion(asignacion)}
                    disabled={asignacion.cupos <= 0 && !selected}
                    className={`w-full border p-3 text-left text-sm transition-colors ${selected ? "border-[#003366] bg-blue-50" : asignacion.cupos <= 0 ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60" : "border-gray-200 hover:border-[#003366]"}`}
                  >
                    <span className="flex items-center justify-between gap-3 font-medium text-gray-800">
                      <span>{asignacion.materia?.nombre}</span>
                      <span className="text-xs font-normal text-gray-500">Cupos: {asignacion.cupos}</span>
                    </span>
                    <span className="mt-1 block text-gray-500">
                      {asignacion.dias?.join(" - ")} · {asignacion.horaInicio} - {asignacion.horaFin}
                    </span>
                    <span className="mt-1 block text-gray-500">
                      Paralelo {asignacion.paralelo} · Nivel {asignacion.materia?.nivel}
                    </span>
                    <span className="mt-1 block text-gray-500">
                      Docente: {asignacion.docente?.primerNombre} {asignacion.docente?.primerApellido}
                    </span>
                  </button>
                );
              })}
              {asignacionesTotalPages > 1 && (
                <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                  <span>Página {asignacionesPage} de {asignacionesTotalPages}</span>
                  <div className="flex gap-2">
                    <button type="button" disabled={isLoading || asignacionesPage === 1} onClick={() => void changeAsignacionesPage(asignacionesPage - 1)} className="hover:text-[#003366] disabled:opacity-40">Anterior</button>
                    <button type="button" disabled={isLoading || asignacionesPage === asignacionesTotalPages} onClick={() => void changeAsignacionesPage(asignacionesPage + 1)} className="hover:text-[#003366] disabled:opacity-40">Siguiente</button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-5 border border-gray-200 bg-white p-5 shadow-sm lg:col-span-7">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="font-semibold text-[#003366]">Horario preliminar</h2>
              <span className="text-sm text-gray-500">{materiasSeleccionadas.length} seleccionada(s)</span>
            </div>
            {materiasSeleccionadas.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">Selecciona una asignación para preparar la matrícula.</p>
            ) : (
              <HorarioMatriz
                asignaciones={materiasSeleccionadas}
                jornada={estudiante.jornada}
                nivel={estudiante.nivel}
                onRemove={removeAsignacion}
              />
            )}
            <TablaSeleccionadas asignaciones={materiasSeleccionadas} onRemove={removeAsignacion} />
            <div className="mt-5 flex justify-end border-t border-gray-200 pt-4">
              <button
                onClick={handleFinalizar}
                disabled={isFinalizing || (
                  !materiasSeleccionadas.some((item) => !asignacionesPersistidas.includes(item.id)) &&
                  inscripcionesAEliminar.length === 0
                )}
                className="bg-[#28a745] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#218838] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isFinalizing ? "Guardando..." : "Finalizar inscripción"}
              </button>
            </div>
          </section>
        </div>
        </>
      )}
    </div>
  );
}