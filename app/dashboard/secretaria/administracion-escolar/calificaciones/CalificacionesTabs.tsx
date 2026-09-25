"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type {
  DetalleParcialAdministracion,
  FilaCalificacionAdministracion,
} from "@/types/AdministracionEscolar";
import type {
  DescripcionFechaNota,
  FechaProceso,
} from "@/types/FechaProceso";

type MainTab = "q1" | "q2" | "final";
type SubTab = "p1" | "p2" | "quimestre";

interface Props {
  estudiantes: FilaCalificacionAdministracion[];
  fechas: FechaProceso[];

  materia: string;
  docente: string;
  nivel: string;
  paralelo: string;
  jornada: string;
  periodo: string;
}

const CRITERIOS_COMPORTAMIENTO = [
  "RESPETO Y CONSIDERACIÓN",
  "VALORACIÓN DE LA DIVERSIDAD",
  "CUMPLIMIENTO DE LAS NORMAS DE CONVIVENCIA",
  "CUIDADO DEL PATRIMONIO INSTITUCIONAL",
  "RESPETO A LA PROPIEDAD AJENA",
  "PUNTUALIDAD Y ASISTENCIA",
  "HONESTIDAD",
  "PRESENTACIÓN PERSONAL (LIMPIEZA Y UNIFORME)",
  "PARTICIPACIÓN COMUNITARIA",
  "RESPONSABILIDAD",
];

function numero(value?: number | null) {
  return typeof value === "number"
    ? value.toFixed(2)
    : "";
}

function valorSimple(value?: number | null) {
  return typeof value === "number"
    ? String(value)
    : "";
}

function abreviarNivel(nivel?: string | null) {
  if (!nivel) return "";

  const mapa: Record<string, string> = {
    "1ro Básico Elemental": "1BE",
    "2do Básico Elemental": "2BE",

    "1ro Básico Medio": "1BM",
    "2do Básico Medio": "2BM",
    "3ro Básico Medio": "3BM",

    "1ro Básico Superior": "1BS",
    "2do Básico Superior": "2BS",
    "3ro Básico Superior": "3BS",

    "1ro Bachillerato": "1BCH",
    "2do Bachillerato": "2BCH",
    "3ro Bachillerato": "3BCH",
  };

  return mapa[nivel] ?? nivel;
}

function formatoFecha(fecha?: string) {
  if (!fecha) return "";

  const [anio, mes, dia] = fecha.split("-");

  if (!anio || !mes || !dia) {
    return fecha;
  }

  return `${dia}/${mes}/${anio}`;
}

function EncabezadoActa({
  subtitulo,
  materia,
  docente,
  nivel,
  paralelo,
  jornada,
  periodo,
}: {
  subtitulo: string;
  materia: string;
  docente: string;
  nivel: string;
  paralelo: string;
  jornada: string;
  periodo: string;
}) {
  return (
    <header className="border border-gray-300 bg-white p-5">
      <div className="grid grid-cols-[90px_1fr_220px] items-center gap-4">
        <div className="flex justify-start">
          <Image
            src="/ConservatorioNacional.png"
            alt="Conservatorio Nacional de Música"
            width={82}
            height={82}
            className="h-auto max-h-20 w-auto object-contain"
            priority
          />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            CONSERVATORIO NACIONAL DE MUSICA
          </h2>

          <p className="mt-2 text-base font-bold text-gray-900 sm:text-lg">
            {subtitulo}
          </p>
        </div>

        <div className="flex justify-end">
          <Image
            src="/Ministerio.png"
            alt="Ministerio de Educación"
            width={210}
            height={60}
            className="h-auto max-h-16 w-auto max-w-[210px] object-contain"
            priority
          />
        </div>
      </div>

      <div className="mt-4 grid gap-x-10 gap-y-2 text-sm text-gray-800 sm:grid-cols-2">
        <div className="space-y-2">
          <p>
            <strong>Profesor:</strong>{" "}
            {docente}
          </p>

          <p>
            <strong>Curso:</strong>{" "}
            {nivel}
          </p>

          <p>
            <strong>Año Lectivo:</strong>{" "}
            {periodo}
          </p>
        </div>

        <div className="space-y-2">
          <p>
            <strong>Asignatura:</strong>{" "}
            {materia}
          </p>

          <p>
            <strong>Paralelo:</strong>{" "}
            {paralelo}
          </p>

          <p>
            <strong>Jornada:</strong>{" "}
            {jornada}
          </p>
        </div>
      </div>
    </header>
  );
}

