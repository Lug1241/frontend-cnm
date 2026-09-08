export interface Docente {
    id: number;
    nroCedula: string;
    primerNombre: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
    celular: string;
    email: string;
    rol: string;
    debeCambiarPassword: boolean;
    habilitado: boolean;
    habilitadoHasta: Date | null;
}