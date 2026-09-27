import type { EstudianteRepresentante } from "@/types/RepresentanteEstudiantil";

const CAMPOS: Array<{
  label: string;
  value: (estudiante: EstudianteRepresentante) => string;
}> = [
  { label: "Número de cédula", value: (estudiante) => estudiante.nroCedula },
  { label: "Nivel actual", value: (estudiante) => estudiante.nivel },
  { label: "Primer nombre", value: (estudiante) => estudiante.primerNombre },
  {
    label: "Segundo nombre",
    value: (estudiante) => estudiante.segundoNombre || "—",
  },
  {
    label: "Primer apellido",
    value: (estudiante) => estudiante.primerApellido,
  },
  {
    label: "Segundo apellido",
    value: (estudiante) => estudiante.segundoApellido || "—",
  },
  {
    label: "Fecha de nacimiento",
    value: (estudiante) =>
      estudiante.fechaNacimiento
        ? new Intl.DateTimeFormat("es-EC", { timeZone: "UTC" }).format(
            new Date(estudiante.fechaNacimiento),
          )
        : "—",
  },
  { label: "Género", value: (estudiante) => estudiante.genero },
  { label: "Grupo étnico", value: (estudiante) => estudiante.grupoEtnico },
  { label: "Dirección", value: (estudiante) => estudiante.direccion },
  { label: "Especialidad", value: (estudiante) => estudiante.especialidad },
  { label: "Jornada", value: (estudiante) => estudiante.jornada },
  { label: "IER", value: (estudiante) => estudiante.ier },
  { label: "Nacionalidad", value: (estudiante) => estudiante.nacionalidad },
];

export default function InformacionEstudiante({
  estudiante,
}: {
  estudiante: EstudianteRepresentante;
}) {
  return (
    <section
      aria-labelledby="titulo-informacion-estudiante"
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2
          id="titulo-informacion-estudiante"
          className="text-xl font-bold text-[#00408a] sm:text-2xl"
        >
          Información completa
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Estos datos son únicamente de consulta.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CAMPOS.map((campo) => (
          <div
            key={campo.label}
            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {campo.label}
            </dt>
            <dd className="mt-1 break-words text-sm font-medium text-gray-900">
              {campo.value(estudiante)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
