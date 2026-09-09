"use client";

import { type Representante } from "@/types/Representante";

interface RepresentanteDetailModalProps {
  representante: Representante | null;
  error?: string;
  loading: boolean;
  onClose: () => void;
}

export default function RepresentanteDetailModal({
  representante,
  error,
  loading,
  onClose,
}: RepresentanteDetailModalProps) {
  if (!loading && !representante && !error) return null;

  const rows = representante
    ? [
        ["Cédula", representante.nroCedula],
        ["Nombres", `${representante.primerNombre} ${representante.segundoNombre}`],
        ["Apellidos", `${representante.primerApellido} ${representante.segundoApellido}`],
        ["Celular", representante.celular],
        ["Convencional", representante.convencional || "No registrado"],
        ["Emergencia", representante.emergencia],
        ["Correo", representante.email],
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="mb-5 text-center text-xl font-bold text-gray-800">
          Información del representante
        </h3>
        {loading && <p className="py-8 text-center text-gray-500">Cargando...</p>}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}
        {representante && (
          <dl className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-3 gap-3 px-4 py-3 text-sm">
                <dt className="font-semibold text-gray-600">{label}</dt>
                <dd className="col-span-2 break-words text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={onClose} className="rounded-md bg-gray-200 px-5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
