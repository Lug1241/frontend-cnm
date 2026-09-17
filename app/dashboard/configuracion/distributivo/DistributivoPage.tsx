"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import DataTable, { ColumnDef } from "@/app/components/ui/DataTable";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { type Asignacion } from "@/types/Asignacion";
import { createAsignacion, updateAsignacion, deleteAsignacion } from "./actions";
import AsignacionModal from "./AsignacionModal"; 

interface Periodo {
  id: number;
  descripcion: string;
}

interface Props {
  periodos: Periodo[];
  asignaciones: Asignacion[];
  docentesList: {id: number; primerNombre: string; primerApellido: string }[];
  materiasList: {id: number; nombre: string, nivel: string }[];
  currentPeriodo: string;
  currentGrupo: string;
  initialSearch: string;
  totalPages: number;
  currentPage: number;
}

export default function DistributivoPage({
  periodos,
  asignaciones,
  docentesList,
  materiasList,
  currentPeriodo,
  currentGrupo,
  initialSearch,
  totalPages,
  currentPage,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();
  
  const [searchValue, setSearchValue] = useState(initialSearch ?? "");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedToEdit, setSelectedToEdit] = useState<Asignacion | null>(null);
  const [selectedToDelete, setSelectedToDelete] = useState<Asignacion | null>(null);

  const currentQuery = searchParams.get("search") ?? "";

  // Efecto Debounce para la barra de búsqueda
  useEffect(() => {
    const normalizedSearch = searchValue.trim();
    if (normalizedSearch === currentQuery) return;

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (normalizedSearch) params.set("search", normalizedSearch);
      else params.delete("search");
      params.delete("page");

      startNavigation(() => {
        router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [currentQuery, pathname, router, searchParams, searchValue]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); 

    startNavigation(() => {
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));

    startNavigation(() => {
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    });
  };

  const columns: ColumnDef<Asignacion>[] = [
    { header: "Nivel", cell: (item) => item.materia?.nivel ?? "-" },
    { header: "Paralelo", accessorKey: "paralelo" },
    { header: "Docente", cell: (item) => `${item.docente?.primerNombre ?? ""} ${item.docente?.primerApellido ?? ""}` },
    { header: "Materia", cell: (item) => item.materia?.nombre ?? "-" },
    { header: "Días", cell: (item) => Array.isArray(item.dias) && item.dias.length > 0 ? item.dias.filter(Boolean).join("-") : "-" },
    { header: "Horario", cell: (item) => `${item.horaInicio} - ${item.horaFin}` },
    { header: "Cupos", accessorKey: "cupos" },
  ];

  return (
    <div className="space-y-4">
      {/* Contenedor con padding para separar del margen izquierdo y superior */}
      <div className="px-4 sm:px-6 pt-6 space-y-5">
        
        {/* Título y Descripción */}
        <div>
          <h1 className="text-2xl font-bold text-[#003366]">Distributivo</h1>
          <p className="text-gray-500 mt-1 text-sm">Gestión de la carga horaria y asignaciones académicas.</p>
        </div>

        {/* Filtros y botón superior agrupados en la misma fila */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Orden estricto: Búsqueda -> Periodo -> Grupo */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            
            {/* Buscador */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar por materia o docente."
                className="border border-gray-300 rounded text-sm pl-9 pr-3 py-2 w-64 focus:outline-none focus:border-[#003366]"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            <select 
              value={currentPeriodo} 
              onChange={(e) => updateFilter("periodo", e.target.value)}
              className="border border-gray-300 rounded text-sm px-3 py-2 min-w-[200px] focus:outline-none focus:border-[#003366]"
            >
              <option value="">Seleccione un periodo</option>
              {periodos.map((p) => (
                <option key={p.id} value={p.id.toString()}>{p.descripcion}</option>
              ))}
            </select>

            <select 
              value={currentGrupo} 
              onChange={(e) => updateFilter("grupo", e.target.value)}
              className="border border-gray-300 rounded text-sm px-3 py-2 min-w-[200px] focus:outline-none focus:border-[#003366]"
            >
              <option value="">Todos los grupos</option>
              <option value="BE">Básico Elemental</option>
              <option value="BM">Básico Medio</option>
              <option value="BS">Básico Superior</option>
              <option value="BCH">Bachillerato</option>
              <option value="Agr">Agrupaciones</option>
            </select>

            {!currentPeriodo && (
              <span className="text-red-500 text-sm">* Período requerido</span>
            )}
          </div>

          {/* Botón Agregar */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!currentPeriodo}
            title={!currentPeriodo ? "Seleccione un periodo académico primero" : ""}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              currentPeriodo 
                ? "bg-[#28a745] hover:bg-[#218838] text-white" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span>+</span> Agregar Curso
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className={isNavigating ? "pointer-events-none opacity-70 transition-opacity" : "transition-opacity"}>
        <DataTable
          data={asignaciones}
          columns={columns}
          onEdit={setSelectedToEdit}
          onDelete={setSelectedToDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      { 
      <AsignacionModal
        isOpen={isAddModalOpen || selectedToEdit !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedToEdit(null);
        }}
        asignacionToEdit={selectedToEdit}
        currentPeriodo={currentPeriodo}
        docentesList={docentesList}
        materiasList={materiasList}
        onSaveAction={async (id, formData) => {
          if (id) {
            return await updateAsignacion(id, formData);
          }
          return await createAsignacion(formData);
        }}
      /> 
      }

      {selectedToDelete && (
        <DeleteModal
          isOpen={!!selectedToDelete} 
          onClose={() => setSelectedToDelete(null)}
          item={selectedToDelete}
          title="¿Eliminar Curso?"
          getItemName={(item) => `${item.materia?.nombre} - ${item.paralelo}`}
          onDeleteAction={async (id) => {
            const result = await deleteAsignacion(String(id));

            if (result.success) {
              const paginaActual = Number(searchParams.get('page')) || 1;

              if (asignaciones.length === 1 && paginaActual > 1) {
                const nuevaPagina = paginaActual - 1;
                const nuevosParametros = new URLSearchParams(searchParams.toString());
                nuevosParametros.set('page', nuevaPagina.toString());

                router.push(`${pathname}?${nuevosParametros.toString()}`);
              } else {
                router.refresh();
              }
            }
            return result;
          }}
          idKey="id"
        />
      )}
    </div>
  );
}