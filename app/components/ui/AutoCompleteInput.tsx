import React, { useState, useEffect, useRef } from "react";

interface AutoCompleteInputProps {
  opciones: any[];
  inputValue: any;
  setInputValue: (value: any) => void;
  key1: string;
  key2: string;
  placeholder?: string;
}

const AutoCompleteInput = ({
  opciones,
  inputValue,
  setInputValue,
  key1,
  key2,
  placeholder = "Escribe algo...",
}: AutoCompleteInputProps) => {
  const [filteredOptions, setFilteredOptions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincroniza el texto si el valor seleccionado cambia desde afuera
  useEffect(() => {
    if (inputValue && inputValue[key1]) {
      const val2 = inputValue[key2] ? ` ${inputValue[key2]}` : "";
      setInput(`${inputValue[key1]}${val2}`);
    } else {
      setInput("");
    }
  }, [inputValue, key1, key2]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Si borramos todo, limpiamos el estado en el componente padre también
    if (value.trim() === "") {
      setFilteredOptions([]);
      setShowSuggestions(false);
      setInputValue(null);
      return;
    }

    const matches = opciones.filter((opcion) => {
      const val2 = opcion[key2] ? ` ${opcion[key2]}` : "";
      return `${opcion[key1]}${val2}`.toLowerCase().includes(value.toLowerCase());
    });
    
    setFilteredOptions(matches);
    setShowSuggestions(matches.length > 0);
  };

  const handleOptionClick = (opcion: any) => {
    const val2 = opcion[key2] ? ` ${opcion[key2]}` : "";
    setInput(`${opcion[key1]}${val2}`);
    setInputValue(opcion); // Enviamos el objeto completo al padre
    setFilteredOptions([]);
    setShowSuggestions(false);
  };

  // Clic fuera del input para cerrar la lista
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onFocus={() => { if (input.trim() !== "") setShowSuggestions(true); }}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {showSuggestions && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.map((opcion, index) => (
            <li
              key={index}
              onClick={() => handleOptionClick(opcion)}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
            >
              {opcion[key1]} {opcion[key2] ? opcion[key2] : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoCompleteInput;