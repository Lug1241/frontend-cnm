"use client";

import { MdOutlinePictureAsPdf } from "react-icons/md";

export default function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      title="Imprimir o guardar como PDF"
      aria-label="Imprimir o guardar como PDF"
      className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-red-600 text-white transition hover:bg-red-700"
    >
      <MdOutlinePictureAsPdf
        className="h-6 w-6"
        aria-hidden
      />
    </button>
  );
}