"use client";

import { useState } from "react";
import { type Representante } from "@/types/Representante";
import RepresentanteDetailPanel from "@/app/dashboard/estudiantil/representantes/RepresentanteDetailPanel";
import RepresentanteModal from "@/app/dashboard/estudiantil/representantes/RepresentanteModal";
import { updateRepresentante } from "@/app/dashboard/estudiantil/representantes/actions";

interface RepresentantePerfilProps {
  initialRepresentante: Representante;
}

export default function RepresentantePerfil({
  initialRepresentante,
}: RepresentantePerfilProps) {
  const [representante, setRepresentante] =
    useState<Representante>(initialRepresentante);

  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <RepresentanteDetailPanel
        representante={representante}
        onEdit={() => setIsEditing(true)}
      />

      <RepresentanteModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        representanteToEdit={representante}
        onSaveAction={async (cedula, formData) => {
          if (!cedula) {
            return {
              success: false,
              error: "No se pudo identificar al representante.",
            };
          }

          const result = await updateRepresentante(cedula, formData);

          if (result.success && result.data) {
            setRepresentante(result.data);
          }

          return result;
        }}
      />
    </>
  );
}