"use client";

import { useState } from "react";

import type {
  FilaCalificacionAdministracion,
} from "@/types/AdministracionEscolar";

type Tab = "q1" | "q2" | "final";

function nota(value?: number | null) {
  return typeof value === "number"
    ? value.toFixed(2)
    : "";
}

function cualitativa(
  value?: number | null,
) {
  if (typeof value !== "number") {
    return "";
  }

  if (value >= 9) {
    return "Domina los aprendizajes requeridos";
  }

  if (value >= 7) {
    return "Alcanza los aprendizajes requeridos";
  }

  if (value > 4) {
    return "Está próximo a alcanzar los aprendizajes requeridos";
  }

  return "No alcanza los aprendizajes requeridos";
}

export default function CalificacionesTabs({
  estudiantes,
}: {
  estudiantes: FilaCalificacionAdministracion[];
}) {
  const [tab, setTab] =
    useState<Tab>("q1");

  const tabs: Array<{
    id: Tab;
    label: string;
  }> = [
    {
      id: "q1",
      label: "Quimestre 1",
    },
    {
      id: "q2",
      label: "Quimestre 2",
    },
    {
      id: "final",
      label: "Reporte Final",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="print:hidden flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              setTab(item.id)
            }
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              tab === item.id
                ? "bg-[#00408a] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-[#dbeafe] text-[#003b75]">
            <tr>
              <th className="w-16 border border-gray-300 px-4 py-3 text-center">
                No.
              </th>

              <th className="border border-gray-300 px-4 py-3 text-left">
                Nómina de Estudiantes
              </th>

              <th className="w-44 border border-gray-300 px-4 py-3 text-left">
                Nivel
              </th>

              <th className="w-40 border border-gray-300 px-4 py-3 text-center">
                {tab === "q1"
                  ? "Promedio Q1"
                  : tab === "q2"
                    ? "Promedio Q2"
                    : "Promedio Final"}
              </th>

              <th className="w-[320px] border border-gray-300 px-4 py-3 text-left">
                {tab === "final"
                  ? "Estado / Calificación"
                  : "Calificación Cualitativa"}
              </th>
            </tr>
          </thead>

          <tbody>
            {estudiantes.map(
              (estudiante, index) => {
                const quimestre =
                  tab === "q1"
                    ? estudiante.quimestre1
                    : tab === "q2"
                      ? estudiante.quimestre2
                      : null;

                const promedio =
                  tab === "final"
                    ? estudiante.final
                        ?.promedioFinal
                    : quimestre
                        ?.promedioQuimestral;

                const resultado =
                  tab === "final"
                    ? estudiante.tipoCalificacion ===
                      "BE"
                      ? cualitativa(
                          estudiante.final
                            ?.promedioFinal,
                        )
                      : estudiante.final
                          ?.estado ?? ""
                    : cualitativa(
                        quimestre
                          ?.promedioQuimestral,
                      );

                return (
                  <tr
                    key={
                      estudiante.idInscripcion
                    }
                  >
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      {index + 1}
                    </td>

                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">
                      {
                        estudiante.nombreCompleto
                      }
                    </td>

                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      {estudiante.nivel ?? ""}
                    </td>

                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold">
                      {nota(promedio)}
                    </td>

                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      {resultado}
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>

      {estudiantes.length === 0 && (
        <div className="rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-500">
          No existen estudiantes inscritos en este curso.
        </div>
      )}
    </div>
  );
}