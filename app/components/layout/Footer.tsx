import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#00408a] text-white border-t-4 border-gray-500 w-full px-4 py-4 md:py-6 shrink-0 text-center">
      <div className="font-bold mb-3 text-sm md:text-base">
        Conservatorio Nacional de Música © Todos los Derechos Reservados.
      </div>

      <div className="flex flex-wrap justify-center md:justify-around items-center gap-4 py-2 max-w-6xl mx-auto text-xs md:text-sm">

        <div className="flex-1 min-w-64 max-w-sm md:max-w-none">
          📍 Dirección: Cochapata E12 56 y Manuel de Abascal (El Batán) Quito - Ecuador
        </div>
        
        <div className="flex-1 min-w-48">
          📞 Teléfono: 248 666 ext. 117
        </div>
        
        <div className="flex-1 min-w-48">
          ⏰ Horario: 08:00 - 20:00
        </div>
      </div>
    </footer>
  );
}