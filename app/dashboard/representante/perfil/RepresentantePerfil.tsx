"use client";

import { useState } from "react";
import { type Representante } from "@/types/Representante";

import Toast from "@/app/components/ui/Toast";
import RepresentanteDetailPanel from "@/app/dashboard/estudiantil/representantes/RepresentanteDetailPanel";
import RepresentanteModal from "@/app/dashboard/estudiantil/representantes/RepresentanteModal";

import { updateCurrentRepresentante } from "@/app/dashboard/estudiantil/representantes/actions";

interface RepresentantePerfilProps {
  initialRepresentante: Representante;
}

export default function RepresentantePerfil({
  initialRepresentante,
}: RepresentantePerfilProps) {
  const [representante, setRepresentante] =
    useState<Representante>(initialRepresentante);

  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  return (
    <>
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      <RepresentanteDetailPanel
        representante={representante}
        onEdit={() => setIsEditing(true)}
      />

      <RepresentanteModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        representanteToEdit={representante}
        onSaveAction={async (_cedula, formData) => {
          const result = await updateCurrentRepresentante(formData);

          if (result.success && result.data) {
            setRepresentante(result.data);
            setToastMessage(
              "Información del representante actualizada correctamente.",
            );
          }

          return result;
        }}
      />
    </>
  );
}