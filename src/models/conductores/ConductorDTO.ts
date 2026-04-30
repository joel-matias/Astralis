// D3, D5 CU6 — DTO para transferencia de datos del Conductor entre capas
export interface ConductorDTO {
    conductorID?: string
    nombreCompleto: string
    domicilio: string
    curp: string
    numeroLicencia: string
    vigenciaLicencia: string        // ISO date string desde formulario
    numeroTelefonico: string
}
