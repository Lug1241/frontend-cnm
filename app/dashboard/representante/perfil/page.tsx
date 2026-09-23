import { redirect } from "next/navigation";
import { getCurrentRepresentante } from "@/app/dashboard/estudiantil/representantes/actions";
import RepresentantePerfil from "./RepresentantePerfil";

export default async function PerfilRepresentantePage() {
  const result = await getCurrentRepresentante();

  if (!result.success) {
    if (result.error === "UNAUTHORIZED") {
      redirect("/");
    }

    return (
      <div className="m-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {result.error ?? "No se pudo cargar la información del representante."}
      </div>
    );
  }

  if (!result.data) {
    return (
      <div className="m-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        No se encontró información del representante.
      </div>
    );
  }

  return <RepresentantePerfil initialRepresentante={result.data} />;
}