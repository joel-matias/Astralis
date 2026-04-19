import type { TipoRuta, EstadoRuta } from './Ruta'

export interface DatosParadaDTO {
    nombreParada: string
    ciudad: string
    ordenEnRuta: number
    distanciaDesdeOrigenKm: number
    tiempoDesdeOrigen: number
    tiempoEsperaMin: number
    tarifaDesdeOrigen: number
}

// Alias para compatibilidad con componentes UI existentes
export type ParadaDTO = DatosParadaDTO

export interface RutaDTO {
    codigoRuta: string
    nombreRuta?: string
    ciudadOrigen: string
    terminalOrigen: string
    ciudadDestino: string
    terminalDestino: string
    distanciaKm: number
    tiempoEstimadoHrs: number
    tipoRuta: TipoRuta | string
    tarifaBase: number
    estado?: EstadoRuta
    paradas: DatosParadaDTO[]
    omitirDuplicado?: boolean // usado por el formulario para confirmar ruta duplicada
}
