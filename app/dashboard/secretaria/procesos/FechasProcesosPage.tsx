"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DataTable, { type ColumnDef } from "@/app/components/ui/DataTable";
import DeleteModal from "@/app/components/ui/DeleteModal";
import Toast from "@/app/components/ui/Toast";
import {
  TIPO_PROCESO_LABELS,
  type FechaProceso,
  type TipoProceso,
} from "@/types/FechaProceso";
import FechaProcesoModal from "./FechaProcesoModal";
import {
  createFechaProceso,
  deleteFechaProceso,
  updateFechaProceso,
} from "./actions";

interface FechasProcesosPageProps {
  initialProcesos: FechaProceso[];
  initialProceso: TipoProceso | "";
  currentPage: number;
  totalPages: number;
  errorMsg: string;
}

const PROCESOS_SECRETARIA: TipoProceso[] = [
  "matricula",
  "actualizacion_datos",
];

function formatFecha(fecha: string) {
  const [year, month, day] = fecha.split("-");

  return `${day}/${month}/${year}`;
}

export default function FechasProcesosPage({
  initialProcesos,
  initialProceso,
  currentPage,
  totalPages,
  errorMsg,
}: FechasProcesosPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isNavigating, startNavigation] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toEdit, setToEdit] = useState<FechaProceso | null>(null);
  const [toDelete, setToDelete] = useState<FechaProceso | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const columns: ColumnDef<FechaProceso>[] = [
    {
      header: "Proceso",
      cell: (item) => TIPO_PROCESO_LABELS[item.proceso],
    },
    {
      header: "Fecha inicio",
      cell: (item) => formatFecha(item.fechaInicio),
    },
    {
      header: "Fecha fin",
      cell: (item) => formatFecha(item.fechaFin),
    },
  ];

  const changeProceso = (proceso: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (proceso) {
      params.set("proceso", proceso);
    } else {
      params.delete("proceso");
    }

    params.delete("page");

    const query = params.toString();

    startNavigation(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const query = params.toString();

    startNavigation(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

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

      <div className={isNavigating ? "pointer-events-none opacity-70" : ""}>
        <DataTable
          title="Fechas de Procesos"
          description="Administra los períodos habilitados para los procesos institucionales."
          data={initialProcesos}
          columns={columns}
          addLabel="Agregar proceso"
          onAdd={() => setIsAddOpen(true)}
          customFilters={
            <select
              value={initialProceso}
              onChange={(event) => changeProceso(event.target.value)}
              aria-label="Filtrar por tipo de proceso"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a] sm:w-64"
            >
              <option value="">Todos los procesos</option>

              {PROCESOS_SECRETARIA.map((proceso) => (
                <option key={proceso} value={proceso}>
                  {TIPO_PROCESO_LABELS[proceso]}
                </option>
              ))}
            </select>
          }
          onEdit={setToEdit}
          onDelete={setToDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={changePage}
        />
      </div>

      <FechaProcesoModal
        isOpen={isAddOpen || Boolean(toEdit)}
        onClose={() => {
          setIsAddOpen(false);
          setToEdit(null);
        }}
        procesoToEdit={toEdit}
        onSaveAction={async (id, formData) => {
          const isEditing = id !== null;

          const result =
            id !== null
              ? await updateFechaProceso(id, formData)
              : await createFechaProceso(formData);

          if (result.success) {
            setToastMessage(
              isEditing
                ? "Proceso actualizado correctamente."
                : "Proceso creado correctamente.",
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
          title="¿Eliminar proceso?"
          getItemName={(item) => TIPO_PROCESO_LABELS[item.proceso]}
          onDeleteAction={deleteFechaProceso}
          idKey="id"
        />
      )}
    </div>
  );
}