function BandaFecha({
  fecha,
}: {
  fecha?: FechaProceso;
}) {
  return (
    <div className="border border-amber-300 bg-amber-100 px-4 py-4 text-center text-sm text-amber-800">
      {fecha ? (
        <>
          ◷ Disponible del{" "}
          {formatoFecha(fecha.fechaInicio)} al{" "}
          {formatoFecha(fecha.fechaFin)}
        </>
      ) : (
        <>◷ Fecha por definirse</>
      )}
    </div>
  );
}

function CabeceraVertical({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="h-48 min-w-16 border border-gray-300 bg-[#c7dcf8] px-1 py-2 text-center text-xs font-bold">
      <span
        className="inline-block whitespace-nowrap"
        style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
        }}
      >
        {children}
      </span>
    </th>
  );
}

function TablaParcialSuperior({
  estudiantes,
  quimestre,
  parcial,
}: {
  estudiantes: FilaCalificacionAdministracion[];
  quimestre: "q1" | "q2";
  parcial: "p1" | "p2";
}) {
  return (
    <div className="overflow-x-auto border border-gray-300">
      <table className="min-w-[1850px] border-collapse text-xs">
        <thead>
          <tr>
            <th
              colSpan={2}
              className="border border-gray-300 bg-white"
            />

            <th
              colSpan={6}
              className="border border-gray-300 bg-white px-3 py-3 text-center font-bold"
            >
              Evaluación de Aprendizajes
            </th>

            <th
              colSpan={13}
              className="border border-gray-300 bg-white px-3 py-3 text-center font-bold"
            >
              Evaluación del Comportamiento
            </th>
          </tr>

          <tr>
            <th className="w-14 border border-gray-300 bg-[#c7dcf8] px-2 py-3 text-center">
              Nro
            </th>

            <th className="min-w-72 border border-gray-300 bg-[#c7dcf8] px-3 py-3 text-center">
              Nómina de Estudiantes
            </th>

            <CabeceraVertical>
              INSUMO 1
            </CabeceraVertical>

            <CabeceraVertical>
              INSUMO 2
            </CabeceraVertical>

            <CabeceraVertical>
              PONDERACIÓN 70%
            </CabeceraVertical>

            <CabeceraVertical>
              EVALUACIÓN SUMATIVA
            </CabeceraVertical>

            <CabeceraVertical>
              PONDERACIÓN 30%
            </CabeceraVertical>

            <CabeceraVertical>
              PROMEDIO PARCIAL
            </CabeceraVertical>

            {CRITERIOS_COMPORTAMIENTO.map(
              (criterio) => (
                <CabeceraVertical key={criterio}>
                  {criterio}
                </CabeceraVertical>
              ),
            )}

            <CabeceraVertical>
              PROMEDIO COMPORTAMIENTO
            </CabeceraVertical>

            <CabeceraVertical>
              NIVEL
            </CabeceraVertical>

            <CabeceraVertical>
              VALORACIÓN
            </CabeceraVertical>
          </tr>
        </thead>

        <tbody>
          {estudiantes.map(
            (estudiante, index) => {
              const detalle =
                estudiante.detalleParciales?.[
                  quimestre
                ]?.[parcial];

              const comportamiento =
                detalle?.criteriosComportamiento ??
                [];

              return (
                <tr
                  key={
                    estudiante.idInscripcion
                  }
                  className="even:bg-gray-50"
                >
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {index + 1}
                  </td>

                  <td className="border border-gray-300 px-3 py-2">
                    {
                      estudiante.nombreCompleto
                    }
                  </td>

                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {numero(detalle?.insumo1)}
                  </td>

                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {numero(detalle?.insumo2)}
                  </td>

                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {numero(
                      detalle?.ponderacion70,
                    )}
                  </td>

                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {numero(
                      detalle?.evaluacion,
                    )}
                  </td>

                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {numero(
                      detalle?.ponderacion30,
                    )}
                  </td>

                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {numero(
                      detalle?.promedioParcial,
                    )}
                  </td>

                  {CRITERIOS_COMPORTAMIENTO.map(
                    (_, criterioIndex) => (
                      <td
                        key={criterioIndex}
                        className="border border-gray-300 bg-emerald-100 px-2 py-2 text-center"
                      >
                        {valorSimple(
                          comportamiento[
                            criterioIndex
                          ],
                        )}
                      </td>
                    ),
                  )}

                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {numero(
                      detalle?.promedioComportamiento,
                    )}
                  </td>

                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {abreviarNivel(
                      estudiante.nivel,
                    )}
                  </td>

                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {
                      detalle?.valoracionComportamiento ??
                      ""
                    }
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}

function TablaParcialBe({
  estudiantes,
  quimestre,
  parcial,
}: {
  estudiantes: FilaCalificacionAdministracion[];
  quimestre: "q1" | "q2";
  parcial: "p1" | "p2";
}) {
  return (
    <div className="overflow-x-auto border border-gray-300">
      <table className="w-full min-w-[950px] border-collapse text-sm">
        <thead className="bg-[#c7dcf8]">
          <tr>
            <th className="border border-gray-300 px-3 py-3">
              Nro
            </th>

            <th className="border border-gray-300 px-3 py-3 text-left">
              Nómina de Estudiantes
            </th>

            <th className="border border-gray-300 px-3 py-3">
              Insumo 1
            </th>

            <th className="border border-gray-300 px-3 py-3">
              Insumo 2
            </th>

            <th className="border border-gray-300 px-3 py-3">
              Ponderación 70%
            </th>

            <th className="border border-gray-300 px-3 py-3">
              Evaluación Sumativa
            </th>

            <th className="border border-gray-300 px-3 py-3">
              Mejoramiento
            </th>

            <th className="border border-gray-300 px-3 py-3">
              Ponderación 30%
            </th>

            <th className="border border-gray-300 px-3 py-3">
              Nota Parcial
            </th>

            <th className="border border-gray-300 px-3 py-3">
              Nivel
            </th>
          </tr>
        </thead>

        <tbody>
          {estudiantes.map(
            (estudiante, index) => {
              const detalle =
                estudiante.detalleParciales?.[
                  quimestre
                ]?.[parcial];

              return (
                <tr
                  key={
                    estudiante.idInscripcion
                  }
                  className="even:bg-gray-50"
                >
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {index + 1}
                  </td>

                  <td className="border border-gray-300 px-3 py-2">
                    {
                      estudiante.nombreCompleto
                    }
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(detalle?.insumo1)}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(detalle?.insumo2)}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(
                      detalle?.ponderacion70,
                    )}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(
                      detalle?.evaluacion,
                    )}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(
                      detalle?.mejoramiento,
                    )}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(
                      detalle?.ponderacion30,
                    )}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(
                      detalle?.notaParcial,
                    )}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {abreviarNivel(
                      estudiante.nivel,
                    )}
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}

function TablaQuimestre({
  estudiantes,
  quimestre,
}: {
  estudiantes: FilaCalificacionAdministracion[];
  quimestre: "q1" | "q2";
}) {
  const esBE =
    estudiantes[0]?.tipoCalificacion ===
    "BE";

  return (
    <div className="overflow-x-auto border border-gray-300">
      <table className="w-full min-w-[1100px] border-collapse text-sm">
        <thead>
          <tr>
            <th
              colSpan={2}
              className="border border-gray-300 bg-white"
            />

            <th
              colSpan={esBE ? 7 : 9}
              className="border border-gray-300 bg-white px-3 py-3 text-center font-bold"
            >
              {esBE
                ? "RESUMEN DE APRENDIZAJES"
                : "RESUMEN DE APRENDIZAJES Y COMPORTAMIENTO"}
            </th>
          </tr>

          <tr className="bg-[#c7dcf8]">
            <th className="border border-gray-300 px-3 py-3">
              Nro
            </th>

            <th className="min-w-72 border border-gray-300 px-3 py-3">
              Nómina de Estudiantes
            </th>

            <CabeceraVertical>
              Primer Parcial
            </CabeceraVertical>

            <CabeceraVertical>
              Segundo Parcial
            </CabeceraVertical>

            <CabeceraVertical>
              Ponderación 70%
            </CabeceraVertical>

            <CabeceraVertical>
              Examen
            </CabeceraVertical>

            <CabeceraVertical>
              Ponderación 30%
            </CabeceraVertical>

            <CabeceraVertical>
              Promedio Final
            </CabeceraVertical>

            {!esBE && (
              <CabeceraVertical>
                Promedio Comportamiento
              </CabeceraVertical>
            )}

            <CabeceraVertical>
              Nivel
            </CabeceraVertical>

            {!esBE && (
              <CabeceraVertical>
                Comportamiento Final
              </CabeceraVertical>
            )}
          </tr>
        </thead>

        <tbody>
          {estudiantes.map(
            (estudiante, index) => {
              const resultado =
                quimestre === "q1"
                  ? estudiante.quimestre1
                  : estudiante.quimestre2;

              return (
                <tr
                  key={
                    estudiante.idInscripcion
                  }
                  className="even:bg-gray-50"
                >
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {index + 1}
                  </td>

                  <td className="border border-gray-300 px-3 py-2">
                    {
                      estudiante.nombreCompleto
                    }
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(
                      resultado?.parcial1,
                    )}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(
                      resultado?.parcial2,
                    )}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(
                      resultado?.ponderacion70,
                    )}
                  </td>

                  <td className="border border-gray-300 bg-emerald-100 px-3 py-2 text-center">
                    {numero(
                      resultado?.examen,
                    )}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(
                      resultado?.ponderacion30,
                    )}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(
                      resultado?.promedioQuimestral,
                    )}
                  </td>

                  {!esBE && (
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {numero(
                        resultado?.comportamiento,
                      )}
                    </td>
                  )}

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {abreviarNivel(
                      estudiante.nivel,
                    )}
                  </td>

                  {!esBE && (
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {
                        resultado?.valoracionComportamiento ??
                        ""
                      }
                    </td>
                  )}
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}

function Estado({
  estado,
}: {
  estado?: string;
}) {
  if (!estado) return null;

  const clase =
    estado === "Aprobado"
      ? "bg-green-600 text-white"
      : estado === "Supletorio"
        ? "bg-yellow-300 text-black"
        : "bg-red-600 text-white";

  return (
    <span className={`px-2 py-1 ${clase}`}>
      {estado}
    </span>
  );
}

function TablaFinal({
  estudiantes,
}: {
  estudiantes: FilaCalificacionAdministracion[];
}) {
  return (
    <div className="overflow-x-auto border border-gray-300">
      <table className="w-full min-w-[1050px] border-collapse text-sm">
        <thead>
          <tr>
            <th
              colSpan={2}
              className="border border-gray-300 bg-white"
            />

            <th
              colSpan={6}
              className="border border-gray-300 bg-white px-3 py-3 text-center font-bold"
            >
              RESUMEN DE APRENDIZAJES
            </th>

            <th
              colSpan={2}
              className="border border-gray-300 bg-white"
            />
          </tr>

          <tr className="bg-[#c7dcf8]">
            <th className="border border-gray-300 px-3 py-3">
              Nro
            </th>

            <th className="min-w-72 border border-gray-300 px-3 py-3">
              Nómina de Estudiantes
            </th>

            <CabeceraVertical>
              Primer Quimestre
            </CabeceraVertical>

            <CabeceraVertical>
              Segundo Quimestre
            </CabeceraVertical>

            <CabeceraVertical>
              Promedio Anual
            </CabeceraVertical>

            <CabeceraVertical>
              Comportamiento
            </CabeceraVertical>

            <CabeceraVertical>
              Examen Supletorio
            </CabeceraVertical>

            <CabeceraVertical>
              Promedio Final
            </CabeceraVertical>

            <CabeceraVertical>
              Nivel
            </CabeceraVertical>

            <CabeceraVertical>
              Estado
            </CabeceraVertical>
          </tr>
        </thead>

        <tbody>
          {estudiantes.map(
            (estudiante, index) => {
              const final =
                estudiante.final;

              const promedioAnual =
                final?.promedioAnual;

              const promedioFinal =
                final?.promedioFinal;

              return (
                <tr
                  key={
                    estudiante.idInscripcion
                  }
                  className="even:bg-gray-50"
                >
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {index + 1}
                  </td>

                  <td className="border border-gray-300 px-3 py-2">
                    {
                      estudiante.nombreCompleto
                    }
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(
                      final?.primerQuimestre,
                    )}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {numero(
                      final?.segundoQuimestre,
                    )}
                  </td>

                  <td
                    className={`border border-gray-300 px-3 py-2 text-center ${
                      typeof promedioAnual ===
                        "number" &&
                      promedioAnual < 7
                        ? "text-red-600"
                        : ""
                    }`}
                  >
                    {numero(promedioAnual)}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {
                      final?.valoracionComportamiento ??
                      ""
                    }
                  </td>

                  <td className="border border-gray-300 bg-red-100 px-3 py-2 text-center">
                    {numero(
                      final?.examenRecuperacion,
                    )}
                  </td>

                  <td
                    className={`border border-gray-300 px-3 py-2 text-center ${
                      typeof promedioFinal ===
                        "number" &&
                      promedioFinal < 7
                        ? "text-red-600"
                        : ""
                    }`}
                  >
                    {numero(promedioFinal)}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {abreviarNivel(
                      estudiante.nivel,
                    )}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <Estado
                      estado={
                        final?.estado
                      }
                    />
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function CalificacionesTabs({
  estudiantes,
  fechas,
  materia,
  docente,
  nivel,
  paralelo,
  jornada,
  periodo,
}: Props) {
  const [mainTab, setMainTab] =
    useState<MainTab>("q1");

  const [subQ1, setSubQ1] =
    useState<SubTab>("p1");

  const [subQ2, setSubQ2] =
    useState<SubTab>("p1");

  const esBE =
    estudiantes[0]?.tipoCalificacion ===
    "BE";

  const fechaPorDescripcion = useMemo(
    () =>
      new Map<
        DescripcionFechaNota,
        FechaProceso
      >(
        fechas
          .filter(
            (fecha) =>
              fecha.descripcion != null,
          )
          .map((fecha) => [
            fecha.descripcion as DescripcionFechaNota,
            fecha,
          ]),
      ),
    [fechas],
  );

  const subActivo =
    mainTab === "q1"
      ? subQ1
      : mainTab === "q2"
        ? subQ2
        : null;

  let descripcionFecha:
    | DescripcionFechaNota
    | null = null;

  if (mainTab === "q1") {
    descripcionFecha =
      subActivo === "p1"
        ? "parcial1_quim1"
        : subActivo === "p2"
          ? "parcial2_quim1"
          : "quimestre1";
  }

  if (mainTab === "q2") {
    descripcionFecha =
      subActivo === "p1"
        ? "parcial1_quim2"
        : subActivo === "p2"
          ? "parcial2_quim2"
          : "quimestre2";
  }

  if (mainTab === "final") {
    descripcionFecha = "nota_final";
  }

  const fechaActual =
    descripcionFecha
      ? fechaPorDescripcion.get(
          descripcionFecha,
        )
      : undefined;

  const esParcial =
    mainTab !== "final" &&
    subActivo !== "quimestre";

  const subtitulo =
    mainTab === "final"
      ? "ACTA DE RESUMEN FINAL"
      : subActivo === "quimestre"
        ? `ACTA DE RESUMEN DEL ${
            mainTab === "q1"
              ? "PRIMER"
              : "SEGUNDO"
          } QUIMESTRE`
        : `ACTA DE CALIFICACIONES ${
            subActivo === "p1"
              ? "PRIMER"
              : "SEGUNDO"
          } PARCIAL - ${
            mainTab === "q1"
              ? "PRIMER"
              : "SEGUNDO"
          } QUIMESTRE`;

  return (
    <div className="space-y-4">
      <h1 className="print:hidden text-center text-2xl font-bold text-[#1265f3] sm:text-3xl">
        Gestión de Calificaciones
      </h1>

      <div className="print:hidden grid grid-cols-3 border-b border-gray-300">
        {[
          ["q1", "QUIMESTRE 1"],
          ["q2", "QUIMESTRE 2"],
          ["final", "NOTA FINAL"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() =>
              setMainTab(
                id as MainTab,
              )
            }
            className={`border-b-2 px-3 py-3 text-sm font-bold text-[#1265f3] transition ${
              mainTab === id
                ? "border-[#1265f3] bg-blue-50"
                : "border-transparent"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mainTab !== "final" && (
        <div className="print:hidden grid grid-cols-3 border-b border-gray-300">
          {[
            [
              "p1",
              `Parcial 1 - Quim ${
                mainTab === "q1"
                  ? "1"
                  : "2"
              }`,
            ],
            [
              "p2",
              `Parcial 2 - Quim ${
                mainTab === "q1"
                  ? "1"
                  : "2"
              }`,
            ],
            [
              "quimestre",
              `Quimestre ${
                mainTab === "q1"
                  ? "1"
                  : "2"
              }`,
            ],
          ].map(([id, label]) => {
            const activo =
              mainTab === "q1"
                ? subQ1
                : subQ2;

            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  if (mainTab === "q1") {
                    setSubQ1(
                      id as SubTab,
                    );
                  } else {
                    setSubQ2(
                      id as SubTab,
                    );
                  }
                }}
                className={`border-b-2 px-3 py-3 text-sm font-semibold text-[#1265f3] transition ${
                  activo === id
                    ? "border-[#1265f3]"
                    : "border-transparent"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mx-auto w-full max-w-[1400px] space-y-0 border border-gray-300 bg-white p-6">
        <EncabezadoActa
          subtitulo={subtitulo}
          materia={materia}
          docente={docente}
          nivel={nivel}
          paralelo={paralelo}
          jornada={jornada}
          periodo={periodo}
        />

        <BandaFecha
          fecha={fechaActual}
        />

        <div className="mt-4">
          {mainTab === "final" ? (
            <TablaFinal
              estudiantes={estudiantes}
            />
          ) : esParcial ? (
            esBE ? (
              <TablaParcialBe
                estudiantes={estudiantes}
                quimestre={mainTab}
                parcial={
                  subActivo as
                    | "p1"
                    | "p2"
                }
              />
            ) : (
              <TablaParcialSuperior
                estudiantes={estudiantes}
                quimestre={mainTab}
                parcial={
                  subActivo as
                    | "p1"
                    | "p2"
                }
              />
            )
          ) : (
            <TablaQuimestre
              estudiantes={estudiantes}
              quimestre={mainTab}
            />
          )}
        </div>
      </div>

      {estudiantes.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          No existen estudiantes inscritos en este curso.
        </div>
      )}
    </div>
  );
}