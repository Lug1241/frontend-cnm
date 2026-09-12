import { fetchAPI } from "@/lib/api";
import DistributivoClient from "./DistributivoClient";

export interface Asignacion {
  id?: number;
  paralelo: string;
  horaInicio: string;
  horaFin: string;
  cupos: number;
  dias: string[];
  materia: {
    nombre: string;
    nivel: string;
  };
  docente: {
    primerNombre: string;
    primerApellido: string;
  };
}

export interface Periodo {
  id: number;
  descripcion: string;
}

export default async function DistributivoPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; grupo?: string; page?: string; search?: string }>;
}) {
    const params = await searchParams;
    const periodo = params.periodo || "";
    const grupo = params.grupo || "";
    const page = Number(params.page) || 1;
    const search = params.search || "";

  let periodos: Periodo[] = [];
  try {
    const res = (await fetchAPI("/periodo_academico/obtener")) as {
      data?: Periodo[];
    };
    periodos = res.data || [];
  } catch (error) {
    console.error("Error cargando periodos:", error);
  }

  let asignaciones: Asignacion[] = [];
  let totalPages = 1;
  const ITEMS_PER_PAGE = 10;

  if (periodo) {
    if (grupo) {
      const gruposDict: Record<string, string[]> = {
        "BE": ["1ro BE", "2do BE"],
        "BM": ["1ro BM", "2do BM", "3ro BM"],
        "BS": ["1ro BS", "2do BS", "3ro BS"],
        "BCH": ["1ro BCH", "2do BCH", "3ro BCH"],
        "Agr": ["BM", "BS", "BCH", "BS BCH", "BE", "BM BS", "BM BS BCH"],
      };
      
      const niveles = gruposDict[grupo] || [];
      
      try {
        const resultados = await Promise.all(
          niveles.map((nivel) =>
            fetchAPI(`/asignaciones/nivel/${encodeURIComponent(nivel)}/${periodo}`)
          )
        );
        
        let combinados = resultados.flatMap((r: any) => r.data || r);
        
        if (search) {
          const searchLower = search.toLowerCase();
          combinados = combinados.filter((item: any) => 
            JSON.stringify(item).toLowerCase().includes(searchLower)
          );
        }

        const total = combinados.length;
        totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
        
        const start = (page - 1) * ITEMS_PER_PAGE;
        asignaciones = combinados.slice(start, start + ITEMS_PER_PAGE);

      } catch (error) {
        console.error("Error obteniendo asignaciones por grupo:", error);
      }

    } else {
      try {
        const res = (await fetchAPI(
          `/asignaciones/obtener/periodo/${periodo}?page=${page}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(search)}`
        )) as { data?: Asignacion[]; totalRows?: number };
        
        asignaciones = res.data || [];
        const totalRows = res.totalRows || asignaciones.length; 
        totalPages = Math.max(1, Math.ceil(totalRows / ITEMS_PER_PAGE));
        
        console.log(asignaciones[0]);

      } catch (error) {
        console.error("Error obteniendo asignaciones por periodo:", error);
      }
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Distributivo de Cursos</h1>
      
      { <DistributivoClient 
        periodos={periodos} 
        asignaciones={asignaciones} 
        currentPeriodo={periodo}
        currentGrupo={grupo}
        totalPages={totalPages}
        currentPage={page}
      /> }
    </div>
  );
}