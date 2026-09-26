"use client";

import { FormEvent, useState, useSyncExternalStore, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import SolicitudModal from "./SolicitudModal";
import { eliminarSolicitud } from "./actions";
import Toast from "@/app/components/ui/Toast";
import { Solicitud } from "@/types/Solicitud";

const DICCIONARIO_DESCRIPCION: Record<string, string> = {
  'parcial1_quim1': 'Parcial 1 - Quimestre 1',
  'parcial2_quim1': 'Parcial 2 - Quimestre 1',
  'quimestre1': 'Quimestre 1',
  'parcial1_quim2': 'Parcial 1 - Quimestre 2',
  'parcial2_quim2': 'Parcial 2 - Quimestre 2',
  'quimestre2': 'Quimestre 2',
  'nota_final': 'Nota Final',
};

interface Props {
  solicitudes: Solicitud[];
  fechaInicio: string;
  fechaFin: string;
}

export default function SolicitudPage({ solicitudes, fechaInicio: fechaInicioInicial, fechaFin: fechaFinInicial }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState("Pendiente");
  const [fechaInicio, setFechaInicio] = useState(fechaInicioInicial);
  const [fechaFin, setFechaFin] = useState(fechaFinInicial);
  const [errorFecha, setErrorFecha] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const buscarPorFecha = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if ((fechaInicio && !fechaFin) || (!fechaInicio && fechaFin)) {
      setErrorFecha("Ingresa una fecha de inicio y una fecha de fin.");
      return;
    }

    if (fechaInicio > fechaFin) {
      setErrorFecha("La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }

    setErrorFecha("");
    const query = new URLSearchParams();
    if (fechaInicio && fechaFin) {
      query.set("fechaInicio", fechaInicio);
      query.set("fechaFin", fechaFin);
    }

    startTransition(() => {
      router.push(query.toString() ? `${pathname}?${query.toString()}` : pathname);
    });
  };

  const formatearFecha = (fechaString: string) => {
    if (!mounted || !fechaString) return "";

    const [fechaParte] = fechaString.split("T");
    const [year, month, day] = fechaParte.split("-").map(Number);

    if (!year || !month || !day) return "";

    const fechaLocal = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("es-EC", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(fechaLocal);
  };

  // Única pasada para calcular conteos y filtrar eficientemente
  const { conteo, solicitudesFiltradas } = solicitudes.reduce(
    (acc, s) => {
      const estado = (s.estado || "Pendiente").toLowerCase();
      
      if (estado === "pendiente") acc.conteo.pendientes++;
      else if (estado === "aceptada") acc.conteo.aceptadas++;
      else if (estado === "rechazada") acc.conteo.rechazadas++;

      if (estado === filtroActivo.toLowerCase()) {
        acc.solicitudesFiltradas.push(s);
      }

      return acc;
    },
    {
      conteo: { pendientes: 0, aceptadas: 0, rechazadas: 0 },
      solicitudesFiltradas: [] as Solicitud[],
    }
  );

  return (
    <div className="w-full max-w-5xl mx-auto font-sans">
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
      <h1 className="text-2xl font-bold text-center text-[#003366] mb-6">
        Gestión de Solicitudes
      </h1>

      <div className="sticky top-0 z-30 w-full bg-gray-50 pb-4 pt-1 shadow-sm">
        <form onSubmit={buscarPorFecha} className="border border-gray-200 rounded-lg bg-white p-4 mb-4">
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              <span className="font-medium">Fecha inicio</span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(event) => setFechaInicio(event.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              <span className="font-medium">Fecha fin</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(event) => setFechaFin(event.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5"
              />
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#2563eb] hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-1.5 rounded font-medium text-sm transition-colors"
            >
              {isPending ? "Buscando..." : "Buscar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFechaInicio("");
                setFechaFin("");
                setErrorFecha("");
                startTransition(() => router.push(pathname));
              }}
              disabled={isPending || (!fechaInicio && !fechaFin)}
              className="text-gray-700 hover:text-gray-900 disabled:opacity-50 px-2 py-1.5 text-sm"
            >
              Limpiar
            </button>
          </div>
          {errorFecha && (
            <p className="text-red-600 text-sm mt-2" role="alert">
              {errorFecha}
            </p>
          )}
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Pestañas de filtrado dinámicas */}
          <div className="flex flex-wrap gap-3 px-2">
            {[
              { key: "Pendiente", label: `Pendientes (${conteo.pendientes})` },
              { key: "Aceptada", label: `Aceptadas (${conteo.aceptadas})` },
              { key: "Rechazada", label: `Rechazadas (${conteo.rechazadas})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFiltroActivo(tab.key)}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filtroActivo === tab.key
                    ? "bg-[#2563eb] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-2 rounded font-medium text-sm flex items-center gap-2"
          >
            <span>+</span> Agregar
          </button>
        </div>
      </div>

      {/* Contenedor de Tarjetas */}
      <div className="border border-gray-200 rounded-lg bg-white min-h-[300px] p-4">
        <div className="flex flex-wrap gap-4">
          {solicitudesFiltradas.length === 0 ? (
            <p className="text-gray-500 w-full text-center mt-10">
              No hay solicitudes en esta categoría.
            </p>
          ) : (
            solicitudesFiltradas.map((s, index) => (
              <div
                key={s.id}
                className={`w-72 border rounded-lg p-4 flex flex-col shadow-sm ${
                  index === 0 ? "border-blue-400" : "border-gray-200"
                }`}
              >
                <h3 className="text-blue-500 text-lg font-semibold mb-3">
                  Admin Sistema
                </h3>
                
                <div className="text-sm text-gray-700 space-y-1.5 mb-6 flex-grow">
                  <p>
                    <span className="font-bold text-gray-900">Fecha:</span>{" "}
                    {formatearFecha(s.fechaSolicitud)}
                  </p>
                  <p>
                    <span className="font-bold text-gray-900">Motivo:</span>{" "}
                    {s.motivo}
                  </p>
                  <p>
                    <span className="font-bold text-gray-900">Parcial solicitado:</span>{" "}
                    {DICCIONARIO_DESCRIPCION[s.descripcion] || s.descripcion}
                  </p>
                </div>

                <button
                  onClick={() => s.id !== undefined && eliminarSolicitud(s.id)}
                  className="w-full bg-[#9ca3af] hover:bg-gray-500 text-white py-1.5 rounded font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <SolicitudModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          setToastMessage("Solicitud creada correctamente.");
          router.refresh();
        }}
      />
    </div>
  );
}