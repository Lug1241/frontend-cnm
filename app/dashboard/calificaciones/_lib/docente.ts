import { fetchAPI } from "@/lib/api";
import { Docente } from "@/types/Docente";

interface CurrentUser extends Docente {
  type: "docente" | "representante";
}

export async function getCurrentDocente(): Promise<Docente> {
  const usuario = await fetchAPI<CurrentUser>("/me", {
    cache: "no-store",
  });

  if (usuario.type !== "docente") {
    throw new Error("El usuario autenticado no es un docente.");
  }

  return usuario;
}