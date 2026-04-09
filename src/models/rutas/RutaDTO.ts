/**
 * CU2 — Administración de Rutas
 * DTO: RutaDTO  «DTO»
 *
 * Diagrama de Dependencias (CU2):
 * - origen : String
 * - destino : String
 * - terminalOrigen : String
 * - terminalDestino : String
 * - distanciaKm : Double
 * - tipoRuta : String
 * - tarifaBase : Double
 * - paradas : List
 *
 * Transporta datos del formulario al RutaService/ControladorRutas.
 * Los datos del DTO tienen trazabilidad con la entidad Ruta.
 */

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
