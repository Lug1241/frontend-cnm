"use client";

import { useState, useTransition } from "react";

interface DeleteModalProps<T, TId extends string | number> {
  isOpen: boolean;
  onClose: () => void;
  item: T | null;
  title?: string;
  getItemName: (item: T) => string;
  onDeleteAction: (
    id: TId,
  ) => Promise<{ success: boolean; error?: string }>;
  idKey?: keyof T;
}

export default function DeleteModal<
  T,
  TId extends string | number = number,
>({
  isOpen,
  onClose,
  item,
  title = "¿Eliminar elemento?",
  getItemName,
  onDeleteAction,
  idKey = "id" as keyof T,
}: DeleteModalProps<T, TId>) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const closeModal = () => {
    setErrorMessage(null);
    onClose();
  };

  const handleDelete = () => {
    setErrorMessage(null);

    startDeleteTransition(async () => {
      const itemId = item[idKey] as unknown as TId;
      const result = await onDeleteAction(itemId);

      if (result.success) {
        closeModal();
        return;
      }

      setErrorMessage(
        result.error ?? "No se pudo realizar la acción.",
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 text-center shadow-2xl">
        <h3 className="text-lg font-bold text-gray-800">
          {title}
        </h3>

        <p className="text-sm text-gray-600">
          ¿Estás seguro de que deseas eliminar a{" "}
          <span className="font-semibold">
            {getItemName(item)}
          </span>
          ? Esta acción no se puede deshacer.
        </p>

        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-left text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={closeModal}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}