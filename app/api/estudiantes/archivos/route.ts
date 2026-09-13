import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NIVELES_ESTUDIANTE } from "@/types/Estudiante";

const FILE_TYPES = [
  "cedulas-representantes",
  "croquis",
  "cedulas-estudiantes",
  "matriculas-ier",
] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("nivel") ?? "";
  const type = searchParams.get("tipo") ?? "";

  if (
    !NIVELES_ESTUDIANTE.includes(
      level as (typeof NIVELES_ESTUDIANTE)[number],
    ) ||
    !FILE_TYPES.includes(type as (typeof FILE_TYPES)[number])
  ) {
    return NextResponse.json(
      { message: "Selecciona un nivel y un tipo de archivo válidos." },
      { status: 400 },
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { message: "La URL del backend no está configurada." },
      { status: 500 },
    );
  }

  const token = (await cookies()).get("token")?.value;
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const backendResponse = await fetch(
    `${apiUrl}/estudiantes/archivos/${encodeURIComponent(level)}/${encodeURIComponent(type)}`,
    { headers, cache: "no-store" },
  );

  if (!backendResponse.ok || !backendResponse.body) {
    const error = (await backendResponse.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const message = Array.isArray(error.message)
      ? error.message.join(". ")
      : error.message || "No se pudieron descargar los archivos.";
    return NextResponse.json({ message }, { status: backendResponse.status });
  }

  return new Response(backendResponse.body, {
    status: 200,
    headers: {
      "Content-Type":
        backendResponse.headers.get("content-type") ?? "application/zip",
      "Content-Disposition":
        backendResponse.headers.get("content-disposition") ??
        'attachment; filename="archivos-estudiantes.zip"',
    },
  });
}
