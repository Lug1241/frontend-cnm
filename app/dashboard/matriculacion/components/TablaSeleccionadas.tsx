"use client";

import { AsignacionMatriculacion } from "../actions";

interface Props {
  asignaciones: AsignacionMatriculacion[];
  onRemove: (id: number) => void;
}

export default function TablaSeleccionadas({ asignaciones, onRemove }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-3 py-2">Materia</th>
            <th className="px-3 py-2">Horario</th>
            <th className="px-3 py-2">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {asignaciones.length > 0 ? asignaciones.map((asignacion) => (
            <tr key={asignacion.id}>
              <td className="px-3 py-3 font-medium text-gray-800">
                {asignacion.materia?.nombre} · {asignacion.paralelo}
              </td>
              <td className="px-3 py-3 text-gray-500">
                {asignacion.dias.join(" - ")} · {asignacion.horaInicio} - {asignacion.horaFin}
              </td>
              <td className="px-3 py-3">
                <button type="button" onClick={() => onRemove(asignacion.id)} className="text-red-600 hover:underline">
                  Quitar
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={3} className="px-3 py-4 text-center text-sm text-gray-500">
                No hay materias seleccionadas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
