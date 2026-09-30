export default function LoadingEstudiantesRepresentante() {
  return (
    <div className="w-full animate-pulse space-y-6 p-4 sm:p-8" aria-busy="true">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="h-12 bg-blue-100" />
        {[1, 2, 3].map((row) => (
          <div
            key={row}
            className="grid grid-cols-4 gap-4 border-t border-gray-100 p-4"
          >
            <div className="h-5 rounded bg-gray-200" />
            <div className="h-5 rounded bg-gray-200" />
            <div className="h-5 rounded bg-gray-200" />
            <div className="h-5 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <span className="sr-only">Cargando estudiantes</span>
    </div>
  );
}
