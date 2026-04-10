import { TipoRuta, EstadoRuta } from '@prisma/client'
import { ParadaIntermedia } from './ParadaIntermedia'
import { RutaDTO } from './RutaDTO'

export class Ruta {
    private rutaID: string
    private codigoRuta: string           // único en el sistema
    private ciudadOrigen: string
    private ciudadDestino: string
    private terminalOrigen: string
    private terminalDestino: string
    private distanciaKm: number
    private tiempoEstimadoHrs: number
    private tipoRuta: TipoRuta
    private tarifaBase: number
    private estado: EstadoRuta
    private fechaCreacion: Date
    private paradas: ParadaIntermedia[]

    constructor(
        rutaID: string,
        codigoRuta: string,
        ciudadOrigen: string,
        ciudadDestino: string,
        terminalOrigen: string,
        terminalDestino: string,
        distanciaKm: number,
        tiempoEstimadoHrs: number,
        tipoRuta: TipoRuta,
        tarifaBase: number,
        estado: EstadoRuta,
        fechaCreacion: Date = new Date(),
        paradas: ParadaIntermedia[] = []
    ) {
        this.rutaID = rutaID
        this.codigoRuta = codigoRuta
        this.ciudadOrigen = ciudadOrigen
        this.ciudadDestino = ciudadDestino
        this.terminalOrigen = terminalOrigen
        this.terminalDestino = terminalDestino
        this.distanciaKm = distanciaKm
        this.tiempoEstimadoHrs = tiempoEstimadoHrs
        this.tipoRuta = tipoRuta
        this.tarifaBase = tarifaBase
        this.estado = estado
        this.fechaCreacion = fechaCreacion
        this.paradas = paradas
    }

    getRutaID(): string { return this.rutaID }
    getCodigoRuta(): string { return this.codigoRuta }
    getCiudadOrigen(): string { return this.ciudadOrigen }
    getCiudadDestino(): string { return this.ciudadDestino }
    getTerminalOrigen(): string { return this.terminalOrigen }
    getTerminalDestino(): string { return this.terminalDestino }
    getDistanciaKm(): number { return this.distanciaKm }
    getTiempoEstimadoHrs(): number { return this.tiempoEstimadoHrs }
    getTipoRuta(): TipoRuta { return this.tipoRuta }
    getTarifaBase(): number { return this.tarifaBase }
    getEstado(): EstadoRuta { return this.estado }
    getFechaCreacion(): Date { return this.fechaCreacion }

    crearDatosRuta(datos: RutaDTO): boolean {
        return (
            datos.origen.trim().length > 0 &&
            datos.destino.trim().length > 0 &&
            datos.distanciaKm > 0 &&
            datos.tarifaBase > 0
        )
    }

    validarDatos(): boolean {
        return (
            this.codigoRuta.trim().length > 0 &&
            this.ciudadOrigen.trim().length > 0 &&
            this.ciudadDestino.trim().length > 0 &&
            this.ciudadOrigen !== this.ciudadDestino &&
            this.distanciaKm > 0 &&
            this.tarifaBase > 0
        )
    }

    verificarDuplicado(origen: string, destino: string): boolean {
        return (
            this.ciudadOrigen.toLowerCase() === origen.toLowerCase() &&
            this.ciudadDestino.toLowerCase() === destino.toLowerCase()
        )
    }

    calcularDistancia(): number {
        return this.distanciaKm
    }

    agregarParada(parada: ParadaIntermedia): void {
        if (parada.validar()) {
            this.paradas.push(parada)
            this.paradas.sort((a, b) => a.getOrdenEnRuta() - b.getOrdenEnRuta())
        }
    }

    activar(): void {
        this.estado = EstadoRuta.ACTIVA
    }

    desactivar(): void {
        this.estado = EstadoRuta.INACTIVA
    }

    getParadas(): ParadaIntermedia[] {
        return [...this.paradas]
    }

    estaActiva(): boolean {
        return this.estado === EstadoRuta.ACTIVA
    }

    getTarifaBaseCalculada(): number {
        return this.tarifaBase
    }

    getDistanciaKmCalc(): number {
        return this.distanciaKm
    }
}
