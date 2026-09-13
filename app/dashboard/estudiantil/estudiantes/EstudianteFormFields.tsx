import {
  GENEROS_ESTUDIANTE,
  GRUPOS_ETNICOS_ESTUDIANTE,
  JORNADAS_ESTUDIANTE,
  NIVELES_ESTUDIANTE,
  type Estudiante,
} from "@/types/Estudiante";
import { type Representante } from "@/types/Representante";

interface EstudianteFormFieldsProps {
  estudiante?: Estudiante | null;
  representantes: Representante[];
}

const inputClass =
  "rounded-md border border-gray-300 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-[#00408a]";

export default function EstudianteFormFields({
  estudiante,
  representantes,
}: EstudianteFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Nro. cédula
        <input name="nroCedula" defaultValue={estudiante?.nroCedula ?? ""} inputMode="numeric" pattern="[0-9]{7,10}" minLength={7} maxLength={10} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Primer nombre
        <input name="primerNombre" defaultValue={estudiante?.primerNombre ?? ""} minLength={2} maxLength={50} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Segundo nombre
        <input name="segundoNombre" defaultValue={estudiante?.segundoNombre ?? ""} minLength={2} maxLength={50} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Primer apellido
        <input name="primerApellido" defaultValue={estudiante?.primerApellido ?? ""} minLength={2} maxLength={50} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Segundo apellido
        <input name="segundoApellido" defaultValue={estudiante?.segundoApellido ?? ""} minLength={2} maxLength={50} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Género
        <select name="genero" defaultValue={estudiante?.genero ?? ""} required className={inputClass}>
          <option value="" disabled>Seleccione</option>
          {GENEROS_ESTUDIANTE.map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Año de matrícula
        <input type="number" name="anioMatricula" defaultValue={estudiante?.anioMatricula ?? new Date().getFullYear()} min={1900} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Jornada
        <select name="jornada" defaultValue={estudiante?.jornada ?? ""} required className={inputClass}>
          <option value="" disabled>Seleccione</option>
          {JORNADAS_ESTUDIANTE.map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Fecha de nacimiento
        <input type="date" name="fechaNacimiento" defaultValue={estudiante?.fechaNacimiento?.slice(0, 10) ?? ""} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Grupo étnico
        <select name="grupoEtnico" defaultValue={estudiante?.grupoEtnico ?? ""} required className={inputClass}>
          <option value="" disabled>Seleccione</option>
          {GRUPOS_ETNICOS_ESTUDIANTE.map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Especialidad
        <input name="especialidad" defaultValue={estudiante?.especialidad ?? ""} maxLength={255} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Nro. matrícula
        <input type="number" name="nroMatricula" defaultValue={estudiante?.nroMatricula ?? 1} min={1} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Nacionalidad
        <input name="nacionalidad" defaultValue={estudiante?.nacionalidad ?? ""} maxLength={255} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Institución educativa de referencia
        <input name="ier" defaultValue={estudiante?.ier ?? ""} maxLength={255} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Nivel
        <select name="nivel" defaultValue={estudiante?.nivel ?? ""} required className={inputClass}>
          <option value="" disabled>Seleccione</option>
          {NIVELES_ESTUDIANTE.map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700 sm:col-span-2">
        Representante
        <select name="representanteId" defaultValue={estudiante?.representanteId ?? ""} required className={inputClass}>
          <option value="" disabled>Seleccione un representante</option>
          {representantes.map((item) => (
            <option key={item.nroCedula} value={item.id}>
              {item.primerApellido} {item.segundoApellido}, {item.primerNombre} {item.segundoNombre} — {item.nroCedula}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700 sm:col-span-2 lg:col-span-3">
        Dirección
        <input name="direccion" defaultValue={estudiante?.direccion ?? ""} maxLength={255} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Ruta de cédula PDF (opcional)
        <input name="cedulaPdf" defaultValue={estudiante?.cedulaPdf ?? ""} maxLength={255} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700 sm:col-span-2">
        Ruta de matrícula IER PDF (opcional)
        <input name="matriculaIerPdf" defaultValue={estudiante?.matriculaIerPdf ?? ""} maxLength={255} className={inputClass} />
      </label>
    </div>
  );
}
