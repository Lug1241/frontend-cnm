"use client";
import { useState } from "react";
import DataTable, { ColumnDef } from "@/app/components/ui/DataTable";
import { PeriodoAcademico } from "@/types/PeriodoAcademico";
import PeriodoModal from "./PeriodoModal";
import { createPeriodo, updatePeriodo, deletePeriodo } from "./actions";
import { useTransition } from "react";
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
  const [isDeleting, startDeleteTransition] = useTransition();
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center space-y-4">
            <h3 className="text-lg font-bold text-gray-800">
              ¿Eliminar periodo?
            </h3>
            <p className="text-sm text-gray-600">
              ¿Estás seguro de que deseas eliminar el periodo{" "}
              <span className="font-semibold">
                {selectedPeriodoToDelete.descripcion}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => {
                  startDeleteTransition(async () => {
                    // Llamamos a tu Server Action pasando el ID (asegúrate de mandar el campo ID correcto, ej: id o ID según tu BD)
                    const result = await deletePeriodo(
                      selectedPeriodoToDelete.id,
                    );

                    if (result.success) {
                      setSelectedPeriodoToDelete(null); // Cierra el modal y refresca la tabla automáticamente por el revalidatePath
                    } else {
                      alert(result.error || "No se pudo eliminar el periodo.");
                    }
                  });
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSelectedPeriodoToDelete(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
