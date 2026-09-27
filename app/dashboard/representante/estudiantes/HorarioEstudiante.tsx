import type { ClaseHorarioRepresentante } from "@/types/RepresentanteEstudiantil";

const DIAS: ClaseHorarioRepresentante["dia"][] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
];

function formatHora(value: string) {
  return value?.slice(0, 5) || "—";
}

export default function HorarioEstudiante({
  clases,
}: {
  clases: ClaseHorarioRepresentante[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {DIAS.map((dia) => {
        const clasesDelDia = clases.filter((clase) => clase.dia === dia);

        return (
          <section
            key={dia}
            aria-labelledby={`dia-${dia}`}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <h3
              id={`dia-${dia}`}
              className={`px-4 py-3 text-center text-sm font-bold text-white ${
                clasesDelDia.length > 0 ? "bg-[#00408a]" : "bg-gray-400"
              }`}
            >
              {dia}
            </h3>

            <div className="space-y-3 p-3">
              {clasesDelDia.length === 0 ? (
                <p className="py-8 text-center text-sm italic text-gray-400">
                  Sin clases
                </p>
              ) : (
                clasesDelDia.map((clase) => (
                  <article
                    key={`${clase.idInscripcion}-${dia}`}
                    className="rounded-lg border-l-4 border-[#00408a] bg-gray-50 p-3"
                  >
                    <p className="font-semibold text-[#00408a]">
                      {clase.asignatura}
                    </p>
                    <dl className="mt-2 space-y-1 text-xs text-gray-600">
                      <div>
                        <dt className="inline font-semibold">Paralelo: </dt>
                        <dd className="inline">{clase.paralelo || "—"}</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold">Docente: </dt>
                        <dd className="inline">{clase.docente || "—"}</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold">Horario: </dt>
                        <dd className="inline">
                          {formatHora(clase.horaInicio)} –{" "}
                          {formatHora(clase.horaFin)}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
