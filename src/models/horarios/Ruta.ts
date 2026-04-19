// D1 CU3 — Ruta como la ve el módulo de horarios; solo los campos relevantes para programar viajes
// La definición completa de Ruta (con paradas, terminales, etc.) vive en /rutas/Ruta.ts (CU2)
import type { Horario } from './Horario'

export type EstadoRuta = 'Activa' | 'Inactiva'

export class Ruta {
    private rutaID: string
    private codigoRuta: string
    private ciudadOrigen: string
    private ciudadDestino: string
    private distanciaKm: number
    private tiempoEstimadoHrs: number
    private tarifaBase: number
    private estado: EstadoRuta

    constructor(
        rutaID: string,
        codigoRuta: string,
        ciudadOrigen: string,
        ciudadDestino: string,
        distanciaKm: number,
        tiempoEstimadoHrs: number,
        tarifaBase: number,
        estado: EstadoRuta = 'Activa'
    ) {
        this.rutaID = rutaID
        this.codigoRuta = codigoRuta
        this.ciudadOrigen = ciudadOrigen
        this.ciudadDestino = ciudadDestino
        this.distanciaKm = distanciaKm
        this.tiempoEstimadoHrs = tiempoEstimadoHrs
        this.tarifaBase = tarifaBase
        this.estado = estado
    }

    getRutaID(): string { return this.rutaID }
    getCodigoRuta(): string { return this.codigoRuta }
    getCiudadOrigen(): string { return this.ciudadOrigen }
    getCiudadDestino(): string { return this.ciudadDestino }
    getDistanciaKm(): number { return this.distanciaKm }
    getTiempoEstimadoHrs(): number { return this.tiempoEstimadoHrs }
    getTarifaBase(): number { return this.tarifaBase }
    getEstado(): EstadoRuta { return this.estado }

    // La lista real la provee HorarioService consultando el repositorio
    getHorarios(): Horario[] { return [] }

    estaActiva(): boolean { return this.estado === 'Activa' }
}
