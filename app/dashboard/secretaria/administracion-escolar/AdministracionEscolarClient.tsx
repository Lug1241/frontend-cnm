"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MdFactCheck,
  MdFilterAlt,
  MdPeople,
  MdSearch,
} from "react-icons/md";

import type { Asignacion } from "@/types/Asignacion";

import {
  agruparAdministracionEscolar,
  NOMBRES_NIVELES,
  ordenarNiveles,
} from "./_lib/agruparCursos";

interface Props {
  asignaciones: Asignacion[];
  periodoId: number;
  periodoDescripcion: string;
  nivelInicial?: string;
  cursoInicial?: string;
}

const ORDEN_DIAS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function BroomIcon() {
  return (
    <svg
      viewBox="0 0 256 256"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M235.29,216.7C212.86,205.69,200,182.12,200,152V134.69a15.94,15.94,0,0,0-10.09-14.87l-28.65-11.46A8,8,0,0,1,156.79,98l22.32-56.67C184,28.79,178,14.21,165.34,9.51a24,24,0,0,0-30.7,13.71L112.25,80.08a8,8,0,0,1-10.41,4.5L73.11,73.08a15.91,15.91,0,0,0-17.38,3.66C34.68,98.4,24,123.71,24,152a111.53,111.53,0,0,0,31.15,77.53A8.06,8.06,0,0,0,61,232H232a8,8,0,0,0,8-7.51A8.21,8.21,0,0,0,235.29,216.7ZM115.11,216a87.52,87.52,0,0,1-24.26-41.71,8.21,8.21,0,0,0-9.25-6.18A8,8,0,0,0,75.28,178a105.33,105.33,0,0,0,18.36,38H64.44A95.62,95.62,0,0,1,40,152a85.92,85.92,0,0,1,7.73-36.3l137.8,55.13c3,18.06,10.55,33.5,21.89,45.19Z" />
    </svg>
  );
}

function ordenarDias(dias: string[]) {
  return [...dias].sort((a, b) => {
    const posicionA =
      ORDEN_DIAS.indexOf(a);

    const posicionB =
      ORDEN_DIAS.indexOf(b);

    if (
      posicionA === -1 &&
      posicionB === -1
    ) {
      return a.localeCompare(b, "es");
    }

    if (posicionA === -1) return 1;
    if (posicionB === -1) return -1;

    return posicionA - posicionB;
  });
}

function obtenerSesiones(
  asignaciones: Asignacion[],
) {
  const diasPorHorario = new Map<
    string,
    Set<string>
  >();

  asignaciones.forEach((asignacion) => {
    const horario = [
      asignacion.horaInicio,
      asignacion.horaFin,
    ]
      .filter(Boolean)
      .join(" - ");

    if (!horario) return;

    const dias =
      diasPorHorario.get(horario) ??
      new Set<string>();

    (asignacion.dias ?? []).forEach(
      (dia) => dias.add(dia),
    );

    diasPorHorario.set(horario, dias);
  });

  return [...diasPorHorario.entries()]
    .map(([horario, dias]) => ({
      horario,
      dias: ordenarDias([...dias]),
    }))
    .sort((a, b) =>
      a.horario.localeCompare(b.horario),
    );
}

function obtenerParalelos(
  asignaciones: Asignacion[],
) {
  return [
    ...new Set(
      asignaciones
        .map(
          (asignacion) =>
            asignacion.paralelo,
        )
        .filter(Boolean),
    ),
  ];
}

