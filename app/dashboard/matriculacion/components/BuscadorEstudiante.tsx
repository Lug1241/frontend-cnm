"use client";

import { useEffect, useRef, useState } from "react";
import AutoCompleteInput from "@/app/components/ui/AutoCompleteInput"; 
import { buscarEstudiantesAction } from "../actions";
import { EstudianteSeleccionado } from "../MatriculacionClient";

interface Props {
  onSelect: (estudiante: EstudianteSeleccionado) => void;
}

export default function BuscadorEstudiante({ onSelect }: Props) {
  const [estudiantes, setEstudiantes] = useState<EstudianteSeleccionado[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const requestId = useRef(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = async (term: string) => {
    setBusqueda(term);
    const currentRequest = ++requestId.current;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (term.length < 3) {
      setEstudiantes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await buscarEstudiantesAction(term);
        if (currentRequest === requestId.current) setEstudiantes(response);
      } catch (error) {
        console.error("Error buscando estudiantes:", error);
      } finally {
        if (currentRequest === requestId.current) setIsLoading(false);
      }
    }, 300);
  };

  useEffect(() => () => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
  }, []);

  return (
    <div className="w-full max-w-2xl space-y-5">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Seleccionar Estudiante</h2>
        <p className="text-sm text-gray-500">Busca por apellidos o nombres para iniciar el proceso de matrícula.</p>
      </div>

      <div className="relative">
        <AutoCompleteInput
          inputValue={busqueda}
          setInputValue={(val) => {
            if (val && typeof val === "object") onSelect(val as EstudianteSeleccionado);
          }}
          withIcon
          onTyping={handleSearch}
          opciones={estudiantes}
          key1="primerApellido"
          key2="primerNombre"
          placeholder="Buscar por apellido"
        />
        {isLoading && (
          <span className="absolute right-3 top-2.5 text-xs text-blue-500">Buscando...</span>
        )}
      </div>
    </div>
  );
}