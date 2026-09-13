"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MdClose, MdOutlineVisibility } from "react-icons/md";
import DataTable, { type ColumnDef } from "@/app/components/ui/DataTable";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { type Representante } from "@/types/Representante";
import RepresentanteModal from "./RepresentanteModal";
import RepresentanteDetailPanel from "./RepresentanteDetailPanel";
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
  const [activeTab, setActiveTab] = useState("representantes");
  const [openRepresentantes, setOpenRepresentantes] = useState<Representante[]>(
    [],
  );
  const selectedRepresentante = openRepresentantes.find(
    (representante) => representante.nroCedula === activeTab,
  );

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
    {
      header: "Nombres",
      cell: (item) => `${item.primerNombre} ${item.segundoNombre}`,
    },
    {
      header: "Apellidos",
      cell: (item) => `${item.primerApellido} ${item.segundoApellido}`,
    },
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

  const showDetails = (representante: Representante) => {
    setOpenRepresentantes((current) =>
      current.some((item) => item.nroCedula === representante.nroCedula)
        ? current
        : [...current, representante],
    );
    setActiveTab(representante.nroCedula);
  };

  const closeDetails = (nroCedula: string) => {
    setOpenRepresentantes((current) => {
      const index = current.findIndex((item) => item.nroCedula === nroCedula);
      const remaining = current.filter((item) => item.nroCedula !== nroCedula);

      if (activeTab === nroCedula) {
        setActiveTab(
          remaining[index]?.nroCedula ??
            remaining[index - 1]?.nroCedula ??
            "representantes",
        );
      }

      return remaining;
    });
  };

  return (
    <div className="min-h-full bg-white">
      <div
        className="flex min-h-12 items-end gap-1 overflow-x-auto border-b border-gray-200 bg-gray-50 px-4 pt-3 sm:px-6 lg:px-8"
        role="tablist"
        aria-label="Vistas de representantes"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "representantes"}
          onClick={() => setActiveTab("representantes")}
          className={`rounded-t-md border px-5 py-2.5 text-sm font-semibold ${
            activeTab === "representantes"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Representantes
        </button>
        {openRepresentantes.map((representante) => (
          <div
            key={representante.nroCedula}
            className={`flex shrink-0 items-center rounded-t-md border text-sm font-semibold ${
              activeTab === representante.nroCedula
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-200 bg-white text-gray-700"
            }`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === representante.nroCedula}
              onClick={() => setActiveTab(representante.nroCedula)}
              className="px-4 py-2.5"
            >
              {representante.primerNombre} {representante.primerApellido}
            </button>
            <button
              type="button"
              onClick={() => closeDetails(representante.nroCedula)}
              className="mr-2 rounded p-1 hover:bg-black/10"
              title="Cerrar pestaña"
              aria-label={`Cerrar información de ${representante.primerNombre} ${representante.primerApellido}`}
            >
              <MdClose className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {errorMsg && (
        <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-6 lg:m-8 lg:mb-0">
          ⚠️ {errorMsg}
        </div>
      )}
      {activeTab === "representantes" && (
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
            renderActions={(item) => (
              <button
                type="button"
                onClick={() => showDetails(item)}
                title="Ver información"
                aria-label={`Ver información de ${item.primerNombre} ${item.primerApellido}`}
                className="text-emerald-600 transition-colors hover:text-emerald-800"
              >
                <MdOutlineVisibility className="h-5 w-5" />
              </button>
            )}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={changePage}
          />
        </div>
      )}
      {selectedRepresentante && (
        <RepresentanteDetailPanel
          representante={selectedRepresentante}
          onEdit={() => setToEdit(selectedRepresentante)}
        />
      )}
      <RepresentanteModal
        isOpen={isAddOpen || Boolean(toEdit)}
        onClose={() => {
          setIsAddOpen(false);
          setToEdit(null);
        }}
        representanteToEdit={toEdit}
        onSaveAction={async (cedula, formData) => {
          const result = cedula
            ? await updateRepresentante(cedula, formData)
            : await createRepresentante(formData);
          if (result.success && cedula) closeDetails(cedula);
          return result;
        }}
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
