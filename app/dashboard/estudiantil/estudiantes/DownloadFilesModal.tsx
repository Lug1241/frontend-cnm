"use client";

import { useState } from "react";
import { NIVELES_ESTUDIANTE } from "@/types/Estudiante";

const FILE_GROUPS = [
  ["cedulas-representantes", "Cédulas de representantes"],
  ["croquis", "Croquis"],
  ["cedulas-estudiantes", "Cédulas de estudiantes"],
  ["matriculas-ier", "Matrículas IER"],
] as const;

interface DownloadFilesModalProps {
  initialLevel: string;
  onClose: () => void;
}

export default function DownloadFilesModal({
  initialLevel,
  onClose,
}: DownloadFilesModalProps) {
  const [level, setLevel] = useState(initialLevel);
  const [fileType, setFileType] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const download = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsDownloading(true);

    try {
      const query = new URLSearchParams({ nivel: level, tipo: fileType });
      const response = await fetch(
        `/api/estudiantes/archivos?${query.toString()}`,
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(
          data.message || "No se pudieron descargar los archivos.",
        );
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") ?? "";
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const filename = match?.[1] ?? "archivos-estudiantes.zip";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      onClose();
    } catch (downloadError: unknown) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "No se pudieron descargar los archivos.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-center text-xl font-bold text-gray-800">
            Descargar archivos
          </h3>
        </div>
        <form onSubmit={download} className="space-y-5 p-6">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
            Nivel de los estudiantes
            <select
              aria-label="Nivel de los estudiantes"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              required
              className="rounded-md border border-gray-300 bg-white px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-[#00408a]"
            >
              <option value="" disabled>
                Selecciona un nivel
              </option>
              {NIVELES_ESTUDIANTE.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
            Grupo de archivos
            <select
              aria-label="Grupo de archivos"
              value={fileType}
              onChange={(event) => setFileType(event.target.value)}
              required
              className="rounded-md border border-gray-300 bg-white px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-[#00408a]"
            >
              <option value="" disabled>
                Selecciona un grupo
              </option>
              {FILE_GROUPS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isDownloading}
              className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isDownloading ? "Preparando ZIP..." : "Descargar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isDownloading}
              className="rounded-md bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
