import { cookies } from "next/headers";
import { fetchAPI } from "@/lib/api";
import { decodificarToken } from "@/lib/auth";
import { PeriodoAcademico } from "@/types/PeriodoAcademico";
import { UserType } from "@/app/config/menu.config";
import MatriculacionClient from "./MatriculacionClient";
import {
  obtenerEstadoPeriodoMatriculaAction,
  verificarDocumentosRepresentanteAction,
  obtenerEstudiantesRepresentanteAction,
  EstadoPeriodoMatricula,
  VerificacionDocsRepresentante,
  EstudianteRepresentanteItem,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function MatriculacionRoute({
  tipoInicial,
}: {
  tipoInicial: "grupales" | "individuales";
}) {
  const cookieStore = await cookies();
  const typeCookie = cookieStore.get("type");
  const userType = (typeCookie?.value as UserType) || "representante";
  const token = cookieStore.get("token")?.value;
  const decoded = decodificarToken(token);
  const nroCedula = decoded?.nroCedula || decoded?.id || "";

  let periodoActivo: PeriodoAcademico | null = null;
  let estadoPeriodoMatricula: EstadoPeriodoMatricula | null = null;
  let verificacionDocsRepresentante: VerificacionDocsRepresentante | null = null;
  let estudiantesRepresentante: EstudianteRepresentanteItem[] = [];

  try {
    const response = await fetchAPI<{ data: PeriodoAcademico[] }>(
      "/periodo_academico/obtener",
    );
    periodoActivo =
      response.data?.find((periodo) => periodo.estado === "Activo") ?? null;
  } catch (error) {
    console.error("Error cargando el período académico:", error);
  }

  if (userType === "representante") {
    const [estadoPeriodoRes, docsRes, estudiantesRes] = await Promise.all([
      obtenerEstadoPeriodoMatriculaAction(),
      nroCedula
        ? verificarDocumentosRepresentanteAction(nroCedula)
        : Promise.resolve({ success: false, data: undefined }),
      nroCedula
        ? obtenerEstudiantesRepresentanteAction(nroCedula)
        : Promise.resolve({ success: true, data: [] }),
    ]);

    if (estadoPeriodoRes.success && estadoPeriodoRes.data) {
      estadoPeriodoMatricula = estadoPeriodoRes.data;
    }
    if (docsRes.success && docsRes.data) {
      verificacionDocsRepresentante = docsRes.data;
    }
    if (estudiantesRes.success) {
      estudiantesRepresentante = estudiantesRes.data;
    }
  }

  return (
    <main className="w-full">
      <MatriculacionClient
        periodoActivo={periodoActivo}
        tipoInicial={tipoInicial}
        userType={userType}
        estadoPeriodoMatricula={estadoPeriodoMatricula}
        verificacionDocsRepresentante={verificacionDocsRepresentante}
        estudiantesRepresentante={estudiantesRepresentante}
      />
    </main>
  );
}

