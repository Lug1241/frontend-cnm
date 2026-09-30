"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DataTable, { ColumnDef } from "@/app/components/ui/DataTable";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { type Asignacion } from "@/types/Asignacion";
import AsignacionModal from "@/app/dashboard/configuracion/distributivo/AsignacionModal";
import {
  createAsignacionIndividual,
  deleteAsignacionIndividual,
  updateAsignacionIndividual,
} from "./actions";

interface Periodo {
  id: number;
  descripcion: string;
}

type IndividualRow = Asignacion & {
  estudiante?: {
    primerNombre?: string;
    primerApellido?: string;
  };
};

interface Props {
  periodos: Periodo[];
  asignaciones: IndividualRow[];
  docentesList: { id: number; primerNombre: string; primerApellido: string }[];
  materiasList: { id: number; nombre: string; nivel: string }[];
  currentPeriodo: string;
  currentNivel: string;
  initialSearch: string;
  totalPages: number;
  currentPage: number;
  isTeacher: boolean;
  errorMsg: string;
}

export default function DistributivoIndividualPage({
  periodos,
  asignaciones,
  docentesList,
  materiasList,
  currentPeriodo,
  currentNivel,
  initialSearch,
  totalPages,
  currentPage,
  isTeacher,
  errorMsg,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToEdit, setSelectedToEdit] = useState<IndividualRow | null>(null);
  const [selectedToDelete, setSelectedToDelete] = useState<IndividualRow | null>(null);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startNavigation(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
  };

  useEffect(() => {
    if (isTeacher) return;
    const normalizedSearch = searchValue.trim();
    if (normalizedSearch === (searchParams.get("search") ?? "")) return;

    const timeoutId = window.setTimeout(() => updateFilter("search", normalizedSearch), 350);
    return () => window.clearTimeout(timeoutId);
  }, [isTeacher, searchParams, searchValue]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    startNavigation(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
  };

  const columns: ColumnDef<IndividualRow>[] = [
    { header: "Nivel", cell: (item) => item.materia?.nivel ?? "-" },
    { header: "Materia", cell: (item) => item.materia?.nombre ?? "-" },
    { header: "Docente", cell: (item) => `${item.docente?.primerNombre ?? ""} ${item.docente?.primerApellido ?? ""}` },
    { header: "Paralelo", accessorKey: "paralelo" },
    { header: "Días", cell: (item) => item.dias?.filter(Boolean).join("-") || "-" },
    { header: "Horario", cell: (item) => `${item.horaInicio} - ${item.horaFin}` },
    { header: "Cupos", accessorKey: "cupos" },
    ...(isTeacher
      ? [{ header: "Estudiante", cell: (item: IndividualRow) => `${item.estudiante?.primerNombre ?? ""} ${item.estudiante?.primerApellido ?? ""}` || "-" }]
      : []),
  ];

  return (
    <div className="space-y-4">
      {errorMsg && <div className="m-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMsg}</div>}

      <div className="px-4 pt-6 sm:px-6">
        <h1 className="text-2xl font-bold text-[#003366]">Distributivo individual</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isTeacher ? "Consulta de las materias individuales asignadas." : "Gestión de asignaciones individuales."}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <select
            value={currentPeriodo}
            onChange={(event) => updateFilter("periodo", event.target.value)}
            className="min-w-[210px] rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Seleccione un período</option>
            {periodos.map((periodo) => <option key={periodo.id} value={periodo.id}>{periodo.descripcion}</option>)}
          </select>

          {!isTeacher && (
            <>
              <select
                value={currentNivel}
                onChange={(event) => updateFilter("nivel", event.target.value)}
                className="min-w-[210px] rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Todos los niveles</option>
                <option value="1ro Básico Elemental">1ro Básico Elemental</option>
                <option value="2do Básico Elemental">2do Básico Elemental</option>
                <option value="1ro Básico Medio">1ro Básico Medio</option>
                <option value="2do Básico Medio">2do Básico Medio</option>
                <option value="3ro Básico Medio">3ro Básico Medio</option>
                <option value="1ro Básico Superior">1ro Básico Superior</option>
                <option value="2do Básico Superior">2do Básico Superior</option>
                <option value="3ro Básico Superior">3ro Básico Superior</option>
                <option value="1ro Bachillerato">1ro Bachillerato</option>
                <option value="2do Bachillerato">2do Bachillerato</option>
                <option value="3ro Bachillerato">3ro Bachillerato</option>
              </select>
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar materia o docente"
                className="w-64 rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={!currentPeriodo}
                className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300"
              >
                + Agregar curso
              </button>
            </>
          )}
        </div>
      </div>

      <div className={isNavigating ? "pointer-events-none opacity-70" : ""}>
        <DataTable
          data={asignaciones}
          columns={columns}
          onEdit={isTeacher ? undefined : setSelectedToEdit}
          onDelete={isTeacher ? undefined : setSelectedToDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {!isTeacher && (
        <>
          <AsignacionModal
            isOpen={isModalOpen || selectedToEdit !== null}
            onClose={() => { setIsModalOpen(false); setSelectedToEdit(null); }}
            asignacionToEdit={selectedToEdit}
            currentPeriodo={currentPeriodo}
            docentesList={docentesList}
            materiasList={materiasList}
            onSaveAction={(id, formData) => id
              ? updateAsignacionIndividual(id, formData)
              : createAsignacionIndividual(formData)}
          />
          {selectedToDelete && (
            <DeleteModal
              isOpen
              onClose={() => setSelectedToDelete(null)}
              item={selectedToDelete}
              title="¿Eliminar asignación individual?"
              getItemName={(item) => `${item.materia?.nombre ?? "Materia"} - ${item.paralelo}`}
              onDeleteAction={async (id) => {
                const result = await deleteAsignacionIndividual(id);
                if (result.success) router.refresh();
                return result;
              }}
              idKey="id"
            />
          )}
        </>
      )}
    </div>
  );
}
