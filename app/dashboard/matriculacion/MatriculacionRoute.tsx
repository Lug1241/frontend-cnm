import { fetchAPI } from "@/lib/api";
import { PeriodoAcademico } from "@/types/PeriodoAcademico";
import MatriculacionClient from "./MatriculacionClient";

export const dynamic = "force-dynamic";

export default async function MatriculacionRoute({
  tipoInicial,
}: {
  tipoInicial: "grupales" | "individuales";
}) {
  let periodoActivo: PeriodoAcademico | null = null;

  try {
    const response = await fetchAPI<{ data: PeriodoAcademico[] }>(
      "/periodo_academico/obtener",
    );
    periodoActivo = response.data?.find((periodo) => periodo.estado === "Activo") ?? null;
  } catch (error) {
    console.error("Error cargando el período académico:", error);
  }

  return (
    <main className="w-full">
      <MatriculacionClient periodoActivo={periodoActivo} tipoInicial={tipoInicial} />
    </main>
  );
}
