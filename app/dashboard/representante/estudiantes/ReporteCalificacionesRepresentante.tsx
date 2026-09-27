"use client";

import { useState } from "react";
import { MdOutlinePictureAsPdf } from "react-icons/md";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type { CursoReporte } from "@/types/ReporteCalificaciones";

type Tab = "q1" | "q2" | "final";

interface FilaReporte {
  asignatura: string;
  nota: number;
  equivalencia: string;
  promedio?: boolean;
  reprobada?: boolean;
}

function equivalencia(nota: number) {
  if (nota >= 9) return "Domina los aprendizajes requeridos";
  if (nota >= 7) return "Alcanza los aprendizajes requeridos";
  if (nota > 4) return "Está próximo a alcanzar los aprendizajes requeridos";
  return "No alcanza los aprendizajes requeridos";
}

function notaCurso(curso: CursoReporte, tab: Tab) {
  if (tab === "q1") return curso.quimestre1?.promedioQuimestral ?? null;
  if (tab === "q2") return curso.quimestre2?.promedioQuimestral ?? null;
  return curso.final?.promedioFinal ?? null;
}

function filasReporte(cursos: CursoReporte[], tab: Tab): FilaReporte[] {
  const filas = cursos.map((curso) => {
    const nota = notaCurso(curso, tab);
    return {
      asignatura: curso.asignatura,
      nota: nota ?? 0,
      equivalencia: nota === null ? "Sin calificación" : equivalencia(nota),
      reprobada: tab === "final" && nota !== null && nota < 7,
    };
  });
  const notasRegistradas = cursos
    .map((curso) => notaCurso(curso, tab))
    .filter((nota): nota is number => typeof nota === "number");
  const promedio =
    notasRegistradas.length > 0
      ? notasRegistradas.reduce((total, nota) => total + nota, 0) /
        notasRegistradas.length
      : 0;

  return [
    ...filas,
    {
      asignatura: "Promedio",
      nota: promedio,
      equivalencia: equivalencia(promedio),
      promedio: true,
      reprobada: tab === "final" && promedio < 7,
    },
  ];
}

