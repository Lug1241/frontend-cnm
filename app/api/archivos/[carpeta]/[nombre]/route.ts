import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const CARPETAS = ["Estudiantes", "Representantes"] as const;

export async function GET(
  _request: Request,
  context: { params: Promise<{ carpeta: string; nombre: string }> },
) {
  const { carpeta, nombre } = await context.params;

  if (
    !CARPETAS.includes(carpeta as (typeof CARPETAS)[number]) ||
    !nombre.toLowerCase().endsWith(".pdf")
  ) {
    return NextResponse.json(
      { message: "Archivo no válido." },
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

  const response = await fetch(
    `${apiUrl}/archivos/${encodeURIComponent(carpeta)}/${encodeURIComponent(nombre)}`,
    { headers, cache: "no-store" },
  );

  if (!response.ok || !response.body) {
    return NextResponse.json(
      { message: "No se pudo descargar el archivo." },
      { status: response.status },
    );
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/pdf",
      "Content-Disposition":
        response.headers.get("content-disposition") ??
        `attachment; filename="${nombre}"`,
    },
  });
}
