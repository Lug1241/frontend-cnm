"use client";
import { useState } from "react";
import DataTable, { ColumnDef } from "@/app/components/ui/DataTable";
import { PeriodoAcademico } from "@/types/PeriodoAcademico";
import PeriodoModal from "./PeriodoModal";
import { createPeriodo, updatePeriodo, deletePeriodo } from "./actions";
import DeleteModal from "@/app/components/ui/DeleteModal";
interface PeriodosPageProps {
  initialPeriodos: PeriodoAcademico[];
  errorMsg: string;
}

export default function PeriodosPage({
  initialPeriodos,
  errorMsg,
}: PeriodosPageProps) {
  // Estados locales para controlar los modales de ESTE módulo
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPeriodoToEdit, setSelectedPeriodoToEdit] =
    useState<PeriodoAcademico | null>(null);
  const [selectedPeriodoToDelete, setSelectedPeriodoToDelete] =
    useState<PeriodoAcademico | null>(null);

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

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Aquí inyectas tu super DataTable reutilizable */}
      <DataTable
        data={initialPeriodos}
        columns={columns}
        addLabel="Agregar Periodo"
        onAdd={() => setIsAddModalOpen(true)}
        searchPlaceholder="Filtrar por descripción..."
        onEdit={(periodo) => setSelectedPeriodoToEdit(periodo)}
        onDelete={(periodo) => setSelectedPeriodoToDelete(periodo)}
        currentPage={1}
        totalPages={1}
      />

      {/* RENDERIZADO DE MODALES */}

      {/* MODAL UNIFICADO PARA CREAR / EDITAR */}
      <PeriodoModal
        isOpen={isAddModalOpen || selectedPeriodoToEdit !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedPeriodoToEdit(null);
        }}
        periodoToEdit={selectedPeriodoToEdit} // Si es null, el modal sabe que es "Agregar". Si trae datos, sabe que es "Editar".
        onSaveAction={async (formData) => {
          if (selectedPeriodoToEdit) {
            // Lógica o llamada a tu Server Action de Edición
            console.log("Editando periodo:", selectedPeriodoToEdit.id);
            return await updatePeriodo(selectedPeriodoToEdit.id, formData);
          } else {
            // Lógica o llamada a tu Server Action de Creación
            console.log("Creando nuevo periodo");
            return await createPeriodo(formData);
          }
        }}
      />

      {/* MODAL DE ELIMINAR */}
      {selectedPeriodoToDelete && (
        <DeleteModal
          isOpen={selectedPeriodoToDelete !== null}
          onClose={() => setSelectedPeriodoToDelete(null)}
          item={selectedPeriodoToDelete}
          title="¿Eliminar periodo?"
          getItemName={(periodo) => periodo.descripcion} 
          onDeleteAction={deletePeriodo} 
          idKey="id" 
        />
      )}
    </div>
  );
}
