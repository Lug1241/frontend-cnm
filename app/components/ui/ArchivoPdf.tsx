import { MdDownload, MdOutlineAttachFile } from "react-icons/md";

interface ArchivoPdfLinkProps {
  ruta?: string | null;
  emptyLabel?: string;
}

interface ArchivoPdfInputProps {
  name: string;
  label: string;
  rutaActual?: string | null;
}

function datosArchivo(ruta?: string | null) {
  const partes = ruta?.replace(/\\/g, "/").split("/").filter(Boolean) ?? [];
  const nombre = partes.at(-1);
  const carpeta = partes.at(-2);

  if (!nombre || (carpeta !== "Estudiantes" && carpeta !== "Representantes")) {
    return null;
  }

  return {
    nombre,
    href: `/api/archivos/${encodeURIComponent(carpeta)}/${encodeURIComponent(nombre)}`,
  };
}

export function ArchivoPdfLink({
  ruta,
  emptyLabel = "No registrado",
}: ArchivoPdfLinkProps) {
  const archivo = datosArchivo(ruta);
  if (!archivo) return <span className="text-gray-500">{emptyLabel}</span>;

  return (
    <span className="flex min-w-0 items-center gap-2">
      <MdOutlineAttachFile className="h-5 w-5 shrink-0 text-gray-500" />
      <span className="min-w-0 flex-1 truncate" title={archivo.nombre}>
        {archivo.nombre}
      </span>
      <a
        href={archivo.href}
        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
        download
      >
        <MdDownload className="h-4 w-4" />
        Descargar
      </a>
    </span>
  );
}

export function ArchivoPdfInput({
  name,
  label,
  rutaActual,
}: ArchivoPdfInputProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
      {label}
      {rutaActual && (
        <span className="rounded-md border border-gray-200 bg-gray-50 p-2 font-normal">
          <ArchivoPdfLink ruta={rutaActual} />
        </span>
      )}
      <input
        type="file"
        name={name}
        accept="application/pdf,.pdf"
        className="rounded-md border border-gray-300 bg-white px-3 py-2 font-normal file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-[#00408a]"
      />
      <span className="text-xs font-normal text-gray-500">
        PDF de hasta 5 MB
        {rutaActual ? ". Déjalo vacío para conservar el actual." : "."}
      </span>
    </label>
  );
}
