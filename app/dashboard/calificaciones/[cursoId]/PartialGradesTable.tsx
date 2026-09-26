import AcademicTable, {
  AcademicColumn,
} from "@/app/components/ui/AcademicTable";
import { EstudianteCurso } from "@/types/Calificaciones";

interface Props {
  estudiantes: EstudianteCurso[];
  esBE: boolean;
}

const vacio = () => (
  <span className="text-gray-300">—</span>
);

function columnasSuperiores(): AcademicColumn<EstudianteCurso>[] {
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
      key: "insumo1",
      header: "INSUMO 1",
      group: "Evaluación de Aprendizajes",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "insumo2",
      header: "INSUMO 2",
      group: "Evaluación de Aprendizajes",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "ponderacion70",
      header: "PONDERACIÓN 70%",
      group: "Evaluación de Aprendizajes",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "sumativa",
      header: "EVALUACIÓN SUMATIVA",
      group: "Evaluación de Aprendizajes",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "ponderacion30",
      header: "PONDERACIÓN 30%",
      group: "Evaluación de Aprendizajes",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "promedioParcial",
      header: "PROMEDIO PARCIAL",
      group: "Evaluación de Aprendizajes",
      verticalHeader: true,
      cell: vacio,
    },

    ...[
      "RESPETO Y CONSIDERACIÓN",
      "VALORACIÓN DE LA DIVERSIDAD",
      "CUMPLIMIENTO DE LAS NORMAS DE CONVIVENCIA",
      "CUIDADO DEL PATRIMONIO INSTITUCIONAL",
      "RESPETO A LA PROPIEDAD AJENA",
      "PUNTUALIDAD Y ASISTENCIA",
      "HONESTIDAD",
      "PRESENTACIÓN PERSONAL",
      "PARTICIPACIÓN COMUNITARIA",
      "RESPONSABILIDAD",
      "PROMEDIO COMPORTAMIENTO",
    ].map(
      (header, index): AcademicColumn<EstudianteCurso> => ({
        key: `comportamiento-${index}`,
        header,
        group: "Evaluación del Comportamiento",
        verticalHeader: true,
        cell: vacio,
      }),
    ),

    {
      key: "nivel",
      header: "NIVEL",
      group: "Evaluación del Comportamiento",
      verticalHeader: true,
      cell: (row) => row.nivel || "—",
    },
    {
      key: "valoracion",
      header: "VALORACIÓN",
      group: "Evaluación del Comportamiento",
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

    ...[
      "INSUMO 1",
      "INSUMO 2",
      "PROMEDIO",
      "CUALITATIVA",
      "PONDERACIÓN 70%",
    ].map(
      (header, index): AcademicColumn<EstudianteCurso> => ({
        key: `aprendizaje-${index}`,
        header,
        group: "Evaluación de Aprendizajes",
        verticalHeader: true,
        cell: vacio,
      }),
    ),

    ...[
      "EVALUACIÓN SUMATIVA",
      "EVALUACIÓN MEJORAMIENTO",
      "PROMEDIO DE MEJORA",
      "PROMEDIO SUMATIVAS",
      "PONDERACIÓN 30%",
    ].map(
      (header, index): AcademicColumn<EstudianteCurso> => ({
        key: `sumativa-${index}`,
        header,
        group: "Evaluaciones Sumativas",
        verticalHeader: true,
        cell: vacio,
      }),
    ),

    {
      key: "notaParcial",
      header: "NOTA PARCIAL",
      group: "",
      verticalHeader: true,
      cell: vacio,
    },
    {
      key: "cualitativaFinal",
      header: "CUALITATIVA",
      group: "",
      verticalHeader: true,
      cell: vacio,
    },
  ];
}

export default function PartialGradesTable({
  estudiantes,
  esBE,
}: Props) {
  const columns = esBE
    ? columnasBE()
    : columnasSuperiores();

  return (
    <AcademicTable
      rows={estudiantes}
      columns={columns}
      getRowKey={(row) => row.idInscripcion}
    />
  );
}