export default function AdministracionEscolarClient({
  asignaciones,
  periodoId,
  periodoDescripcion,
  nivelInicial,
  cursoInicial,
}: Props) {
  const cursos = useMemo(
    () =>
      agruparAdministracionEscolar(
        asignaciones,
      ),
    [asignaciones],
  );

  const niveles = useMemo(
    () =>
      ordenarNiveles([
        ...new Set(
          cursos.map(
            (curso) => curso.nivel,
          ),
        ),
      ]),
    [cursos],
  );

  const cursoRestaurado = cursos.find(
    (curso) => curso.id === cursoInicial,
  );

  const [nivelActivo, setNivelActivo] =
    useState(
      cursoRestaurado?.nivel ??
        (nivelInicial &&
        niveles.includes(nivelInicial)
          ? nivelInicial
          : niveles[0] ?? ""),
    );

  const [cursoResaltado, setCursoResaltado] =
    useState(cursoRestaurado?.id ?? null);

  const pestañasRef = useRef(
    new Map<string, HTMLButtonElement>(),
  );

  useEffect(() => {
    if (!cursoRestaurado) {
      return;
    }

    const comportamiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
      ? "auto"
      : "smooth";

    const animacion = window.requestAnimationFrame(
      () => {
        pestañasRef.current
          .get(cursoRestaurado.nivel)
          ?.scrollIntoView({
            behavior: comportamiento,
            block: "nearest",
            inline: "center",
          });

        document
          .getElementById(
            `curso-${cursoRestaurado.id}`,
          )
          ?.scrollIntoView({
            behavior: comportamiento,
            block: "center",
          });
      },
    );

    const temporizador = window.setTimeout(
      () => setCursoResaltado(null),
      1500,
    );

    return () => {
      window.cancelAnimationFrame(animacion);
      window.clearTimeout(temporizador);
    };
  }, [cursoRestaurado]);

  const [busqueda, setBusqueda] =
    useState("");

  const [
    busquedaAplicada,
    setBusquedaAplicada,
  ] = useState("");

  function buscar(event: FormEvent) {
    event.preventDefault();

    setBusquedaAplicada(
      busqueda.trim(),
    );
  }

  function limpiar() {
    setBusqueda("");
    setBusquedaAplicada("");
  }

  const resultadosBusqueda =
    useMemo(() => {
      if (!busquedaAplicada) {
        return [];
      }

      const termino =
        normalizar(busquedaAplicada);

      return cursos.filter((curso) =>
        normalizar(
          curso.docenteNombre,
        ).includes(termino),
      );
    }, [cursos, busquedaAplicada]);

  const cursosNivel = cursos.filter(
    (curso) =>
      curso.nivel === nivelActivo,
  );

  const cursosVisibles =
    busquedaAplicada
      ? resultadosBusqueda
      : cursosNivel;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#00408a] sm:text-3xl">
            Materias del Período
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {periodoDescripcion}
          </p>
        </div>

        <form
          onSubmit={buscar}
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-center xl:max-w-xl"
        >
          <span className="shrink-0 text-sm font-semibold text-gray-700">
            Buscar:
          </span>

          <div className="flex w-full min-w-0 flex-1">
            <input
              value={busqueda}
              onChange={(event) =>
                setBusqueda(
                  event.target.value,
                )
              }
              placeholder="Ingrese el nombre del docente..."
              className="min-w-0 flex-1 rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00408a] focus:outline-none"
            />

            <button
              type="submit"
              title="Buscar docente"
              className="border-y border-gray-300 bg-[#00408a] px-3 text-white"
            >
              <MdSearch className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={limpiar}
              title="Limpiar búsqueda"
              className="rounded-r-md border border-gray-300 px-3 text-gray-600 transition hover:bg-gray-100"
            >
              <BroomIcon />
            </button>
          </div>
        </form>
      </div>

      {!busquedaAplicada && (
        <div className="overflow-x-auto border-b border-gray-200">
          <div className="flex min-w-max">
            {niveles.map((nivel) => (
              <button
                key={nivel}
                ref={(elemento) => {
                  if (elemento) {
                    pestañasRef.current.set(
                      nivel,
                      elemento,
                    );
                  } else {
                    pestañasRef.current.delete(
                      nivel,
                    );
                  }
                }}
                type="button"
                onClick={() =>
                  setNivelActivo(nivel)
                }
                className={`border-b-2 px-5 py-3 text-sm font-semibold transition ${
                  nivelActivo === nivel
                    ? "border-[#00408a] text-[#00408a]"
                    : "border-transparent text-gray-500 hover:text-[#00408a]"
                }`}
              >
                {NOMBRES_NIVELES[nivel] ??
                  nivel}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <MdFilterAlt
          className="h-5 w-5"
          aria-hidden
        />

        {busquedaAplicada ? (
          <span>
            Mostrando{" "}
            {cursosVisibles.length}{" "}
            resultado
            {cursosVisibles.length === 1
              ? ""
              : "s"}{" "}
            para el docente{" "}
            <strong className="text-gray-700">
              {busquedaAplicada}
            </strong>
            .
          </span>
        ) : (
          <span>
            Mostrando{" "}
            {cursosVisibles.length}{" "}
            resultado
            {cursosVisibles.length === 1
              ? ""
              : "s"}
          </span>
        )}
      </div>

      {cursosVisibles.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          {busquedaAplicada
            ? `No se encontraron materias con el docente "${busquedaAplicada}".`
            : "No existen materias registradas para este nivel."}
        </div>
      ) : (
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
          {cursosVisibles.map(
            (curso) => {
              const ids =
                curso.asignaciones
                  .map(
                    (asignacion) =>
                      asignacion.id,
                  )
                  .filter(
                    (
                      id,
                    ): id is number =>
                      typeof id ===
                      "number",
                  );

              const query =
                new URLSearchParams({
                  periodo:
                    String(periodoId),
                  ids: ids.join(","),
                  nivel: curso.nivel,
                  curso: curso.id,
                });

              const sesiones =
                obtenerSesiones(
                  curso.asignaciones,
                );

              const paralelos =
                obtenerParalelos(
                  curso.asignaciones,
                );

              return (
                <article
                  key={curso.id}
                  id={`curso-${curso.id}`}
                  className={`scroll-mt-6 flex flex-col justify-between rounded-xl border bg-white p-5 transition-[border-color,box-shadow,background-color] duration-700 ${
                    cursoResaltado === curso.id
                      ? "border-[#00408a] bg-blue-50/60 shadow-md ring-2 ring-[#00408a]"
                      : "border-gray-200 shadow-sm"
                  }`}
                >
                  <div>
                    <h2 className="text-lg font-bold text-[#00408a]">
                      {
                        curso.nombreMateria
                      }
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {curso.tipo}

                      {paralelos.length ===
                      1
                        ? ` | Paralelo: ${paralelos[0]}`
                        : paralelos.length >
                            1
                          ? ` | Paralelos: ${paralelos.join(", ")}`
                          : ""}
                    </p>

                    <div className="mt-4 space-y-2 text-sm text-gray-700">
                      {sesiones.map(
                        (sesion) => (
                          <div
                            key={
                              sesion.horario
                            }
                            className="grid grid-cols-[auto_1fr] gap-x-1"
                          >
                            <strong>
                              Horario:
                            </strong>

                            <span>
                              {
                                sesion.horario
                              }
                            </span>

                            <strong>
                              Días:
                            </strong>

                            <span>
                              {sesion.dias.join(
                                ", ",
                              ) || "-"}
                            </span>
                          </div>
                        ),
                      )}

                      {sesiones.length ===
                        0 && (
                        <p>
                          <strong>
                            Horario:
                          </strong>{" "}
                          -
                        </p>
                      )}

                      <p>
                        <strong>
                          Docente:
                        </strong>{" "}
                        {
                          curso.docenteNombre
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-start gap-2 border-t border-gray-100 pt-4">
                    <Link
                      href={`/dashboard/secretaria/administracion-escolar/lista?${query.toString()}`}
                      className="inline-flex items-center gap-2 rounded-md border border-[#00408a] px-3 py-2 text-sm font-semibold text-[#00408a] transition hover:bg-blue-50"
                    >
                      <MdPeople />
                      Ver Lista
                    </Link>

                    <Link
                      href={`/dashboard/secretaria/administracion-escolar/calificaciones?${query.toString()}`}
                      className="inline-flex items-center gap-2 rounded-md bg-[#00408a] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#00336e]"
                    >
                      <MdFactCheck />
                      Ver Calificaciones
                    </Link>
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
