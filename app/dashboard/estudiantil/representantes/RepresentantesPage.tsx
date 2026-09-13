"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DataTable, { type ColumnDef } from "@/app/components/ui/DataTable";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { type Representante } from "@/types/Representante";
import RepresentanteModal from "./RepresentanteModal";
import {
  createRepresentante,
  deleteRepresentante,
  updateRepresentante,
} from "./actions";

interface RepresentantesPageProps {
  initialRepresentantes: Representante[];
  initialSearch: string;
  currentPage: number;
  totalPages: number;
  errorMsg: string;
}

export default function RepresentantesPage({
  initialRepresentantes,
  initialSearch,
  currentPage,
  totalPages,
  errorMsg,
}: RepresentantesPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toEdit, setToEdit] = useState<Representante | null>(null);
  const [toDelete, setToDelete] = useState<Representante | null>(null);

  useEffect(() => {
    const search = searchValue.trim();
    if (search === (searchParams.get("q") ?? "")) return;
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("q", search);
      else params.delete("q");
      params.delete("page");
      const query = params.toString();
      startNavigation(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [pathname, router, searchParams, searchValue]);

  const columns: ColumnDef<Representante>[] = [
    { header: "Cédula", accessorKey: "nroCedula" },
    { header: "Nombres", cell: (item) => `${item.primerNombre} ${item.segundoNombre}` },
    { header: "Apellidos", cell: (item) => `${item.primerApellido} ${item.segundoApellido}` },
    { header: "Celular", accessorKey: "celular" },
    { header: "Correo", accessorKey: "email" },
  ];

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    const query = params.toString();
    startNavigation(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-6 lg:m-8 lg:mb-0">
          ⚠️ {errorMsg}
        </div>
      )}
      <div className={isNavigating ? "pointer-events-none opacity-70" : ""}>
        <DataTable
          title="Representantes"
          description="Administra los representantes y sus datos de contacto."
          data={initialRepresentantes}
          columns={columns}
          addLabel="Agregar representante"
          onAdd={() => setIsAddOpen(true)}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Buscar por nombre o apellido..."
          onEdit={setToEdit}
          onDelete={setToDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={changePage}
        />
      </div>
      <RepresentanteModal
        isOpen={isAddOpen || Boolean(toEdit)}
        onClose={() => {
          setIsAddOpen(false);
          setToEdit(null);
        }}
        representanteToEdit={toEdit}
        onSaveAction={(cedula, formData) =>
          cedula
            ? updateRepresentante(cedula, formData)
            : createRepresentante(formData)
        }
      />
      {toDelete && (
        <DeleteModal
          isOpen
          onClose={() => setToDelete(null)}
          item={toDelete}
          title="¿Eliminar representante?"
          getItemName={(item) => `${item.primerNombre} ${item.primerApellido}`}
          onDeleteAction={deleteRepresentante}
          idKey="nroCedula"
        />
      )}
    </div>
  );
}
