"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Periodo, Asignacion } from "./page";
import TablaDistributivo from "./TablaDistributivo"; 

interface Props {
  periodos: Periodo[];
  asignaciones: Asignacion[];
  currentPeriodo: string;
  currentGrupo: string;
  totalPages: number;
  currentPage: number;
}

export default function DistributivoClient({
  periodos,
  asignaciones,
  currentPeriodo,
  currentGrupo,
  totalPages,
  currentPage,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    if (key !== "page") {
      params.set("page", "1");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
        {!currentPeriodo && (
            <p className="text-red-500 text-sm mb-2">* Se requiere seleccionar un periodo académico</p>
        )}
      {/* Contenedor de Filtros */}
      <div className="flex gap-4 items-center mb-4">
        <select 
          value={currentPeriodo} 
          onChange={(e) => updateFilter("periodo", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Seleccione un periodo</option>
          {periodos.map((p) => (
            <option key={p.id} value={p.id.toString()}>
              {p.descripcion}
            </option>
          ))}
        </select>

        <select 
          value={currentGrupo} 
          onChange={(e) => updateFilter("grupo", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Selecciona un grupo</option>
          <option value="BE">Básico Elemental</option>
          <option value="BM">Básico Medio</option>
          <option value="BS">Básico Superior</option>
          <option value="BCH">Bachillerato</option>
          <option value="Agr">Agrupaciones</option>
        </select>

        <input 
          type="text"
          placeholder="Filtrar por materia..."
          defaultValue={searchParams.get("search")?.toString() || ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="border p-2 rounded w-64"
        />
      </div>

      {/* Tabla */}
      {<TablaDistributivo asignaciones={asignaciones} />}
      
      {/* Paginación */}
      <div className="flex gap-2 items-center justify-end mt-4">
        <button 
          disabled={currentPage <= 1}
          onClick={() => updateFilter("page", (currentPage - 1).toString())}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
        >
          Anterior
        </button>
        
        <div className="flex items-center gap-2 text-sm">
          <span>Página</span>
          <select
            value={currentPage}
            onChange={(e) => updateFilter("page", e.target.value)}
            className="border p-1 rounded bg-white"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <span>de {totalPages}</span>
        </div>

        <button 
          disabled={currentPage >= totalPages}
          onClick={() => updateFilter("page", (currentPage + 1).toString())}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}