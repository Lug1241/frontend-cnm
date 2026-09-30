import React from "react";

interface Props {
  mensaje?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export default function AlertaPeriodoInactivo({
  mensaje,
  fechaInicio,
  fechaFin,
}: Props) {
  const formatearFecha = (fechaIso?: string) => {
    if (!fechaIso) return "";
    // Asegurar formato DD/MM/YYYY sin desfases de zona horaria
    const limpia = fechaIso.split("T")[0];
    const partes = limpia.split("-");
    if (partes.length === 3) {
      const [year, month, day] = partes;
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }
    return fechaIso;
  };

  return (
    <div
      role="alert"
      className="rounded-xl border border-[#dc3545] bg-[#f8d7da] p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dc3545] text-base font-bold text-white shadow-sm"
          aria-hidden="true"
        >
          !
        </span>
        <h3 className="text-lg font-bold text-[#721c24] sm:text-xl">
          Matrícula no disponible
        </h3>
      </div>

      <div className="mt-3 space-y-3 pl-10 text-[#721c24]">
        <p className="text-sm font-medium sm:text-base">
          {mensaje || "El período de matrícula no está activo actualmente."}
        </p>

        {fechaInicio && fechaFin && (
          <div className="rounded-md border-l-4 border-[#dc3545] bg-[#dc3545]/10 px-4 py-2.5 text-sm">
            <span className="font-bold">Período de matrícula:</span>{" "}
            <span>
              {formatearFecha(fechaInicio)} - {formatearFecha(fechaFin)}
            </span>
          </div>
        )}

        <p className="text-xs italic text-[#721c24]/90 sm:text-sm">
          Para realizar matrículas, contacte con la administración del conservatorio.
        </p>
      </div>
    </div>
  );
}

