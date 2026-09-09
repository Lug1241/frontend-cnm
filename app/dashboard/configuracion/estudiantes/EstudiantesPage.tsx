"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MdOutlineVisibility } from "react-icons/md";
import DataTable, { type ColumnDef } from "@/app/components/ui/DataTable";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { type Estudiante } from "@/types/Estudiante";
import { type Representante } from "@/types/Representante";
import EstudianteModal from "./EstudianteModal";
import RepresentanteDetailModal from "./RepresentanteDetailModal";
import {
  deleteEstudiante,
  getRepresentanteDetail,
  updateEstudiante,
} from "./actions";

interface EstudiantesPageProps {
  initialEstudiantes: Estudiante[];
  representantes: Representante[];
  initialSearch: string;
  currentPage: number;
  totalPages: number;
  errorMsg: string;
}

export default function EstudiantesPage({
  initialEstudiantes,
  representantes,
  initialSearch,
  currentPage,
  totalPages,
  errorMsg,
}: EstudiantesPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [toEdit, setToEdit] = useState<Estudiante | null>(null);
  const [toDelete, setToDelete] = useState<Estudiante | null>(null);
  const [representante, setRepresentante] = useState<Representante | null>(null);
  const [detailError, setDetailError] = useState<string>();
  const [isDetailLoading, setIsDetailLoading] = useState(false);

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

  const columns: ColumnDef<Estudiante>[] = [
    { header: "Cédula/Pasaporte", accessorKey: "nroCedula" },
    { header: "Nombre", cell: (item) => `${item.primerNombre} ${item.segundoNombre}` },
    { header: "Apellido", cell: (item) => `${item.primerApellido} ${item.segundoApellido}` },
    { header: "Jornada", accessorKey: "jornada" },
    { header: "Especialidad", accessorKey: "especialidad" },
    { header: "Nivel", accessorKey: "nivel" },
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

  const showRepresentative = async (student: Estudiante) => {
    setRepresentante(null);
    setDetailError(undefined);
    setIsDetailLoading(true);
    const result = await getRepresentanteDetail(student.representanteCedula);
    setIsDetailLoading(false);
    if (result.success && result.data) setRepresentante(result.data);
    else setDetailError(result.error);
  };

  const closeDetail = () => {
    setRepresentante(null);
    setDetailError(undefined);
    setIsDetailLoading(false);
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-6 lg:m-8 lg:mb-0">⚠️ {errorMsg}</div>
      )}
      <div className={isNavigating ? "pointer-events-none opacity-70" : ""}>
        <DataTable
          title="Estudiantes"
          description="Consulta y administra la información relevante de los estudiantes."
          data={initialEstudiantes}
          columns={columns}
          addLabel="Registrar estudiante"
          onAdd={() => router.push("/dashboard/configuracion/estudiantes/nuevo")}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Buscar por nombre o cédula..."
          onEdit={setToEdit}
          onDelete={setToDelete}
          renderActions={(item) => (
            <button type="button" onClick={() => showRepresentative(item)} title="Ver representante" aria-label={`Ver representante de ${item.primerNombre}`} className="text-emerald-600 transition-colors hover:text-emerald-800">
              <MdOutlineVisibility className="h-5 w-5" />
            </button>
          )}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={changePage}
        />
      </div>
      <EstudianteModal
        estudiante={toEdit}
        representantes={representantes}
        onClose={() => setToEdit(null)}
        onSaveAction={(formData) =>
          updateEstudiante(toEdit?.nroCedula ?? "", formData)
        }
      />
      {toDelete && (
        <DeleteModal
          isOpen
          onClose={() => setToDelete(null)}
          item={toDelete}
          title="¿Eliminar estudiante?"
          getItemName={(item) => `${item.primerNombre} ${item.primerApellido}`}
          onDeleteAction={deleteEstudiante}
          idKey="nroCedula"
        />
      )}
      <RepresentanteDetailModal representante={representante} error={detailError} loading={isDetailLoading} onClose={closeDetail} />
    </div>
  );
}
