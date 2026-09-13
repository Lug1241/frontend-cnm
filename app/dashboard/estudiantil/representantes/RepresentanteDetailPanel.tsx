"use client";

import { MdOutlineEdit } from "react-icons/md";
import { ArchivoPdfLink } from "@/app/components/ui/ArchivoPdf";
import { type Representante } from "@/types/Representante";

interface RepresentanteDetailPanelProps {
  representante: Representante;
  onEdit: () => void;
}

export default function RepresentanteDetailPanel({
  representante,
  onEdit,
}: RepresentanteDetailPanelProps) {
  const rows: [string, React.ReactNode][] = [
    ["Cédula", representante.nroCedula],
    ["Nombres", `${representante.primerNombre} ${representante.segundoNombre}`],
    [
      "Apellidos",
      `${representante.primerApellido} ${representante.segundoApellido}`,
    ],
    ["Correo", representante.email],
    ["Celular", representante.celular],
    ["Convencional", representante.convencional],
    ["Emergencia", representante.emergencia],
    [
      "Cédula PDF",
      <ArchivoPdfLink key="cedula" ruta={representante.cedulaPdf} />,
    ],
    [
      "Croquis PDF",
      <ArchivoPdfLink key="croquis" ruta={representante.croquisPdf} />,
    ],
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">
          <h3 className="text-lg font-bold text-[#00408a]">
            Información del representante
          </h3>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <MdOutlineEdit className="h-5 w-5" />
            Editar representante
          </button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="border-b border-gray-100 px-5 py-4 sm:border-r"
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
              </dt>
              <dd className="mt-1 break-words text-sm font-medium text-gray-900">
                {value || "No registrado"}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
