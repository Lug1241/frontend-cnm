import React, { useState, useEffect, useRef, useCallback } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AutoCompleteInputProps {
  opciones: any[];
  inputValue: any;
  setInputValue: (value: any) => void;
  onTyping?: (text: string) => void; // Opcional para módulos nuevos
  key1: string;
  key2: string;
  placeholder?: string;
  withIcon?: boolean; // Opcional para respetar los diseños antiguos
}

const AutoCompleteInput = ({
  opciones,
  inputValue,
  setInputValue,
  onTyping,
  key1,
  key2,
  placeholder = "Escribe algo...",
  withIcon = false,
}: AutoCompleteInputProps) => {
  const [filteredOptions, setFilteredOptions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOptionRef = useRef<any>(null);
  const searchConfirmedRef = useRef(false);

  const confirmSearch = useCallback(() => {
    const term = input.trim();
    if (!onTyping || !term) return;

    searchConfirmedRef.current = true;
    setFilteredOptions([]);
    setShowSuggestions(false);
    onTyping(term);
  }, [input, onTyping]);

  useEffect(() => {
    if (typeof inputValue === "string") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInput((currentInput) => currentInput === inputValue ? currentInput : inputValue);
      return;
    }

    if (inputValue && inputValue[key1]) {
      const val2 = inputValue[key2] ? ` ${inputValue[key2]}` : "";
      const nextInput = `${inputValue[key1]}${val2}`;
      setInput((currentInput) => currentInput === nextInput ? currentInput : nextInput);
    } else {
      setInput("");
    }
  }, [inputValue, key1, key2]);

  // Función unificada que devuelve el funcionamiento clásico del filtro
  const aplicarFiltro = useCallback((textoBusqueda: string, listaOpciones: any[]) => {
    if (textoBusqueda.trim() === "") {
      setFilteredOptions([]);
      setShowSuggestions(false);
      return;
    }

    const matches = listaOpciones.filter((opcion) => {
      const val2 = opcion[key2] ? ` ${opcion[key2]}` : "";
      return `${opcion[key1]}${val2}`.toLowerCase().includes(textoBusqueda.toLowerCase());
    });
    
    setFilteredOptions(matches);
    setShowSuggestions(matches.length > 0);
  }, [key1, key2]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    selectedOptionRef.current = null;
    searchConfirmedRef.current = false;
    
    if (value.trim() === "") {
      setFilteredOptions([]);
      setShowSuggestions(false);
      setInputValue(null);
    }

    // 1. Si el módulo (como Matriculación) requiere buscar en BD, lo lanza
    if (onTyping) {
      onTyping(value);
    }

    // Las búsquedas remotas actualizan las opciones desde onTyping.
    if (!onTyping) aplicarFiltro(value, opciones);
  };

  // 3. Cuando la BD responde en módulos nuevos y actualiza "opciones", re-filtra la vista
  useEffect(() => {
    if (searchConfirmedRef.current) {
      setFilteredOptions([]);
      setShowSuggestions(false);
      return;
    }

    if (selectedOptionRef.current && selectedOptionRef.current === inputValue) {
      setFilteredOptions([]);
      setShowSuggestions(false);
      return;
    }

    if (input.trim() !== "" && onTyping) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      aplicarFiltro(input, opciones);
    }
  }, [aplicarFiltro, input, inputValue, onTyping, opciones]);

  const handleOptionClick = (opcion: any) => {
    const val2 = opcion[key2] ? ` ${opcion[key2]}` : "";
    setInput(`${opcion[key1]}${val2}`);
    selectedOptionRef.current = opcion;
    setInputValue(opcion);
    setFilteredOptions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        confirmSearch();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [confirmSearch]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {withIcon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onTyping) {
            e.preventDefault();
            confirmSearch();
          }
        }}
        onFocus={() => {
          if (input.trim() !== "" && selectedOptionRef.current !== inputValue) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        // Aplica el padding izquierdo solo si la lupa está activada
        className={`w-full rounded border border-gray-300 bg-white py-2 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          withIcon ? "pl-10" : "p-2"
        }`}
      />
      {showSuggestions && filteredOptions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
          {filteredOptions.map((opcion, index) => (
            <li
              key={index}
              onClick={() => handleOptionClick(opcion)}
              className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
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