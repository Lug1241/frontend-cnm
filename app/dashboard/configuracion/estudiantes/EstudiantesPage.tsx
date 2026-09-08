"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DataTable, { ColumnDef } from "@/app/components/ui/DataTable";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { MdPictureAsPdf } from "react-icons/md";
import { Estudiante } from "@/types/Estudiante";
import EstudianteModal from "./EstudianteModal";
import { createEstudiante, deleteEstudiante, updateEstudiante } from "./actions";

interface EstudiantesPageProps {
  initialEstudiantes: Estudiante[];
  initialSearch: string;
  currentPage: number;
  totalPages: number;
  errorMsg: string;
}

function documentStatus(path: string | null) {
  if (!path?.trim()) {
    return <span className="text-gray-400">No registrado</span>;
  }

  return (
    <span
      className="inline-flex max-w-32 items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap text-[#00408a]"
      title={path}
    >
      <MdPictureAsPdf className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>PDF registrado</span>
    </span>
  );
}

export default function EstudiantesPage({
  initialEstudiantes,
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEstudianteToEdit, setSelectedEstudianteToEdit] =
    useState<Estudiante | null>(null);
  const [selectedEstudianteToDelete, setSelectedEstudianteToDelete] =
    useState<Estudiante | null>(null);

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

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentQuery, pathname, router, searchParams, searchValue]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }

    const queryString = params.toString();
    startNavigation(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  const columns: ColumnDef<Estudiante>[] = [
    { header: "ID", accessorKey: "id" },
    { header: "Nro. cédula", accessorKey: "nroCedula" },
    { header: "Primer nombre", accessorKey: "primerNombre" },
    { header: "Segundo nombre", accessorKey: "segundoNombre" },
    { header: "Primer apellido", accessorKey: "primerApellido" },
    { header: "Segundo apellido", accessorKey: "segundoApellido" },
    {
      header: "Cédula PDF",
      cell: (estudiante) => documentStatus(estudiante.cedulaPdf),
    },
    { header: "Género", accessorKey: "genero" },
    { header: "Año de matrícula", accessorKey: "anioMatricula" },
    { header: "Jornada", accessorKey: "jornada" },
    { header: "Fecha de nacimiento", accessorKey: "fechaNacimiento" },
    { header: "Grupo étnico", accessorKey: "grupoEtnico" },
    { header: "Especialidad", accessorKey: "especialidad" },
    { header: "Nro. matrícula", accessorKey: "nroMatricula" },
    { header: "Nacionalidad", accessorKey: "nacionalidad" },
    { header: "IER", accessorKey: "ier" },
    {
      header: "Matrícula IER PDF",
      cell: (estudiante) => documentStatus(estudiante.matriculaIerPdf),
    },
    { header: "Dirección", accessorKey: "direccion" },
    { header: "Nivel", accessorKey: "nivel" },
    { header: "ID representante", accessorKey: "representanteId" },
    { header: "Cédula representante", accessorKey: "representanteCedula" },
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
          title="Estudiantes"
          description="Administra la información académica y personal de los estudiantes."
          data={initialEstudiantes}
          columns={columns}
          addLabel="Agregar estudiante"
          onAdd={() => setIsAddModalOpen(true)}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Buscar por nombre o cédula..."
          onEdit={setSelectedEstudianteToEdit}
          onDelete={setSelectedEstudianteToDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <EstudianteModal
        isOpen={isAddModalOpen || selectedEstudianteToEdit !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedEstudianteToEdit(null);
        }}
        estudianteToEdit={selectedEstudianteToEdit}
        onSaveAction={(formData) =>
            selectedEstudianteToEdit
              ? updateEstudiante(selectedEstudianteToEdit.nroCedula, formData)
            : createEstudiante(formData)
        }
      />

      {selectedEstudianteToDelete && (
        <DeleteModal
          isOpen
          onClose={() => setSelectedEstudianteToDelete(null)}
          item={selectedEstudianteToDelete}
          title="¿Eliminar estudiante?"
          getItemName={(estudiante) =>
            `${estudiante.primerNombre} ${estudiante.primerApellido}`
          }
          onDeleteAction={deleteEstudiante}
          idKey="nroCedula"
        />
      )}
    </div>
  );
}