function cargarImagen(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export default function ReporteCalificacionesRepresentante({
  cursos,
  estudiante,
  primerNombre,
  primerApellido,
  nivel,
  periodo,
}: {
  cursos: CursoReporte[];
  estudiante: string;
  primerNombre: string;
  primerApellido: string;
  nivel: string;
  periodo: string;
}) {
  const [tab, setTab] = useState<Tab>("q1");
  const [exportando, setExportando] = useState(false);
  const [errorPdf, setErrorPdf] = useState("");
  const filas = filasReporte(cursos, tab);

  const exportarPdf = async () => {
    setExportando(true);
    setErrorPdf("");

    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const logo = await cargarImagen("/ConservatorioNacional.png");

      doc.addImage(logo, "PNG", pageWidth / 2 - 13, 7, 26, 31);
      doc.setTextColor(45, 45, 45);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        "Fundado por Decreto Ejecutivo de 26 de abril de 1900 del General Eloy Alfaro",
        pageWidth / 2,
        46,
        { align: "center" },
      );
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text("REPORTE DE CALIFICACIONES", pageWidth / 2, 62, {
        align: "center",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.text(periodo, pageWidth / 2, 74, { align: "center" });
      doc.setFontSize(11);
      doc.text(`Estudiante: ${estudiante}`, 20, 92);
      doc.text(`Nivel: ${nivel}`, 20, 104);
      doc.text(
        `Fecha de generación: ${new Date().toLocaleDateString("es-EC")}`,
        20,
        116,
      );

      let y = 135;
      const secciones: Array<{ tab: Tab; titulo: string }> = [
        { tab: "q1", titulo: "QUIMESTRE 1" },
        { tab: "q2", titulo: "QUIMESTRE 2" },
        { tab: "final", titulo: "NOTA FINAL" },
      ];

      for (const seccion of secciones) {
        if (y > pageHeight - 85) {
          doc.addPage();
          y = 20;
        }

        doc.setFillColor(0, 75, 145);
        doc.rect(20, y, pageWidth - 40, 10, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(seccion.titulo, pageWidth / 2, y + 7, { align: "center" });

        const datos = filasReporte(cursos, seccion.tab);
        autoTable(doc, {
          head: [["Asignatura", "Nota", "Equivalencia"]],
          body: datos.map((fila) => [
            fila.asignatura,
            fila.nota.toFixed(2),
            fila.equivalencia,
          ]),
          startY: y + 15,
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: [45, 45, 45],
            lineColor: [195, 195, 195],
            lineWidth: 0.35,
          },
          headStyles: {
            fillColor: [0, 75, 145],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: [248, 249, 250] },
          didParseCell: (data) => {
            if (data.section !== "body") return;
            const fila = datos[data.row.index];
            if (fila.promedio) {
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.fillColor = [230, 230, 230];
            } else if (fila.reprobada) {
              data.cell.styles.fillColor = [252, 215, 215];
              data.cell.styles.textColor = [114, 28, 36];
            } else if (seccion.tab !== "final" && fila.nota < 7) {
              data.cell.styles.fillColor = [255, 243, 205];
              data.cell.styles.textColor = [133, 100, 4];
            }
          },
        });

        y = (
          doc as jsPDF & { lastAutoTable: { finalY: number } }
        ).lastAutoTable.finalY + 10;
      }

      if (y > pageHeight - 35) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(45, 45, 45);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Leyenda:", 20, y + 5);
      doc.text(
        "- Amarillo: Calificaciones menores a 7.00 en quimestres",
        20,
        y + 13,
      );
      doc.text(
        "- Rojo: Materias reprobadas (nota final menor a 7.00)",
        20,
        y + 21,
      );

      const fecha = new Date().toLocaleDateString("es-EC").replaceAll("/", "-");
      doc.save(
        `Calificaciones_${primerNombre}_${primerApellido}_${fecha}.pdf`,
      );
    } catch {
      setErrorPdf("No se pudo generar el PDF de calificaciones.");
    } finally {
      setExportando(false);
    }
  };

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "q1", label: "QUIMESTRE 1" },
    { id: "q2", label: "QUIMESTRE 2" },
    { id: "final", label: "NOTA FINAL" },
  ];

  return (
    <section className="rounded-xl bg-gray-50 px-5 py-8 sm:px-12 sm:py-14">
      <h2 className="text-center text-3xl font-bold text-blue-600 sm:text-4xl">
        Reporte de Calificaciones
      </h2>
      <p className="mt-6 text-center text-2xl text-gray-900 sm:text-3xl">
        {periodo}
      </p>

      <div className="mt-8 flex items-start justify-between gap-4">
        <div className="text-base text-gray-900">
          <p>
            <strong>Estudiante:</strong> {estudiante}
          </p>
          <p>
            <strong>Nivel:</strong> {nivel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void exportarPdf()}
          disabled={exportando}
          title="Exportar a PDF"
          aria-label="Exportar a PDF"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
        >
          <MdOutlinePictureAsPdf className="h-6 w-6" aria-hidden />
        </button>
      </div>

      {errorPdf && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {errorPdf}
        </p>
      )}

      <div className="mt-9 grid grid-cols-3 border-b border-gray-300">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`border-b-2 px-2 py-3 text-sm font-bold text-blue-600 sm:text-base ${
              tab === item.id ? "border-blue-500" : "border-transparent"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-gray-300 bg-white p-5">
        <table className="w-full min-w-[620px] border-collapse text-base">
          <thead>
            <tr>
              <th className="border border-gray-300 px-3 py-3 text-left">
                Asignatura
              </th>
              <th className="w-36 border border-gray-300 px-3 py-3 text-left">
                Nota
              </th>
              <th className="border border-gray-300 px-3 py-3 text-left">
                Equivalencia
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, index) => (
              <tr
                key={`${fila.asignatura}-${index}`}
                className={`${
                  fila.promedio
                    ? "font-medium"
                    : fila.reprobada
                      ? "bg-red-100 text-red-900"
                      : tab !== "final" && fila.nota < 7
                        ? "bg-amber-100"
                        : index % 2 === 0
                          ? "bg-gray-100"
                          : "bg-white"
                }`}
              >
                <td className="border border-gray-300 px-3 py-3">
                  {fila.asignatura}
                </td>
                <td className="border border-gray-300 px-3 py-3">
                  {fila.nota.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-3 py-3">
                  {fila.equivalencia}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
