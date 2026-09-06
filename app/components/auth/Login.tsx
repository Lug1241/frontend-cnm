"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [type, setType] = useState<"representante" | "docente">(
    "representante",
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nroCedula: cedula,
          password: password,
          type: type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al verificar credenciales");
      }

      document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
      document.cookie = `type=${data.type}; path=/; max-age=86400; SameSite=Strict`;

      if (data.rol) {
        document.cookie = `rol=${data.rol}; path=/; max-age=86400; SameSite=Strict`;
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full min-h-[calc(100vh-10rem)] p-4 sm:p-8 gap-8 md:gap-16">
      <div className="flex flex-col items-center text-center max-w-md w-full">
        <Image
          src="/ConservatorioNacional.png"
          alt="Conservatorio Nacional de Música"
          width={256}
          height={256}
          className="w-48 sm:w-64 h-auto mb-6 object-contain"
          priority
        />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#00408a]">
          SISTEMA DE GESTIÓN ESTUDIANTIL
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md border border-gray-100">
        <h3 className="text-xl sm:text-2xl font-bold text-center text-[#00408a] mb-6">
          Iniciar Sesión
        </h3>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-gray-800 text-sm sm:text-base">
              Perfil de Ingreso
            </span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                <input
                  type="radio"
                  name="type"
                  value="representante"
                  checked={type === "representante"}
                  onChange={(e) =>
                    setType(e.target.value as "representante" | "docente")
                  }
                  className="w-4 h-4 text-[#00408a] accent-[#00408a]"
                />
                Representante
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                <input
                  type="radio"
                  name="type"
                  value="docente"
                  checked={type === "docente"}
                  onChange={(e) =>
                    setType(e.target.value as "representante" | "docente")
                  }
                  className="w-4 h-4 text-[#00408a] accent-[#00408a]"
                />
                Docente
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800 text-sm sm:text-base">
              Cédula o Pasaporte
            </label>
            <input
              type="text"
              placeholder="Cédula"
              maxLength={10}
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00408a]"
              required
            />
            <span className="text-xs text-gray-500">Máximo 10 números</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800 text-sm sm:text-base">
              Contraseña
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 pr-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00408a]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 rounded-md transition-colors mt-2 text-sm sm:text-base shadow-sm flex justify-center items-center gap-2 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#4CAF50] hover:bg-[#43a047] cursor-pointer"
            }`}
          >
            {isLoading ? "Iniciando sesión..." : "Ingresar"}
          </button>

          <div className="text-center mt-2">
            <a
              href="#"
              className="text-[#00408a] hover:underline text-xs sm:text-sm"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
