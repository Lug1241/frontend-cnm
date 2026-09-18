"use client";

import { useState } from "react";
import DataTable, {
  type ColumnDef,
} from "@/app/components/ui/DataTable";
import DeleteModal from "@/app/components/ui/DeleteModal";
import Toast from "@/app/components/ui/Toast";

import {
  getDescripcionFechaNotaLabel,
  type FechaProceso,
} from "@/types/FechaProceso";

import FechaNotaModal from "./FechaNotaModal";

import {
  createFechaNota,
  deleteFechaNota,
  updateFechaNota,
} from "./actions";

interface FechasNotasPageProps {
  initialFechas: FechaProceso[];
  currentPage: number;
  totalPages: number;
  errorMsg: string;
}

export default function FechasNotasPage({
  initialFechas,
  currentPage,
  totalPages,
  errorMsg,
}: FechasNotasPageProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [toEdit, setToEdit] =
    useState<FechaProceso | null>(null);

  const [toDelete, setToDelete] =
    useState<FechaProceso | null>(null);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const columns: ColumnDef<FechaProceso>[] = [
    {
      header: "Descripción",
      cell: (fecha) =>
        getDescripcionFechaNotaLabel(fecha.descripcion),
    },
    {
      header: "Fecha inicio",
      accessorKey: "fechaInicio",
    },
    {
      header: "Fecha fin",
      accessorKey: "fechaFin",
    },
  ];

  return (
    <div className="min-h-full bg-white">
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {errorMsg && (
        <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-6 lg:m-8 lg:mb-0">
          ⚠️ {errorMsg}
        </div>
      )}

      <DataTable
        title="Fechas para notas"
        description="Administra los períodos habilitados para el registro de calificaciones."
        data={initialFechas}
        columns={columns}
        addLabel="Agregar fecha"
        onAdd={() => setIsAddOpen(true)}
        onEdit={setToEdit}
        onDelete={setToDelete}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      <FechaNotaModal
        isOpen={isAddOpen || Boolean(toEdit)}
        onClose={() => {
          setIsAddOpen(false);
          setToEdit(null);
        }}
        fechaToEdit={toEdit}
        fechasExistentes={initialFechas}
        onSaveAction={async (formData) => {
          const isEditing = Boolean(toEdit);

          const result = toEdit
            ? await updateFechaNota(toEdit.id, formData)
            : await createFechaNota(formData);

          if (result.success) {
            setToastMessage(
              isEditing
                ? "Fecha para notas actualizada correctamente."
                : "Fecha para notas creada correctamente.",
            );
          }

          return result;
        }}
      />

      {toDelete && (
        <DeleteModal
          isOpen
          onClose={() => setToDelete(null)}
          item={toDelete}
          title="¿Eliminar fecha para notas?"
          getItemName={(fecha) =>
            getDescripcionFechaNotaLabel(
              fecha.descripcion,
            )
          }
          onDeleteAction={deleteFechaNota}
          idKey="id"
        />
      )}
    </div>
  );
}