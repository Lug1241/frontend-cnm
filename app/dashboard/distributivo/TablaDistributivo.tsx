import { Asignacion } from "./page";

interface Props {
  asignaciones: Asignacion[];
}

export default function TablaDistributivo({ asignaciones }: Props) {
  if (asignaciones.length === 0) {
    return <p className="text-gray-500 mt-4">No hay registros disponibles.</p>;
  }

  return (
    <div className="overflow-x-auto mt-4 border rounded-lg">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-2 font-medium">Nivel</th>
            <th className="px-4 py-2 font-medium">Paralelo</th>
            <th className="px-4 py-2 font-medium">Docente</th>
            <th className="px-4 py-2 font-medium">Materia</th>
            <th className="px-4 py-2 font-medium">Días</th>
            <th className="px-4 py-2 font-medium">Hora inicio</th>
            <th className="px-4 py-2 font-medium">Hora fin</th>
            <th className="px-4 py-2 font-medium">Cupos</th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.map((item, index) => (
            <tr key={item.id || index} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{item.materia?.nivel}</td>
              <td className="px-4 py-2">{item.paralelo}</td>
              <td className="px-4 py-2">
                {`${item.docente?.primerNombre ?? ""} ${item.docente?.primerApellido ?? ""}`}
              </td>
              <td className="px-4 py-2">{item.materia?.nombre}</td>
              <td className="px-4 py-2">
                {Array.isArray(item.dias) && item.dias.length > 0
                  ? item.dias.filter(Boolean).join("-")
                  : ""}
              </td>
              <td className="px-4 py-2">{item.horaInicio}</td>
              <td className="px-4 py-2">{item.horaFin}</td>
              <td className="px-4 py-2">{item.cupos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}