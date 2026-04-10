export interface ParadaDTO {
    nombreParada: string
    ciudad: string
    distanciaDesdeOrigenKm: number
    tiempoEsperaMin: number
    tarifaDesdeOrigen: number
}

export interface RutaDTO {
    codigoRuta: string
    ciudadOrigen: string
    ciudadDestino: string
    terminalOrigen: string
    terminalDestino: string
    distanciaKm: number
    tiempoEstimadoHrs: number
    tipoRuta: string
    tarifaBase: number
    paradas: ParadaDTO[]
    omitirDuplicado?: boolean
}
