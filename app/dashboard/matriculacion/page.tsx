import MatriculacionRoute from "./MatriculacionRoute";

export const dynamic = "force-dynamic";

export default async function MatriculacionPage() {
  return <MatriculacionRoute tipoInicial="grupales" />;
}