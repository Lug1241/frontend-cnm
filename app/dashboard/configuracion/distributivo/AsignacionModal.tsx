"use client";

import { useState, useEffect, useTransition } from "react";
import { type Asignacion } from "@/types/Asignacion";

interface AsignacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  asignacionToEdit: Asignacion | null;
  currentPeriodo: string;
  docentesList: {id: number, primerNombre: string, primerApellido: string}[],
  materiasList: {id: number, nombre: string, nivel: string}[],
  onSaveAction: (id: number | null, formData: any) => Promise<{ success: boolean; error?: string }>;
}

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function AsignacionModal({
  isOpen,
  onClose,
  asignacionToEdit,
  currentPeriodo,
  docentesList,
  materiasList,
  onSaveAction,
}: AsignacionModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  // Estado del formulario
  const [formData, setFormData] = useState({
    paralelo: "",
    horaInicio: "",
    horaFin: "",
    cupos: 1,
    dias: [] as string[],
    ID_docente: "",
    ID_materia: "",
    ID_periodo_academico: "",
  });

  // Efecto para cargar los datos cuando se abre en modo edición
  useEffect(() => {
    if (isOpen && asignacionToEdit) {
      setFormData({
        paralelo: asignacionToEdit.paralelo || "",
        horaInicio: asignacionToEdit.horaInicio || "",
        horaFin: asignacionToEdit.horaFin || "",
        cupos: asignacionToEdit.cupos || 1,
        dias: asignacionToEdit.dias || [],
        ID_docente: asignacionToEdit.docente?.id?.toString() || "",
        ID_materia: asignacionToEdit.materia?.id?.toString() || "",
        ID_periodo_academico: asignacionToEdit.periodoAcademico?.id?.toString() || currentPeriodo,
      });
    } else {
      setFormData({
        paralelo: "",
        horaInicio: "",
        horaFin: "",
        cupos: 1,
        dias: [],
        ID_docente: "",
        ID_materia: "",
        ID_periodo_academico: currentPeriodo,
      });
    }
    setErrorMsg("");
  }, [isOpen, asignacionToEdit, currentPeriodo]);

  if (!isOpen) return null;

  const handleCheckboxChange = (dia: string) => {
    setFormData((prev) => {
      if (prev.dias.includes(dia)) {
        return { ...prev, dias: prev.dias.filter((d) => d !== dia) };
      } else {
        return { ...prev, dias: [...prev.dias, dia] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.dias.length === 0) {
      setErrorMsg("Debe seleccionar al menos un día.");
      return;
    }

    startTransition(async () => {
      const result = await onSaveAction(
        asignacionToEdit?.id ?? null,
        formData
      );

      if (result.success) {
        onClose();
      } else {
        setErrorMsg(result.error || "Ocurrió un error inesperado.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="flex w-full justify-center text-center text-xl font-bold mb-4">
          {asignacionToEdit ? "Editar Asignación" : "Nueva Asignación"}
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fila 1: Paralelo y Cupos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paralelo</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded p-2"
                value={formData.paralelo}
                onChange={(e) => setFormData({ ...formData, paralelo: e.target.value })}
                placeholder="Ej. A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cupos</label>
              <input
                type="number"
                required
                min="1"
                className="w-full border border-gray-300 rounded p-2"
                value={formData.cupos}
                onChange={(e) => setFormData({ ...formData, cupos: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          {/* Fila 2: Horarios */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
              <input
                type="time"
                required
                className="w-full border border-gray-300 rounded p-2"
                value={formData.horaInicio}
                onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
              <input
                type="time"
                required
                className="w-full border border-gray-300 rounded p-2"
                value={formData.horaFin}
                onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
              />
            </div>
          </div>

          {/* Días de la semana */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Días</label>
            <div className="flex flex-wrap gap-3">
              {DIAS_SEMANA.map((dia) => (
                <label key={dia} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.dias.includes(dia)}
                    onChange={() => handleCheckboxChange(dia)}
                    className="rounded border-gray-300"
                  />
                  <span>{dia}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Relaciones */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Docente</label>
              <select
                required
                className="w-full border border-gray-300 rounded p-2 bg-white"
                value={formData.ID_docente}
                onChange={(e) => setFormData({ ...formData, ID_docente: e.target.value })}
              >
                <option value="">Seleccione un docente...</option>
                {Array.isArray(docentesList) && docentesList.map((docente) => (
                  <option key={docente.id} value={docente.id}>
                    {docente.primerNombre} {docente.primerApellido}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
              <select
                required
                className="w-full border border-gray-300 rounded p-2 bg-white"
                value={formData.ID_materia}
                onChange={(e) => setFormData({ ...formData, ID_materia: e.target.value })}
              >
                <option value="">Seleccione una materia...</option>
                {Array.isArray(materiasList) && materiasList.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.nombre} ({materia.nivel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}