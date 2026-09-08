"use client";
import { useTransition } from "react";

interface DeleteModalProps<T, TId extends string | number> {
  isOpen: boolean;
  onClose: () => void;
  item: T | null;
  title?: string;
  // Una función que reciba el ítem y devuelva el texto descriptivo que se mostrará en pantalla
  getItemName: (item: T) => string;
  // La Server Action de eliminación que recibe el ID (string o number)
  onDeleteAction: (id: TId) => Promise<{ success: boolean; error?: string }>;
  idKey?: keyof T; // Por defecto asumiremos "id", pero por si usas "ID" en mayúscula
}

export default function DeleteModal<T, TId extends string | number = number>({
  isOpen,
  onClose,
  item,
  title = "¿Eliminar elemento?",
  getItemName,
  onDeleteAction,
  idKey = "id" as keyof T,
}: DeleteModalProps<T, TId>) {
  const [isDeleting, startDeleteTransition] = useTransition();

  if (!isOpen || !item) return null;

  const handleDelete = () => {
    startDeleteTransition(async () => {
      // Extraemos dinámicamente el ID usando la llave provista
      const itemId = item[idKey] as unknown as TId;
      const result = await onDeleteAction(itemId);

      if (result.success) {
        onClose(); // Cierra el modal si fue exitoso
      } else {
        alert(result.error || "No se pudo realizar la acción.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center space-y-4 animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">
          ¿Estás seguro de que deseas eliminar a{" "}
          <span className="font-semibold">{getItemName(item)}</span>? Esta
          acción no se puede deshacer.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}