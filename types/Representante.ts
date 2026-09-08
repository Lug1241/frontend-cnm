export interface Representante {
  id: number;
  nroCedula: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  celular?: string;
  email?: string;
  cedulaPdf?: string | null;
  croquisPdf?: string | null;
}
