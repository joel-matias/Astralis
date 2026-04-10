export interface ParadaDTO {
    nombreParada: string
    ciudad: string
    ordenEnRuta: number
    tiempoEsperaMin: number
    tarifaDesdeOrigen: number
}

export interface RutaDTO {
    origen: string
    destino: string
    terminalOrigen: string
    terminalDestino: string
    distanciaKm: number
    tipoRuta: string          // 'Directa' | 'ConParadas'
    tarifaBase: number
    paradas: ParadaDTO[]
}
