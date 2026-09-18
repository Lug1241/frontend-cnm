"use client";

import { useEffect, useState, useTransition } from "react";
import { crearSolicitud } from "./actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DESCRIPCIONES = [
  ["parcial1_quim1", "Parcial 1 - Quimestre 1"],
  ["parcial2_quim1", "Parcial 2 - Quimestre 1"],
  ["quimestre1", "Quimestre 1"],
  ["parcial1_quim2", "Parcial 1 - Quimestre 2"],
  ["parcial2_quim2", "Parcial 2 - Quimestre 2"],
  ["quimestre2", "Quimestre 2"],
  ["nota_final", "Nota Final"],
] as const;

export default function SolicitudModal({ isOpen, onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [motivo, setMotivo] = useState("");
  const [showImportance, setShowImportance] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  
  useEffect(() => {
    if(isOpen) {
      setMotivo("");
      setDescripcion("");
      setErrorMsg(null);
      setShowImportance(true);
      setShowConfirmation(false);
      setPendingFormData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPendingFormData(new FormData(e.currentTarget as HTMLFormElement));
    setShowConfirmation(true);
  };

  const confirmarSolicitud = () => {
    if (!pendingFormData) return;

    startTransition(async () => {
      const result = await crearSolicitud(pendingFormData);
      if (result.success) {
        onSuccess();
        onClose();
        return;
      }

      setShowConfirmation(false);
      setErrorMsg(result.error ?? "Error al crear la solicitud.");
    });
  };

  const cerrar = () => {
    if (isPending) return;
    setErrorMsg(null);
    setShowConfirmation(false);
    setPendingFormData(null);
    setShowImportance(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-[#00408a] mb-5">
          Crear solicitud
        </h2>

        {errorMsg && (
          <p className="text-red-500 mb-3 text-sm" role="alert">
            {errorMsg}
          </p>
        )}

        {showImportance ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-bold">Aviso importante</p>
              <p className="mt-2">
                Recuerda enviar la justificación de tu solicitud al correo institucional correspondiente.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrar}
                className="px-5 py-2 bg-[#dc3545] hover:bg-[#b02a37] text-white rounded text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setShowImportance(false)}
                className="px-5 py-2 bg-[#007bff] hover:bg-[#0056b3] text-white rounded text-sm font-medium"
              >
                Continuar
              </button>
            </div>
          </div>
        ) : showConfirmation ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-bold">¿Confirmar solicitud?</p>
              <p className="mt-2">
                Verifica que la información sea correcta antes de enviarla.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={isPending}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium disabled:opacity-50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={confirmarSolicitud}
                disabled={isPending}
                className="px-5 py-2 bg-[#007bff] hover:bg-[#0056b3] text-white rounded text-sm font-medium disabled:opacity-50"
              >
                {isPending ? "Enviando..." : "Sí, enviar"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Distribución en 2 columnas idéntica al diseño legacy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccione qué desea editar
                </label>
                <select
                  required
                  name="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                >
                  <option value="">-- Seleccione una opción --</option>
                  {DESCRIPCIONES.map(([valor, etiqueta]) => (
                    <option key={valor} value={valor}>
                      {etiqueta}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingrese el motivo
                </label>
                <input
                  required
                  minLength={2}
                  maxLength={50}
                  name="motivo"
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>
            </div>

            {/* Botones de acción alineados a la derecha */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 bg-[#007bff] hover:bg-[#0056b3] text-white rounded text-sm font-medium transition-colors"
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={cerrar}
                disabled={isPending}
                className="px-5 py-2 bg-[#dc3545] hover:bg-[#b02a37] text-white rounded text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}