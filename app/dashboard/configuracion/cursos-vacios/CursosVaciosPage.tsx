"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import DataTable, { ColumnDef } from "@/app/components/ui/DataTable";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { type Asignacion } from "@/types/Asignacion"; // Ajusta la ruta
import { deleteAsignacionVacia } from "./actions";

interface Props {
  initialData: Asignacion[];
  currentPage: number;
  totalPages: number;
  errorMsg: string;
}

export default function CursosVaciosPage({
  initialData,
  currentPage,
  totalPages,
  errorMsg,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();

  const [selectedToDelete, setSelectedToDelete] = useState<Asignacion | null>(null);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    startNavigation(() => {
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, {
        scroll: false,
      });
    });
  };

  const columns: ColumnDef<Asignacion>[] = [
    { header: "Nivel", cell: (item) => item.materia?.nivel ?? "-" },
    { header: "Paralelo", accessorKey: "paralelo" },
    { 
      header: "Docente", 
      cell: (item) => `${item.docente?.primerNombre ?? ""} ${item.docente?.primerApellido ?? ""}`.trim() 
    },
    { header: "Materia", cell: (item) => item.materia?.nombre ?? "-" },
    { 
      header: "Días", 
      cell: (item) => Array.isArray(item.dias) && item.dias.length > 0 ? item.dias.filter(Boolean).join("-") : "-" 
    },
    { header: "Horario", cell: (item) => `${item.horaInicio} - ${item.horaFin}` },
    { header: "Cupos", accessorKey: "cupos" },
  ];

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-6 lg:m-8 lg:mb-0">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className={isNavigating ? "pointer-events-none opacity-70 transition-opacity" : "transition-opacity"}>
        <DataTable
          data={initialData}
          columns={columns}
          onDelete={setSelectedToDelete} 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showSearch={false}
        />
      </div>

      {selectedToDelete && (
        <DeleteModal
          isOpen
          onClose={() => setSelectedToDelete(null)}
          item={selectedToDelete}
          title="¿Eliminar curso?"
          getItemName={(item) => `${item.materia?.nombre ?? "Materia"} (Paralelo ${item.paralelo})`}
          onDeleteAction={async (id) => {
            const result = await deleteAsignacionVacia(String(id));
            if (result.success) {
              router.refresh();
            }
            return result;
          }}
          idKey="id"
        />
      )}
    </div>
  );
}