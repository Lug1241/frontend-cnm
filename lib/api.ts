import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const headers = new Headers(options.headers);
  
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }


  const url = `${API_URL}${endpoint}`;
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error: unknown) {
    console.error("🔥 ERROR FATAL DE RED EN NEXT.JS 🔥");
    console.error("Intentando conectar a:", url);
    console.error("Mensaje general:", (error as Error).message);
    console.error("Causa real (Node cause):", (error as Error).cause);
    console.error("=========================================");
    
    throw new Error("El servidor de Next.js falló al conectar");
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    const errorData = await response.json().catch(() => ({}));
    console.error("🔥 RESPUESTA DE ERROR DEL BACKEND:", JSON.stringify(errorData, null, 2));
    throw new Error(errorData.message || `Error ${response.status}: Error interno del servidor`);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}