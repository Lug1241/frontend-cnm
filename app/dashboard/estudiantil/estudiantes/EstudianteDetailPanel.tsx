"use client";

import { MdOutlineEdit } from "react-icons/md";
import { type Estudiante } from "@/types/Estudiante";
import { type Representante } from "@/types/Representante";

interface EstudianteDetailPanelProps {
  estudiante: Estudiante;
  representante: Representante | null;
  representativeError?: string;
  representativeLoading: boolean;
  onEditStudent: () => void;
  onEditRepresentative: () => void;
}

function DetailSection({
  title,
  rows,
  onEdit,
  editLabel,
}: {
  title: string;
  rows: [string, React.ReactNode][];
  onEdit: () => void;
  editLabel: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">
        <h3 className="text-lg font-bold text-[#00408a]">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <MdOutlineEdit className="h-5 w-5" />
          {editLabel}
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
  );
}

export default function EstudianteDetailPanel({
  estudiante,
  representante,
  representativeError,
  representativeLoading,
  onEditStudent,
  onEditRepresentative,
}: EstudianteDetailPanelProps) {
  const studentRows: [string, React.ReactNode][] = [
    ["Cédula/Pasaporte", estudiante.nroCedula],
    ["Nombres", `${estudiante.primerNombre} ${estudiante.segundoNombre}`],
    ["Apellidos", `${estudiante.primerApellido} ${estudiante.segundoApellido}`],
    ["Fecha de nacimiento", estudiante.fechaNacimiento?.slice(0, 10)],
    ["Género", estudiante.genero],
    ["Grupo étnico", estudiante.grupoEtnico],
    ["Nacionalidad", estudiante.nacionalidad],
    ["Dirección", estudiante.direccion],
    ["Jornada", estudiante.jornada],
    ["Nivel", estudiante.nivel],
    ["Especialidad", estudiante.especialidad],
    ["Institución educativa", estudiante.ier],
    ["Año de matrícula", estudiante.anioMatricula],
    ["Nro. matrícula", estudiante.nroMatricula],
    ["Cédula PDF", estudiante.cedulaPdf],
    ["Matrícula IER PDF", estudiante.matriculaIerPdf],
  ];

  const representativeRows: [string, React.ReactNode][] = representante
    ? [
        ["Cédula", representante.nroCedula],
        [
          "Nombres",
          `${representante.primerNombre} ${representante.segundoNombre}`,
        ],
        [
          "Apellidos",
          `${representante.primerApellido} ${representante.segundoApellido}`,
        ],
        ["Correo", representante.email],
        ["Celular", representante.celular],
        ["Convencional", representante.convencional],
        ["Emergencia", representante.emergencia],
        ["Cédula PDF", representante.cedulaPdf],
        ["Croquis PDF", representante.croquisPdf],
      ]
    : [];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <DetailSection
        title="Información del estudiante"
        rows={studentRows}
        onEdit={onEditStudent}
        editLabel="Editar estudiante"
      />

      {representativeLoading && (
        <section className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Cargando información del representante...
        </section>
      )}

      {representativeError && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {representativeError}
        </section>
      )}

      {representante && (
        <DetailSection
          title="Información del representante"
          rows={representativeRows}
          onEdit={onEditRepresentative}
          editLabel="Editar representante"
        />
      )}
    </div>
  );
}
