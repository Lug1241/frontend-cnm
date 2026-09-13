"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DataTable, { ColumnDef } from "@/app/components/ui/DataTable";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { Materia } from "@/types/Materia";
import MateriaModal from "./MateriaModal";
import { createMateria, deleteMateria, updateMateria } from "./actions";

interface MateriasPageProps {
  initialMaterias: Materia[];
  initialSearch: string;
  currentPage: number;
  totalPages: number;
  errorMsg: string;
}

export default function MateriasPage({
  initialMaterias,
  initialSearch,
  currentPage,
  totalPages,
  errorMsg,
}: MateriasPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMateriaToEdit, setSelectedMateriaToEdit] =
    useState<Materia | null>(null);
  const [selectedMateriaToDelete, setSelectedMateriaToDelete] =
    useState<Materia | null>(null);

  const currentQuery = searchParams.get("q") ?? "";

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

  const columns: ColumnDef<Materia>[] = [
    { header: "Nombre", accessorKey: "nombre" },
    { header: "Nivel", accessorKey: "nivel" },
    {
      header: "Tipo",
      cell: (materia) =>
        materia.tipo.charAt(0).toUpperCase() + materia.tipo.slice(1),
    },
    { header: "Edad mínima", accessorKey: "edadMin" },
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
          title="Materias"
          description="Administra las materias, sus niveles y modalidad."
          data={initialMaterias}
          columns={columns}
          addLabel="Agregar materia"
          onAdd={() => setIsAddModalOpen(true)}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Buscar por nombre..."
          onEdit={setSelectedMateriaToEdit}
          onDelete={setSelectedMateriaToDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <MateriaModal
        isOpen={isAddModalOpen || selectedMateriaToEdit !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedMateriaToEdit(null);
        }}
        materiaToEdit={selectedMateriaToEdit}
        onSaveAction={(formData) =>
          selectedMateriaToEdit
            ? updateMateria(selectedMateriaToEdit.id, formData)
            : createMateria(formData)
        }
      />

      {selectedMateriaToDelete && (
        <DeleteModal
          isOpen
          onClose={() => setSelectedMateriaToDelete(null)}
          item={selectedMateriaToDelete}
          title="¿Eliminar materia?"
          getItemName={(materia) => materia.nombre}
          onDeleteAction={deleteMateria}
          idKey="id"
        />
      )}
    </div>
  );
}
