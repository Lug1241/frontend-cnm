"use client";

import AutoCompleteInput from "@/app/components/ui/AutoCompleteInput";
import { MateriaMatriculacion } from "../actions";

interface Props {
  materias: MateriaMatriculacion[];
  selected: MateriaMatriculacion | null;
  tipo: "Grupal" | "Individual";
  onSelect: (materia: MateriaMatriculacion | null) => void;
  onTyping: (text: string) => void;
}

export default function BuscadorMateria({ materias, selected, tipo, onSelect, onTyping }: Props) {
  return (
    <AutoCompleteInput
      opciones={materias}
      inputValue={selected}
      setInputValue={onSelect}
      onTyping={onTyping}
      key1="nombre"
      key2="nivel"
      withIcon
      placeholder={`Buscar materia ${tipo.toLowerCase()}...`}
    />
  );
}
