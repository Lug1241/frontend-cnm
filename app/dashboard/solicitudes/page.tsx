import { fetchAPI } from "@/lib/api";
import { cookies } from "next/headers";
import { decodificarToken } from "@/lib/auth";
import SolicitudPage from "./SolicitudPage";

export default async function SolicitudesRoute({
  searchParams,
}: {
  searchParams: Promise<{ fechaInicio?: string; fechaFin?: string }>;
}) {
  const params = await searchParams;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const decodedData = decodificarToken(token);
  const docenteId = decodedData?.nroCedula || decodedData?.id || "";
  console.log("Esta es el id ", docenteId);
  
  // Construir la query string para enviar al backend
  const query = new URLSearchParams();
  if (params.fechaInicio) query.set("fechaInicio", params.fechaInicio);
  if (params.fechaFin) query.set("fechaFin", params.fechaFin);
  if (docenteId) {
    query.set("cedula", docenteId);
  }

  let solicitudes = [];
  try {
    const res = await fetchAPI(`/solicitudes/docente/?${query.toString()}`);
    solicitudes = Array.isArray(res)
      ? res
      : res && typeof res === "object" && "data" in res && Array.isArray(res.data)
        ? res.data
        : [];
  } catch (error) {
    console.error("Error cargando solicitudes:", error);
  }

  return (
    <SolicitudPage
      solicitudes={solicitudes}
      fechaInicio={params.fechaInicio ?? ""}
      fechaFin={params.fechaFin ?? ""}
    />
  );
}