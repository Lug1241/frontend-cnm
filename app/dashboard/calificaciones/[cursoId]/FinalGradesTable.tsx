import AcademicTable, {
  AcademicColumn,
} from "@/app/components/ui/AcademicTable";

import type { EstudianteCurso } from "@/types/Calificaciones";

interface Props {
  estudiantes: EstudianteCurso[];
  esBE: boolean;
}

const vacio = () => (
  <span className="text-gray-300">—</span>
);

function columnasSuperior(): AcademicColumn<EstudianteCurso>[] {
  return [
    {
      key: "nro",
      header: "Nro",
      group: "",
      width: "55px",
      cell: (row) => row.nro,
    },
    {
      key: "estudiante",
      header: "Nómina de Estudiantes",
      group: "",
      width: "220px",
      cell: (row) => (
        <span className="font-medium">
          {row.nombreCompleto}
        </span>
      ),
    },

    {
      key: "primerQuimestre",
      header: "Primer Quimestre",
      group: "RESUMEN DE APRENDIZAJES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "segundoQuimestre",
      header: "Segundo Quimestre",
      group: "RESUMEN DE APRENDIZAJES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "promedioAnual",
      header: "Promedio Anual",
      group: "RESUMEN DE APRENDIZAJES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "comportamiento",
      header: "Comportamiento",
      group: "RESUMEN DE APRENDIZAJES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "examenSupletorio",
      header: "Examen Supletorio",
      group: "RESUMEN DE APRENDIZAJES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "promedioFinal",
      header: "Promedio Final",
      group: "RESUMEN DE APRENDIZAJES",
      verticalHeader: true,
      cell: vacio,
    },

    {
      key: "nivel",
      header: "Nivel",
      group: "",
      verticalHeader: true,
      cell: (row) => row.nivel || "—",
    },
    {
      key: "estado",
      header: "Estado",
      group: "",
      verticalHeader: true,
      cell: vacio,
    },
  ];
}

function columnasBE(): AcademicColumn<EstudianteCurso>[] {
  return [
    {
      key: "nro",
      header: "Nro",
      group: "",
      width: "55px",
      cell: (row) => row.nro,
    },
    {
      key: "estudiante",
      header: "Nómina de Estudiantes",
      group: "",
      width: "220px",
      cell: (row) => row.nombreCompleto,
    },

    {
      key: "primerQuimestre",
      header: "Primer Quimestre",
      group: "RESULTADOS FINALES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "segundoQuimestre",
      header: "Segundo Quimestre",
      group: "RESULTADOS FINALES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "promedioFinal",
      header: "Promedio Final",
      group: "RESULTADOS FINALES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "escala",
      header: "Escala",
      group: "RESULTADOS FINALES",
      verticalHeader: true,
      cell: vacio,
    },

    {
      key: "estado",
      header: "Estado",
      group: "",
      verticalHeader: true,
      cell: vacio,
    },
  ];
}

export default function FinalGradesTable({
  estudiantes,
  esBE,
}: Props) {
  const columns = esBE
    ? columnasBE()
    : columnasSuperior();

  return (
    <AcademicTable
      rows={estudiantes}
      columns={columns}
      getRowKey={(row) => row.idInscripcion}
    />
  );
}