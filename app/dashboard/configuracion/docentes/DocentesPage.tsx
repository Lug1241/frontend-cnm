"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DataTable, { ColumnDef } from "@/app/components/ui/DataTable";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { type Docente } from "@/types/Docente";
import DocenteModal from "./DocenteModal";
import { createDocente, deleteDocente, updateDocente } from "./actions";

interface DocentesPageProps {
  initialDocentes: Docente[];
  initialSearch: string;
  currentPage: number;
  totalPages: number;
  errorMsg: string;
}

export default function DocentesPage({
  initialDocentes,
  initialSearch,
  currentPage,
  totalPages,
  errorMsg,
}: DocentesPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDocenteToEdit, setSelectedDocenteToEdit] =
    useState<Docente | null>(null);
  const [selectedDocenteToDelete, setSelectedDocenteToDelete] =
    useState<Docente | null>(null);

  const currentQuery = searchParams.get("q") ?? "";

  // Efecto para aplicar debounce a la barra de búsqueda
  useEffect(() => {
    const normalizedSearch = searchValue.trim();
    if (normalizedSearch === currentQuery) return;

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (normalizedSearch) {
        params.set("q", normalizedSearch);
      } else {
        params.delete("q");
      }
      params.delete("page");

      const queryString = params.toString();
      startNavigation(() => {
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [currentQuery, pathname, router, searchParams, searchValue]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const queryString = params.toString();
    startNavigation(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  const columns: ColumnDef<Docente>[] = [
    { header: "Cédula", accessorKey: "nroCedula" },
    { 
      header: "Nombres", 
      cell: (docente) => `${docente.primerNombre} ${docente.segundoNombre}` 
    },
    { 
      header: "Apellidos", 
      cell: (docente) => `${docente.primerApellido} ${docente.segundoApellido}` 
    },
    { header: "Rol", accessorKey: "rol" },
    { header: "Email", accessorKey: "email" },
    {
      header: "Estado",
      cell: (docente) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            docente.habilitado
              ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
              : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10"
          }`}
        >
          {docente.habilitado ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-6 lg:m-8 lg:mb-0">
          ⚠️ {errorMsg}
        </div>
      )}

      <div
        className={
          isNavigating
            ? "pointer-events-none opacity-70 transition-opacity"
            : "transition-opacity"
        }
      >
        <DataTable
          title="Docentes"
          description="Administra el personal docente, sus datos de contacto y estado de acceso al sistema."
          data={initialDocentes}
          columns={columns}
          addLabel="Agregar docente"
          onAdd={() => setIsAddModalOpen(true)}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Buscar por nombre o apellido..."
          onEdit={setSelectedDocenteToEdit}
          onDelete={setSelectedDocenteToDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <DocenteModal
        isOpen={isAddModalOpen || selectedDocenteToEdit !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedDocenteToEdit(null);
        }}
        docenteToEdit={selectedDocenteToEdit}
        onSaveAction={async (cedula, formData) => {
          if (cedula) {
            return updateDocente(cedula, formData);
          }
          return createDocente(formData);
        }}
      />

      {selectedDocenteToDelete && (
        <DeleteModal
          isOpen
          onClose={() => setSelectedDocenteToDelete(null)}
          item={selectedDocenteToDelete}
          title="¿Eliminar docente?"
          getItemName={(docente) => `${docente.primerNombre} ${docente.primerApellido}`}
          onDeleteAction={async (id) => {
            const result = await deleteDocente(String(id));
            if (result.success) {
                router.refresh();
            }
            return result;
        }}
          idKey="nroCedula"
        />
      )}
    </div>
  );
}