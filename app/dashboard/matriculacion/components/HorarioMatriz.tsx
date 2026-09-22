"use client";

import { AsignacionMatriculacion } from "../actions";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const HORAS_MATUTINA = [
  "07:00 - 07:45", "07:45 - 08:30", "08:30 - 09:15", "09:15 - 10:00",
  "10:00 - 10:45", "10:45 - 11:30", "11:30 - 12:15",
];
const HORAS_VESPERTINA = [
  "14:30 - 15:15", "15:15 - 16:00", "16:00 - 16:45", "16:45 - 17:30",
  "17:30 - 18:15", "18:15 - 19:00",
];

interface Props {
  asignaciones: AsignacionMatriculacion[];
  jornada: string;
  nivel: string;
  onRemove: (id: number) => void;
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function getRanges(asignacion: AsignacionMatriculacion) {
  if (asignacion.hora1 && asignacion.hora2 && asignacion.dias.length >= 2) {
    return [
      { day: asignacion.dias[0], start: asignacion.horaInicio, end: asignacion.horaFin },
      { day: asignacion.dias[1], start: asignacion.hora1, end: asignacion.hora2 },
    ];
  }

  return asignacion.dias.map((day) => ({
    day,
    start: asignacion.horaInicio,
    end: asignacion.horaFin,
  }));
}

export default function HorarioMatriz({ asignaciones, jornada, onRemove }: Props) {
  const hasMorning = asignaciones.some((asignacion) =>
    getRanges(asignacion).some((range) => toMinutes(range.start) < 14 * 60),
  );
  const hasAfternoon = asignaciones.some((asignacion) =>
    getRanges(asignacion).some((range) => toMinutes(range.start) >= 14 * 60),
  );
  const hours = hasMorning && hasAfternoon
    ? [...HORAS_MATUTINA, ...HORAS_VESPERTINA]
    : hasAfternoon || (jornada === "Vespertina" && !hasMorning)
      ? HORAS_VESPERTINA
      : HORAS_MATUTINA;

  const getAssignment = (day: string, block: string) => {
    const [blockStart, blockEnd] = block.split(" - ").map(toMinutes);
    return asignaciones.find((asignacion) => getRanges(asignacion).some((range) =>
      range.day === day && blockStart >= toMinutes(range.start) && blockEnd <= toMinutes(range.end),
    ));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-xs">
        <thead>
          <tr className="bg-[#003366] text-white">
            <th className="border border-white/20 px-3 py-2 text-left">Hora</th>
            {DIAS.map((day) => <th key={day} className="border border-white/20 px-3 py-2">{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {hours.map((block) => (
            <tr key={block}>
              <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-medium text-gray-600">{block}</th>
              {DIAS.map((day) => {
                const assignment = getAssignment(day, block);
                return (
                  <td key={`${day}-${block}`} className={`border border-gray-200 p-1 text-center ${assignment ? "bg-blue-50" : "text-gray-300"}`}>
                    {assignment ? (
                      <button
                        type="button"
                        onClick={() => onRemove(assignment.id)}
                        className="w-full p-1 text-left text-[#003366] hover:bg-blue-100"
                        title="Quitar del horario preliminar"
                      >
                        <span className="block font-semibold">{assignment.materia?.nombre}</span>
                        <span className="block text-gray-500">Paralelo {assignment.paralelo}</span>
                      </button>
                    ) : "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
