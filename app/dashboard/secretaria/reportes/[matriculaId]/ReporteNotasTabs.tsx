"use client";

import { useState } from "react";

import type { CursoReporte } from "@/types/ReporteCalificaciones";

type Tab = "q1" | "q2" | "final";

function formatNota(value?: number | null) {
  return typeof value === "number" ? value.toFixed(2) : "—";
}

function obtenerCualitativa(value?: number | null) {
  if (typeof value !== "number") return "—";
  if (value >= 9) return "Domina los aprendizajes requeridos";
  if (value >= 7) return "Alcanza los aprendizajes requeridos";
  if (value > 4) return "Está próximo a alcanzar los aprendizajes requeridos";
  return "No alcanza los aprendizajes requeridos";
}

export default function ReporteNotasTabs({
  cursos,
}: {
  cursos: CursoReporte[];
}) {
  const [tab, setTab] = useState<Tab>("q1");

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "q1", label: "Quimestre 1" },
    { id: "q2", label: "Quimestre 2" },
    { id: "final", label: "Reporte Final" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 print:hidden">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              tab === item.id
                ? "bg-[#00408a] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {item.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => window.print()}
          className="ml-auto rounded-md border border-[#00408a] px-4 py-2 text-sm font-semibold text-[#00408a] hover:bg-blue-50"
        >
          Imprimir
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-sm">
          <thead className="bg-[#00408a] text-white">
            <tr>
              <th className="px-4 py-3 text-left">Asignatura</th>
              <th className="px-4 py-3 text-left">Docente</th>
              <th className="px-4 py-3 text-center">
                {tab === "q1"
                  ? "Promedio Q1"
                  : tab === "q2"
                    ? "Promedio Q2"
                    : "Promedio Final"}
              </th>
              <th className="px-4 py-3 text-left">
                {tab === "final" ? "Calificación / Estado" : "Calificación cualitativa"}
              </th>
            </tr>
          </thead>

          <tbody>
            {cursos.map((curso) => {
              const quimestre =
                tab === "q1"
                  ? curso.quimestre1
                  : tab === "q2"
                    ? curso.quimestre2
                    : null;

              const nota =
                tab === "final"
                  ? curso.final?.promedioFinal
                  : quimestre?.promedioQuimestral;

              const resultado =
                tab === "final"
                  ? curso.tipoCalificacion === "BE"
                    ? obtenerCualitativa(curso.final?.promedioFinal)
                    : curso.final?.estado ?? "—"
                  : obtenerCualitativa(quimestre?.promedioQuimestral);

              return (
                <tr
                  key={curso.idInscripcion}
                  className="border-t border-gray-200"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {curso.asignatura}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {curso.docente?.nombreCompleto || "—"}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-800">
                    {formatNota(nota)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{resultado}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {cursos.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          No existen asignaturas con inscripciones para esta matrícula.
        </div>
      )}
    </div>
  );
}
