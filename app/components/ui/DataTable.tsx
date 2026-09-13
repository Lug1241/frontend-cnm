"use client";
import React from "react";
import { MdAdd, MdOutlineEdit, MdOutlineDelete, MdSearch } from "react-icons/md";

// Interfaz genérica para la configuración de columnas
export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  // Permite renderizar contenido personalizado (ej. formatear fechas, combinar strings)
  cell?: (item: T) => React.ReactNode; 
}

interface DataTableProps<T> {
  title?: string;
  description?: string;
  data: T[];
  columns: ColumnDef<T>[];
  // Barra de herramientas
  onAdd?: () => void;
  addLabel?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  customFilters?: React.ReactNode; // Para los selects del módulo de Cursos
  // Acciones
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  renderActions?: (item: T) => React.ReactNode;
  // Paginación
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function DataTable<T>({
  title,
  description,
  data,
  columns,
  onAdd,
  addLabel = "Agregar",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  customFilters,
  onEdit,
  onDelete,
  renderActions,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 bg-white min-h-full">
      {/* HEADER */}
      {(title || description) && (
        <div className="mb-6">
          {title && <h2 className="text-2xl font-bold text-[#00408a]">{title}</h2>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-wrap">
          {/* Selects personalizados (ej. Filtro por periodo o grupo) */}
          {customFilters}
          
          {/* Buscador de texto */}
          {onSearchChange && (
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdSearch className="text-gray-400 w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00408a] focus:border-transparent text-sm"
              />
            </div>
          )}
        </div>

        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-semibold rounded-md transition-colors whitespace-nowrap"
          >
            <MdAdd className="w-5 h-5" />
            {addLabel}
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto bg-white rounded-md border border-gray-200 shadow-sm mb-4">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-white uppercase bg-[#00408a]">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="px-6 py-4 font-semibold text-center border-r border-white/20">
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete || renderActions) && (
                <th className="px-6 py-4 font-semibold text-center w-24">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-center font-medium text-gray-800 border-r border-gray-200">
                      {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey]) : null}
                    </td>
                  ))}
                  {(onEdit || onDelete || renderActions) && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        {renderActions?.(item)}
                        {onEdit && (
                          <button onClick={() => onEdit(item)} className="text-blue-500 hover:text-blue-700 transition-colors">
                            <MdOutlineEdit className="w-5 h-5" />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(item)} className="text-red-500 hover:text-red-700 transition-colors">
                            <MdOutlineDelete className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete || renderActions ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                  No hay datos disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && onPageChange && (
        <div className="flex justify-center items-center gap-1 mt-6">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            &larr; Anterior
          </button>
          
          {/* Lógica simple de páginas (se puede expandir para mostrar puntos suspensivos) */}
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNumber = idx + 1;
            // Muestra solo páginas cercanas por simplicidad en este ejemplo
            if (pageNumber === 1 || pageNumber === totalPages || Math.abs(currentPage - pageNumber) <= 1) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`px-3 py-1 border rounded-md text-sm transition-colors ${
                    currentPage === pageNumber
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            }
            if (Math.abs(currentPage - pageNumber) === 2) return <span key={pageNumber} className="px-1 text-gray-400">...</span>;
            return null;
          })}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Siguiente &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
