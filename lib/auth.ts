export function decodificarToken(token: string | undefined) {
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    
    const jsonPayload = typeof window !== "undefined"
      ? atob(payloadBase64)
      : Buffer.from(payloadBase64, "base64").toString("utf-8");

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
}