"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MdClose, MdDownload, MdOutlineVisibility } from "react-icons/md";
import DataTable, { type ColumnDef } from "@/app/components/ui/DataTable";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { NIVELES_ESTUDIANTE, type Estudiante } from "@/types/Estudiante";
import { type Representante } from "@/types/Representante";
import RepresentanteModal from "../representantes/RepresentanteModal";
import { updateRepresentante } from "../representantes/actions";
import DownloadFilesModal from "./DownloadFilesModal";
import EstudianteDetailPanel from "./EstudianteDetailPanel";
import EstudianteModal from "./EstudianteModal";
import {
  deleteEstudiante,
  getRepresentanteDetail,
  updateEstudiante,
} from "./actions";

type ActiveTab = "students" | "detail";

interface EstudiantesPageProps {
  initialEstudiantes: Estudiante[];
  representantes: Representante[];
  initialSearch: string;
  initialLevel: string;
  currentPage: number;
  totalPages: number;
  errorMsg: string;
}

export default function EstudiantesPage({
  initialEstudiantes,
  representantes,
  initialSearch,
  initialLevel,
  currentPage,
  totalPages,
  errorMsg,
}: EstudiantesPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState<ActiveTab>("students");
  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(
    null,
  );
  const [toEdit, setToEdit] = useState<Estudiante | null>(null);
  const [representativeToEdit, setRepresentativeToEdit] =
    useState<Representante | null>(null);
  const [toDelete, setToDelete] = useState<Estudiante | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [representante, setRepresentante] = useState<Representante | null>(
    null,
  );
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
    {
      header: "Nombre",
      cell: (item) => `${item.primerNombre} ${item.segundoNombre}`,
    },
    {
      header: "Apellido",
      cell: (item) => `${item.primerApellido} ${item.segundoApellido}`,
    },
    { header: "Jornada", accessorKey: "jornada" },
    { header: "Especialidad", accessorKey: "especialidad" },
    { header: "Nivel", accessorKey: "nivel" },
  ];

  const changeLevel = (level: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (level) params.set("nivel", level);
    else params.delete("nivel");
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
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    const query = params.toString();
    startNavigation(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const loadRepresentative = async (student: Estudiante) => {
    setRepresentante(null);
    setDetailError(undefined);
    setIsDetailLoading(true);
    const result = await getRepresentanteDetail(student.representanteCedula);
    setIsDetailLoading(false);
    if (result.success && result.data) setRepresentante(result.data);
    else setDetailError(result.error);
  };

  const showStudentDetails = (student: Estudiante) => {
    setSelectedStudent(student);
    setActiveTab("detail");
    void loadRepresentative(student);
  };

  const closeStudentDetails = () => {
    setActiveTab("students");
    setSelectedStudent(null);
    setRepresentante(null);
    setDetailError(undefined);
    setIsDetailLoading(false);
  };

  return (
    <div className="min-h-full bg-white">
      <div
        className="flex min-h-12 items-end gap-1 overflow-x-auto border-b border-gray-200 bg-gray-50 px-4 pt-3 sm:px-6 lg:px-8"
        role="tablist"
        aria-label="Vistas de estudiantes"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "students"}
          onClick={() => setActiveTab("students")}
          className={`rounded-t-md border px-5 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "students"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Estudiantes
        </button>
        {selectedStudent && (
          <div
            className={`flex items-center rounded-t-md border text-sm font-semibold ${
              activeTab === "detail"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-200 bg-white text-gray-700"
            }`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "detail"}
              onClick={() => setActiveTab("detail")}
              className="px-4 py-2.5"
            >
              {selectedStudent.primerNombre} {selectedStudent.primerApellido}
            </button>
            <button
              type="button"
              onClick={closeStudentDetails}
              className="mr-2 rounded p-1 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-white"
              title="Cerrar pestaña"
              aria-label={`Cerrar información de ${selectedStudent.primerNombre} ${selectedStudent.primerApellido}`}
            >
              <MdClose className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-6 lg:m-8 lg:mb-0">
          ⚠️ {errorMsg}
        </div>
      )}

      {activeTab === "students" && (
        <div className={isNavigating ? "pointer-events-none opacity-70" : ""}>
          <DataTable
            title="Estudiantes"
            description="Consulta y administra la información relevante de los estudiantes."
            data={initialEstudiantes}
            columns={columns}
            addLabel="Registrar estudiante"
            onAdd={() =>
              router.push("/dashboard/estudiantil/registro-estudiantes")
            }
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Buscar por nombre o cédula..."
            customFilters={
              <>
                <select
                  value={initialLevel}
                  onChange={(event) => changeLevel(event.target.value)}
                  aria-label="Filtrar estudiantes por nivel"
                  className="order-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00408a] sm:w-64"
                >
                  <option value="">Todos los niveles</option>
                  {NIVELES_ESTUDIANTE.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsDownloadOpen(true)}
                  className="order-3 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
                >
                  <MdDownload className="h-5 w-5" />
                  Descargar archivos
                </button>
              </>
            }
            onEdit={setToEdit}
            onDelete={setToDelete}
            renderActions={(item) => (
              <button
                type="button"
                onClick={() => showStudentDetails(item)}
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

      {activeTab === "detail" && selectedStudent && (
        <EstudianteDetailPanel
          estudiante={selectedStudent}
          representante={representante}
          representativeError={detailError}
          representativeLoading={isDetailLoading}
          onEditStudent={() => setToEdit(selectedStudent)}
          onEditRepresentative={() => {
            if (representante) setRepresentativeToEdit(representante);
          }}
        />
      )}

      <EstudianteModal
        estudiante={toEdit}
        representantes={representantes}
        onClose={() => setToEdit(null)}
        onSaveAction={(formData) =>
          updateEstudiante(toEdit?.nroCedula ?? "", formData)
        }
      />

      <RepresentanteModal
        isOpen={Boolean(representativeToEdit)}
        representanteToEdit={representativeToEdit}
        onClose={() => setRepresentativeToEdit(null)}
        onSaveAction={async (cedula, formData) => {
          if (!cedula) {
            return {
              success: false,
              error: "No se identificó al representante.",
            };
          }
          const result = await updateRepresentante(cedula, formData);
          if (result.success && selectedStudent) {
            await loadRepresentative(selectedStudent);
          }
          return result;
        }}
      />

      {isDownloadOpen && (
        <DownloadFilesModal
          initialLevel={initialLevel}
          onClose={() => setIsDownloadOpen(false)}
        />
      )}

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
    </div>
  );
}
