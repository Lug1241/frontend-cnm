import AcademicTable, {
  AcademicColumn,
} from "@/app/components/ui/AcademicTable";

import type { EstudianteCurso } from "@/types/Calificaciones";

interface Props {
  estudiantes: EstudianteCurso[];
  esBE: boolean;
  escalaBE?: "Cualitativa" | "Cuantitativa";
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
      key: "primerParcial",
      header: "Primer Parcial",
      group: "RESUMEN DE APRENDIZAJES Y COMPORTAMIENTO",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "segundoParcial",
      header: "Segundo Parcial",
      group: "RESUMEN DE APRENDIZAJES Y COMPORTAMIENTO",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "ponderacion70",
      header: "Ponderación 70%",
      group: "RESUMEN DE APRENDIZAJES Y COMPORTAMIENTO",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "examen",
      header: "Examen",
      group: "RESUMEN DE APRENDIZAJES Y COMPORTAMIENTO",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "ponderacion30",
      header: "Ponderación 30%",
      group: "RESUMEN DE APRENDIZAJES Y COMPORTAMIENTO",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "promedioFinal",
      header: "Promedio Final",
      group: "RESUMEN DE APRENDIZAJES Y COMPORTAMIENTO",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "promedioComportamiento",
      header: "Promedio Comportamiento",
      group: "RESUMEN DE APRENDIZAJES Y COMPORTAMIENTO",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "nivel",
      header: "Nivel",
      group: "RESUMEN DE APRENDIZAJES Y COMPORTAMIENTO",
      verticalHeader: true,
      cell: (row) => row.nivel || "—",
    },
    {
      key: "comportamientoFinal",
      header: "Comportamiento Final",
      group: "RESUMEN DE APRENDIZAJES Y COMPORTAMIENTO",
      verticalHeader: true,
      cell: vacio,
    },
  ];
}

function columnasBE(
  escala: "Cualitativa" | "Cuantitativa",
): AcademicColumn<EstudianteCurso>[] {
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
      key: "primerParcial",
      header: "Primer Parcial",
      group: "RESUMEN DE APRENDIZAJES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "escala1",
      header: escala,
      group: "RESUMEN DE APRENDIZAJES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "segundoParcial",
      header: "Segundo Parcial",
      group: "RESUMEN DE APRENDIZAJES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "escala2",
      header: escala,
      group: "RESUMEN DE APRENDIZAJES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "promedio",
      header: "Promedio",
      group: "RESUMEN DE APRENDIZAJES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "escalaPromedio",
      header: escala,
      group: "RESUMEN DE APRENDIZAJES",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "ponderacion70",
      header: "Ponderación 70%",
      group: "RESUMEN DE APRENDIZAJES",
      verticalHeader: true,
      cell: vacio,
    },

    {
      key: "examen",
      header: "Examen",
      group: "EVALUACIÓN",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "ponderacion30",
      header: "Ponderación 30%",
      group: "EVALUACIÓN",
      verticalHeader: true,
      cell: vacio,
    },

    {
      key: "promedioQuimestral",
      header: "Promedio Quimestral",
      group: "",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "escalaFinal",
      header: escala,
      group: "",
      verticalHeader: true,
      cell: vacio,
    },
  ];
}

export default function QuimestralGradesTable({
  estudiantes,
  esBE,
  escalaBE = "Cualitativa",
}: Props) {
  const columns = esBE
    ? columnasBE(escalaBE)
    : columnasSuperior();

  return (
    <AcademicTable
      rows={estudiantes}
      columns={columns}
      getRowKey={(row) => row.idInscripcion}
    />
  );
}