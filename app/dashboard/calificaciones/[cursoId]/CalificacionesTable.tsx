"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AcademicTable, {
  type AcademicColumn,
} from "@/app/components/ui/AcademicTable";
import type {
  DatosCalificacion,
  EstudianteCurso,
  EtapaCalificacion,
} from "@/types/Calificaciones";
import { guardarCalificacion } from "./actions";
export interface CalificacionesTableProps {
  estudiantes: EstudianteCurso[];
  esBE: boolean;
  escalaBE?: "Cualitativa" | "Cuantitativa";
  etapa: EtapaCalificacion;
  habilitada: boolean;
}
const criterios = [
  "Respeto y consideración",
  "Valoración de la diversidad",
  "Normas de convivencia",
  "Cuidado del patrimonio",
  "Respeto a la propiedad ajena",
  "Puntualidad y asistencia",
  "Honestidad",
  "Presentación personal",
  "Participación comunitaria",
  "Responsabilidad",
];
const etiquetas: Record<string, string> = {
  insumo1: "Insumo 1",
  insumo2: "Insumo 2",
  evaluacion: "Evaluación sumativa",
  mejoramiento: "Mejoramiento",
  promedioInsumos: "Promedio insumos",
  ponderacion70: "Ponderación 70%",
  promedioMejora: "Promedio mejora",
  promedioSumativas: "Promedio sumativas",
  ponderacion30: "Ponderación 30%",
  promedioParcial: "Promedio parcial",
  notaParcial: "Nota parcial",
  promedioComportamiento: "Comportamiento",
  valoracionComportamiento: "Valoración",
  parcial1: "Parcial 1",
  parcial2: "Parcial 2",
  promedioParciales: "Promedio parciales",
  examen: "Examen",
  promedioQuimestral: "Promedio quimestral",
  comportamiento: "Comportamiento",
  primerQuimestre: "Quimestre 1",
  segundoQuimestre: "Quimestre 2",
  promedioAnual: "Promedio anual",
  examenRecuperacion: "Examen recuperación",
  promedioFinal: "Promedio final",
  estado: "Estado",
};
function convertirEscala(n: number, escala?: string) {
  if (escala === "Cuantitativa")
    return n >= 9 ? "DA" : n >= 7 ? "AA" : n > 4 ? "PA" : "NA";
  return n >= 9.5
    ? "A+"
    : n >= 9
      ? "A-"
      : n >= 8.5
        ? "B+"
        : n >= 7.5
          ? "B-"
          : n >= 7
            ? "C+"
            : n >= 6.5
              ? "C-"
              : n >= 4
                ? "D+"
                : n >= 3.5
                  ? "D-"
                  : n >= 2
                    ? "E+"
                    : "E-";
}
export default function CalificacionesTable({
  estudiantes,
  esBE,
  escalaBE,
  etapa,
  habilitada,
}: CalificacionesTableProps) {
  const router = useRouter();
  const [editando, setEditando] = useState<EstudianteCurso | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const parcial = etapa.endsWith("P1") || etapa.endsWith("P2");
  const final = etapa === "FINAL";
  const q1 = etapa.startsWith("Q1");
  function detalle(
    row: EstudianteCurso,
  ): Record<string, number | string | null | undefined> {
    const r = row.reporte;
    if (!r) return {};
    const guardada = row.registros?.find((n) => n.etapa === etapa);
    if (final)
      return {
        ...r.final,
        examenRecuperacion: guardada?.notaExamen ?? r.final?.examenRecuperacion,
      };
    if (!parcial) {
      const q = q1 ? r.quimestre1 : r.quimestre2;
      const p = r.detalleParciales[q1 ? "q1" : "q2"];
      return {
        ...q,
        examen: guardada?.notaExamen ?? q?.examen,
        parcial1: q?.parcial1 ?? p.p1?.promedioParcial ?? p.p1?.notaParcial,
        parcial2: q?.parcial2 ?? p.p2?.promedioParcial ?? p.p2?.notaParcial,
      };
    }
    const d =
      r.detalleParciales[q1 ? "q1" : "q2"][etapa.endsWith("P1") ? "p1" : "p2"];
    if (!d) return {};
    const { criteriosComportamiento, ...campos } = d;
    return {
      ...campos,
      ...Object.fromEntries(
        (criteriosComportamiento ?? []).map((v, i) => ["criterio" + i, v]),
      ),
    };
  }
  const campos = final
    ? [
        "primerQuimestre",
        "segundoQuimestre",
        "promedioAnual",
        "comportamiento",
        "valoracionComportamiento",
        "examenRecuperacion",
        "promedioFinal",
        "estado",
      ]
    : parcial
      ? [
          "insumo1",
          "insumo2",
          "promedioInsumos",
          "ponderacion70",
          "evaluacion",
          "mejoramiento",
          "promedioMejora",
          "promedioSumativas",
          "ponderacion30",
          "promedioParcial",
          "notaParcial",
          ...criterios.map((_, i) => "criterio" + i),
          "promedioComportamiento",
          "valoracionComportamiento",
        ]
      : [
          "parcial1",
          "parcial2",
          "promedioParciales",
          "ponderacion70",
          "examen",
          "ponderacion30",
          "promedioQuimestral",
          "comportamiento",
          "valoracionComportamiento",
        ];
  const algunGeneral = estudiantes.some(
    (r) => r.reporte?.tipoCalificacion === "Superior",
  );
  const algunBe =
    estudiantes.some((r) => r.reporte?.tipoCalificacion === "BE") ||
    (!estudiantes.length && esBE);
  const soloBe = [
    "promedioInsumos",
    "mejoramiento",
    "promedioMejora",
    "promedioSumativas",
    "notaParcial",
  ];
  const soloGeneral = [
    "promedioParcial",
    "promedioComportamiento",
    "valoracionComportamiento",
    "comportamiento",
    "promedioAnual",
    "examenRecuperacion",
  ];
  const columnas: AcademicColumn<EstudianteCurso>[] = [
    { key: "nro", header: "Nro", width: "50px", cell: (r) => r.nro },
    {
      key: "estudiante",
      header: "Estudiante",
      width: "220px",
      cell: (r) => (
        <div>
          {r.nombreCompleto}
          <div className="text-xs text-gray-500">
            {r.nivel} ·{" "}
            {r.reporte?.tipoCalificacion === "BE"
              ? "Básico Elemental"
              : "General"}
          </div>
        </div>
      ),
    },
    ...campos
      .filter(
        (k) =>
          (!soloBe.includes(k) || algunBe) &&
          (!(soloGeneral.includes(k) || k.startsWith("criterio")) ||
            algunGeneral),
      )
      .map((k) => ({
        key: k,
        header: k.startsWith("criterio")
          ? criterios[Number(k.slice(8))]
          : etiquetas[k],
        verticalHeader: true,
        cell: (r: EstudianteCurso) => {
          const v = detalle(r)[k];
          return typeof v === "number" ? (
            <span>
              {v.toFixed(2)}
              {escalaBE &&
                r.reporte?.tipoCalificacion === "BE" &&
                ["promedioQuimestral", "notaParcial", "promedioFinal"].includes(
                  k,
                ) && (
                  <small className="block">
                    {convertirEscala(v, escalaBE)}
                  </small>
                )}
            </span>
          ) : (
            (v ?? "—")
          );
        },
      })),
    {
      key: "acciones",
      header: "Acciones",
      cell: (r) => {
        const be = r.reporte?.tipoCalificacion === "BE";
        const anual = r.reporte?.final?.promedioAnual;
        const recuperacion =
          !final || (!be && anual !== undefined && anual >= 4 && anual < 7);
        return habilitada && recuperacion ? (
          <button
            type="button"
            className="rounded border border-blue-600 px-3 py-2 text-blue-700"
            disabled={guardando}
            onClick={() => {
              setEditando(r);
              setError("");
              setMensaje("");
            }}
          >
            {r.registros?.some((n) => n.etapa === etapa)
              ? "Editar"
              : "Registrar"}
          </button>
        ) : (
          <span className="text-xs text-gray-500">
            {!habilitada
              ? "Fuera de fechas"
              : be
                ? "Resumen calculado"
                : "Sin recuperación"}
          </span>
        );
      },
    },
  ];
  const registro = editando?.registros?.find((r) => r.etapa === etapa);
  const be = editando?.reporte?.tipoCalificacion === "BE";
  async function guardar(form: HTMLFormElement) {
    if (!editando) return;
    setGuardando(true);
    setError("");
    try {
      const data = new FormData(form);
      const numero = (k: string) => {
        const v = data.get(k);
        return v === null || v === "" ? null : Number(v);
      };
      const datos: DatosCalificacion = {
        insumo1: parcial ? numero("insumo1") : null,
        insumo2: parcial ? numero("insumo2") : null,
        evaluacion: parcial ? numero("evaluacion") : null,
        mejoramiento: parcial && be ? numero("mejoramiento") : null,
        comportamiento:
          parcial && !be
            ? criterios.map((_, i) => Number(data.get("criterio" + i)))
            : null,
        notaExamen: !parcial ? numero("notaExamen") : null,
      };
      const result = await guardarCalificacion(
        editando.idInscripcion,
        etapa,
        datos,
      );
      if (!result.success) {
        setError(result.error ?? "No se pudo guardar");
        return;
      }
      setEditando(null);
      setMensaje("Calificación guardada.");
      router.refresh();
    } catch {
      setError(
        "No se pudo guardar. Compruebe la conexión y vuelva a intentarlo.",
      );
    } finally {
      setGuardando(false);
    }
  }
  return (
    <div className="space-y-3">
      {!habilitada && (
        <p className="text-sm text-gray-600">
          Puede consultar las notas. El registro y la edición están fuera de las
          fechas habilitadas.
        </p>
      )}
      {mensaje && (
        <p role="status" className="text-green-700">
          {mensaje}
        </p>
      )}
      <AcademicTable
        rows={estudiantes}
        columns={columnas}
        getRowKey={(r) => r.idInscripcion}
      />
      {!estudiantes.length && (
        <p className="p-4 text-center text-gray-500">
          No hay estudiantes inscritos en este curso.
        </p>
      )}
      {editando && (
        <form
          key={editando.idInscripcion + etapa}
          onSubmit={(e) => {
            e.preventDefault();
            void guardar(e.currentTarget);
          }}
          className="rounded border border-blue-200 bg-white p-4"
          aria-label={"Calificaciones de " + editando.nombreCompleto}
        >
          <h4 className="mb-4 font-semibold">
            {editando.nombreCompleto} ·{" "}
            {parcial
              ? "Notas del parcial"
              : final
                ? "Examen de recuperación"
                : "Examen quimestral"}
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(parcial
              ? [
                  "insumo1",
                  "insumo2",
                  "evaluacion",
                  ...(be ? ["mejoramiento"] : []),
                ]
              : ["notaExamen"]
            ).map((k) => (
              <label key={k} className="text-sm">
                {etiquetas[k] ?? (final ? "Examen de recuperación" : "Examen")}
                <input
                  name={k}
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  required={k !== "mejoramiento"}
                  disabled={guardando}
                  defaultValue={registro?.[k as "insumo1"] ?? ""}
                  className="mt-1 block w-full rounded border p-2"
                />
              </label>
            ))}
            {parcial &&
              !be &&
              criterios.map((label, i) => (
                <label key={label} className="text-sm">
                  {label}
                  <select
                    name={"criterio" + i}
                    required
                    disabled={guardando}
                    defaultValue={registro?.comportamiento?.[i] ?? ""}
                    className="mt-1 block w-full rounded border p-2"
                  >
                    <option value="" disabled>
                      Seleccione
                    </option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                  </select>
                </label>
              ))}
          </div>
          {error && (
            <p role="alert" className="mt-3 text-red-700">
              {error}
            </p>
          )}
          <div className="mt-4 flex gap-3">
            <button
              disabled={guardando}
              className="rounded bg-[#00408a] px-4 py-2 text-white"
            >
              {guardando ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              disabled={guardando}
              onClick={() => setEditando(null)}
              className="rounded border px-4 py-2"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
