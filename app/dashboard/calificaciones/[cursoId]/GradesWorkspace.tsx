"use client";

import { useMemo, useState } from "react";

import type { EstudianteCurso } from "@/types/Calificaciones";
import type {
  FechaProceso,
  DescripcionFechaNota,
} from "@/types/FechaProceso";

import PartialGradesTable from "./PartialGradesTable";
import QuimestralGradesTable from "./QuimestralGradesTable";
import FinalGradesTable from "./FinalGradesTable";

interface Props {
  estudiantes: EstudianteCurso[];
  esBE: boolean;
  fechasNotas: FechaProceso[];
}

type MainTab =
  | "quimestre1"
  | "quimestre2"
  | "nota_final";

type Quimestre1Tab =
  | "parcial1_quim1"
  | "parcial2_quim1"
  | "quimestre1";

type Quimestre2Tab =
  | "parcial1_quim2"
  | "parcial2_quim2"
  | "quimestre2";

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split("-");

  if (!anio || !mes || !dia) {
    return fecha;
  }

  return `${dia}/${mes}/${anio}`;
}

function obtenerSubtitulo(
  descripcion: DescripcionFechaNota,
  esBE: boolean,
) {
  const subtitulosSuperior: Record<
    DescripcionFechaNota,
    string
  > = {
    parcial1_quim1:
      "ACTA DE CALIFICACIONES PRIMER PARCIAL - PRIMER QUIMESTRE",
    parcial2_quim1:
      "ACTA DE CALIFICACIONES SEGUNDO PARCIAL - PRIMER QUIMESTRE",
    quimestre1:
      "ACTA DE RESUMEN DEL PRIMER QUIMESTRE",
    parcial1_quim2:
      "ACTA DE CALIFICACIONES PRIMER PARCIAL - SEGUNDO QUIMESTRE",
    parcial2_quim2:
      "ACTA DE CALIFICACIONES SEGUNDO PARCIAL - SEGUNDO QUIMESTRE",
    quimestre2:
      "ACTA DE RESUMEN DEL SEGUNDO QUIMESTRE",
    nota_final:
      "ACTA DE RESUMEN FINAL",
  };

  const subtitulosBE: Record<
    DescripcionFechaNota,
    string
  > = {
    parcial1_quim1:
      "NOTA DEL PRIMER PARCIAL - PRIMER QUIMESTRE",
    parcial2_quim1:
      "NOTA DEL SEGUNDO PARCIAL - PRIMER QUIMESTRE",
    quimestre1:
      "INFORME DE RENDIMIENTO ACADÉMICO QUIMESTRE 1",
    parcial1_quim2:
      "NOTA DEL PRIMER PARCIAL - SEGUNDO QUIMESTRE",
    parcial2_quim2:
      "NOTA DEL SEGUNDO PARCIAL - SEGUNDO QUIMESTRE",
    quimestre2:
      "INFORME DE RENDIMIENTO ACADÉMICO QUIMESTRE 2",
    nota_final:
      "ACTA DE CALIFICACIONES - FINAL BE",
  };

  return esBE
    ? subtitulosBE[descripcion]
    : subtitulosSuperior[descripcion];
}

export default function GradesWorkspace({
  estudiantes,
  esBE,
  fechasNotas,
}: Props) {
  const [escalaBE, setEscalaBE] =
    useState<"Cualitativa" | "Cuantitativa">(
      "Cualitativa",
    );

  const [mainTab, setMainTab] =
    useState<MainTab>("quimestre1");

  const [quimestre1Tab, setQuimestre1Tab] =
    useState<Quimestre1Tab>("parcial1_quim1");

  const [quimestre2Tab, setQuimestre2Tab] =
    useState<Quimestre2Tab>("parcial1_quim2");

  const descripcionActiva: DescripcionFechaNota =
    mainTab === "quimestre1"
      ? quimestre1Tab
      : mainTab === "quimestre2"
        ? quimestre2Tab
        : "nota_final";

  const fechaActiva = useMemo(
    () =>
      fechasNotas.find(
        (fecha) =>
          fecha.descripcion === descripcionActiva,
      ),
    [descripcionActiva, fechasNotas],
  );

  const subtitulo = obtenerSubtitulo(
    descripcionActiva,
    esBE,
  );

  return (
    <div className="space-y-4">
      <h3 className="text-center font-semibold">
        {subtitulo}
      </h3>

      {esBE && (
        <div className="flex justify-end">
          <label className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700">
              Escala:
            </span>

            <select
              value={escalaBE}
              onChange={(event) =>
                setEscalaBE(
                  event.target.value as
                    | "Cualitativa"
                    | "Cuantitativa",
                )
              }
              className="rounded-md border border-gray-300 bg-white px-3 py-2"
            >
              <option value="Cualitativa">Cualitativa</option>
              <option value="Cuantitativa">Cuantitativa</option>
            </select>
          </label>
        </div>
      )}

      <div className="grid grid-cols-3 border-b border-gray-300">
        <button
          type="button"
          onClick={() => setMainTab("quimestre1")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold ${
            mainTab === "quimestre1"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600"
          }`}
        >
          QUIMESTRE 1
        </button>

        <button
          type="button"
          onClick={() => setMainTab("quimestre2")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold ${
            mainTab === "quimestre2"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600"
          }`}
        >
          QUIMESTRE 2
        </button>

        <button
          type="button"
          onClick={() => setMainTab("nota_final")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold ${
            mainTab === "nota_final"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600"
          }`}
        >
          NOTA FINAL
        </button>
      </div>

      {mainTab === "quimestre1" && (
        <div className="grid grid-cols-3 border-b border-gray-300">
          {[
            ["parcial1_quim1", "Parcial 1 - Quim 1"],
            ["parcial2_quim1", "Parcial 2 - Quim 1"],
            ["quimestre1", "Quimestre 1"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setQuimestre1Tab(
                  key as Quimestre1Tab,
                )
              }
              className={`border-b-2 px-4 py-3 text-sm font-medium ${
                quimestre1Tab === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {mainTab === "quimestre2" && (
        <div className="grid grid-cols-3 border-b border-gray-300">
          {[
            ["parcial1_quim2", "Parcial 1 - Quim 2"],
            ["parcial2_quim2", "Parcial 2 - Quim 2"],
            ["quimestre2", "Quimestre 2"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setQuimestre2Tab(
                  key as Quimestre2Tab,
                )
              }
              className={`border-b-2 px-4 py-3 text-sm font-medium ${
                quimestre2Tab === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {fechaActiva ? (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-center text-sm text-yellow-800">
          Disponible del{" "}
          {formatearFecha(fechaActiva.fechaInicio)} al{" "}
          {formatearFecha(fechaActiva.fechaFin)}
        </div>
      ) : (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
          Fechas no definidas
        </div>
      )}

      {descripcionActiva.startsWith("parcial") && (
        <PartialGradesTable
          estudiantes={estudiantes}
          esBE={esBE}
        />
      )}

      {descripcionActiva === "quimestre1" && (
        <QuimestralGradesTable
          estudiantes={estudiantes}
          esBE={esBE}
          escalaBE={escalaBE}
        />
      )}

      {descripcionActiva === "quimestre2" && (
        <QuimestralGradesTable
          estudiantes={estudiantes}
          esBE={esBE}
          escalaBE={escalaBE}
        />
      )}

      {descripcionActiva === "nota_final" && (
        <FinalGradesTable
          estudiantes={estudiantes}
          esBE={esBE}
        />
      )}
    </div>
  );
}