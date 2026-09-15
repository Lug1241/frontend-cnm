"use client";

import { useState, useEffect, useTransition } from "react";
import { type Asignacion } from "@/types/Asignacion"
import AutoCompleteInput from "@/app/components/ui/AutoCompleteInput";

interface AsignacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  asignacionToEdit: Asignacion | null;
  currentPeriodo: string;
  docentesList: {id: number, primerNombre: string, primerApellido: string}[],
  materiasList: {id: number, nombre: string, nivel: string}[],
  onSaveAction: (id: number | null, formData: any) => Promise<{ success: boolean; error?: string }>;
}

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const HORAS = Array.from({ length: 13 }, (_: any, i: number) => String(i + 7).padStart(2, '0'));
const MINUTOS = ['00', '15', '30', '45'];

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
    cupos: 1,
    dia1: "",
    dia2: "",
    horaInicioH: "07",
    horaInicioM: "00",
    horaFinH: "07",
    horaFinM: "00",
    ID_docente: "",
    ID_materia: "",
    ID_periodo_academico: "",
  });

  // Efecto para cargar los datos cuando se abre en modo edición
  useEffect(() => {
    if (isOpen && asignacionToEdit) {
      const [hInicio, mInicio] = (asignacionToEdit.horaInicio || "07:00").split(":");
      const [hFin, mFin] = (asignacionToEdit.horaFin || "07:00").split(":");
      
      setFormData({
        paralelo: asignacionToEdit.paralelo || "",
        cupos: asignacionToEdit.cupos || 1,
        dia1: asignacionToEdit.dias?.[0] || "",
        dia2: asignacionToEdit.dias?.[1] || "",
        horaInicioH: hInicio || "07",
        horaInicioM: mInicio || "00",
        horaFinH: hFin || "07",
        horaFinM: mFin || "00",
        ID_docente: asignacionToEdit.docente?.id?.toString() || "",
        ID_materia: asignacionToEdit.materia?.id?.toString() || "",
        ID_periodo_academico: asignacionToEdit.periodoAcademico?.id?.toString() || currentPeriodo,
      });
    } else {
        setFormData({
        paralelo: "",
        cupos: 1,
        dia1: "",
        dia2: "",
        horaInicioH: "07",
        horaInicioM: "00",
        horaFinH: "07",
        horaFinM: "00",
        ID_docente: "",
        ID_materia: "",
        ID_periodo_academico: currentPeriodo,
      });
    }
    setErrorMsg("");
  }, [isOpen, asignacionToEdit, currentPeriodo]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.ID_materia) {
      setErrorMsg("Debe seleccionar una asignatura válida.");
    }
    
    if (!formData.ID_docente) {
      setErrorMsg("Debe seleccionar un docente válido.");
    }

    if (!formData.dia1) {
      setErrorMsg("Debe seleccionar al menos el Día 1.");
      return;
    }

    const minutosInicio = parseInt(formData.horaInicioH) * 60 + parseInt(formData.horaInicioM);
    const minutosFin = parseInt(formData.horaFinH) * 60 + parseInt(formData.horaFinM);
    if (minutosFin <= minutosInicio) {
      setErrorMsg("La hora de fin debe ser posterior a la  hora de inicio.");
      return;
    }

    const diasSeleccionados = [formData.dia1, formData.dia2].filter(Boolean);

    const payloadParaBackend = {
      ...formData,
      dias: diasSeleccionados,
      horaInicio: `${formData.horaInicioH}:${formData.horaInicioM}`,
      horaFin: `${formData.horaFinH}:${formData.horaFinM}`,
    };

    startTransition(() => {
      onSaveAction(asignacionToEdit?.id ?? null, payloadParaBackend)
        .then((result) => {
          if (result.success) {
            onClose();
          } else {
            setErrorMsg(result.error || "Ocurrió un error inesperado.");
          }
        })
        .catch(() => {
          setErrorMsg("Error de conexión al guardar.");
        });
    });
  };  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="flex w-full justify-center text-center text-xl font-bold mb-4">
          {asignacionToEdit ? "Editar Curso" : "Nuevo Curso"}
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fila 1: Asignatura y Docente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Asignatura:</label>
              <AutoCompleteInput
                opciones={materiasList.filter((m: any) => m.tipo && m.tipo.toLowerCase() === 'grupal')}
                inputValue={materiasList.find(m => m.id.toString() === formData.ID_materia) || null}
                setInputValue={(materia) => setFormData({ ...formData, ID_materia: materia ? materia.id.toString() : "" })}
                key1="nombre"
                key2="nivel"
                placeholder="Buscar asignatura..."
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">Docente:</label>
              <AutoCompleteInput
                opciones={docentesList}
                inputValue={docentesList.find(d => d.id.toString() === formData.ID_docente) || null}
                setInputValue={(docente) => setFormData({ ...formData, ID_docente: docente ? docente.id.toString() : "" })}
                key1="primerNombre"
                key2="primerApellido"
                placeholder="Buscar docente..."
              />
            </div>
          </div>

          {/* Fila 2: Paralelo, Día 1 y Hora Inicio */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Paralelo:</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded p-2"
                value={formData.paralelo}
                onChange={(e) => setFormData({ ...formData, paralelo: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Día 1:</label>
              <select
                required
                className="w-full border border-gray-300 rounded p-2"
                value={formData.dia1}
                onChange={(e) => setFormData({ ...formData, dia1: e.target.value })}
              >
                <option value="">Selecciona un día</option>
                {DIAS_SEMANA.map(dia => <option key={`d1-${dia}`} value={dia}>{dia}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Hora inicio:</label>
              <div className="flex items-center space-x-2">
                <select 
                  className="border border-gray-300 rounded p-2"
                  value={formData.horaInicioH}
                  onChange={(e) => setFormData({ ...formData, horaInicioH: e.target.value })}
                >
                  {HORAS.map(h => <option key={`hi-h-${h}`} value={h}>{h}</option>)}
                </select>
                <span>:</span>
                <select 
                  className="border border-gray-300 rounded p-2"
                  value={formData.horaInicioM}
                  onChange={(e) => setFormData({ ...formData, horaInicioM: e.target.value })}
                >
                  {MINUTOS.map(m => <option key={`hi-m-${m}`} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Fila 3: Cupos, Día 2 y Hora Fin */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Cupos:</label>
              <input
                type="number"
                required
                min="1"
                className="w-full border border-gray-300 rounded p-2"
                value={formData.cupos}
                onChange={(e) => setFormData({ ...formData, cupos: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Día 2:</label>
              <select
                className="w-full border border-gray-300 rounded p-2"
                value={formData.dia2}
                onChange={(e) => setFormData({ ...formData, dia2: e.target.value })}
              >
                <option value="">Selecciona un día</option>
                {DIAS_SEMANA.map(dia => (
                  <option key={`d2-${dia}`} value={dia} disabled={dia === formData.dia1}>
                    {dia}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Hora fin:</label>
              <div className="flex items-center space-x-2">
                <select 
                  className="border border-gray-300 rounded p-2"
                  value={formData.horaFinH}
                  onChange={(e) => setFormData({ ...formData, horaFinH: e.target.value })}
                >
                  {HORAS.map(h => <option key={`hf-h-${h}`} value={h}>{h}</option>)}
                </select>
                <span>:</span>
                <select 
                  className="border border-gray-300 rounded p-2"
                  value={formData.horaFinM}
                  onChange={(e) => setFormData({ ...formData, horaFinM: e.target.value })}
                >
                  {MINUTOS.map(m => <option key={`hf-m-${m}`} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-6 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}