"use client";
import { useState } from "react";
import DataTable, { ColumnDef } from "@/app/components/ui/DataTable";

interface PeriodoAcademico {
  id: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: "Activo" | "Finalizado";
}

const MOCK_PERIODOS: PeriodoAcademico[] = [
  {
    id: "1",
    descripcion: "Período 2025-2026",
    fechaInicio: "31/8/2025",
    fechaFin: "31/7/2026",
    estado: "Finalizado",
  },
  {
    id: "2",
    descripcion: "Período 2026-2027",
    fechaInicio: "3/8/2026",
    fechaFin: "31/7/2027",
    estado: "Activo",
  },
];

export default function PeriodosAcademicosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>(MOCK_PERIODOS);

  const columns: ColumnDef<PeriodoAcademico>[] = [
    { header: "Descripción", accessorKey: "descripcion" },
    { header: "Fecha inicio", accessorKey: "fechaInicio" },
    { header: "Fecha fin", accessorKey: "fechaFin" },
    { 
      header: "Estado", 
      accessorKey: "estado",
      cell: (item) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            item.estado === "Activo"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {item.estado}
        </span>
      ),
    },
  ];

  const filteredData = periodos.filter((periodo) =>
    periodo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    console.log("Abrir modal para agregar nuevo periodo académico");
  };

  const handleEdit = (periodo: PeriodoAcademico) => {
    console.log("Editar periodo:", periodo.id);
  };

  const handleDelete = (periodo: PeriodoAcademico) => {
    console.log("Eliminar periodo:", periodo.id);
  };

  return (
    <DataTable
      data={filteredData}
      columns={columns}
      addLabel="Agregar"
      onAdd={handleAdd}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Filtrar por descripción..."
      onEdit={handleEdit}
      onDelete={handleDelete}
      currentPage={currentPage}
      totalPages={1}
      onPageChange={setCurrentPage}
    />
  );
}