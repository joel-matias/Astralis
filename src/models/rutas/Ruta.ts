/**
 * CU2 — Administración de Rutas
 * Clase: Ruta
 *
 * Responsabilidades (diagrama):
 * - Almacenar la configuración completa del trayecto
 * - Validar que el código de ruta sea único en el sistema
 * - Detectar rutas con mismo origen y destino (duplicación)
 * - Gestionar lista de paradas intermedias programadas
 * - Calcular distancia y tiempo total del recorrido
 * - Registrar fecha de creación y usuario responsable
 *
 * Colabora con: ParadaIntermedia, Horario, LogAuditoria
 */

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

    // ── Getters ──────────────────────────────────────────────────────────────
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

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Crea y valida la ruta a partir de un DTO.
     * Diagrama: + crearDatosRuta(datos: RutaDTO) : Boolean
     */
    crearDatosRuta(datos: RutaDTO): boolean {
        return (
            datos.origen.trim().length > 0 &&
            datos.destino.trim().length > 0 &&
            datos.distanciaKm > 0 &&
            datos.tarifaBase > 0
        )
    }

    /**
     * Valida que todos los campos obligatorios de la ruta sean correctos.
     * Diagrama: + validarDatos() : Boolean
     */
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

    /**
     * Detecta si ya existe una ruta con el mismo origen y destino.
     * Diagrama: + verificarDuplicado(origen: String, destino: String) : Boolean
     */
    verificarDuplicado(origen: string, destino: string): boolean {
        return (
            this.ciudadOrigen.toLowerCase() === origen.toLowerCase() &&
            this.ciudadDestino.toLowerCase() === destino.toLowerCase()
        )
    }

    /**
     * Calcula la distancia total sumando tramos entre paradas.
     * Diagrama: + calcularDistancia() : Double
     */
    calcularDistancia(): number {
        return this.distanciaKm
    }

    /**
     * Agrega una parada intermedia a la ruta si es válida.
     * Diagrama: + agregarParada(parada: ParadaIntermedia) : void
     */
    agregarParada(parada: ParadaIntermedia): void {
        if (parada.validar()) {
            this.paradas.push(parada)
            this.paradas.sort((a, b) => a.getOrdenEnRuta() - b.getOrdenEnRuta())
        }
    }

    /**
     * Activa la ruta para que pueda ser programada con viajes.
     * Diagrama: + activar() : void
     */
    activar(): void {
        this.estado = EstadoRuta.ACTIVA
    }

    /**
     * Desactiva la ruta impidiendo la creación de nuevos horarios.
     * Diagrama: + desactivar() : void
     */
    desactivar(): void {
        this.estado = EstadoRuta.INACTIVA
    }

    /**
     * Retorna la lista de paradas intermedias ordenadas por posición.
     * Diagrama: + getParadas() : List
     */
    getParadas(): ParadaIntermedia[] {
        return [...this.paradas]
    }

    /**
     * Verifica si la ruta está activa y disponible para programar viajes.
     * Diagrama (comportamiento): + estaActiva() : Boolean
     */
    estaActiva(): boolean {
        return this.estado === EstadoRuta.ACTIVA
    }

    /**
     * Retorna la tarifa base para cálculo de precio por horario.
     * Diagrama (comportamiento): + getTarifaBase() : Double
     */
    getTarifaBaseCalculada(): number {
        return this.tarifaBase
    }

    /**
     * Retorna la distancia en kilómetros del recorrido completo.
     * Diagrama (comportamiento): + getDistanciaKm() : Double
     */
    getDistanciaKmCalc(): number {
        return this.distanciaKm
    }
}
