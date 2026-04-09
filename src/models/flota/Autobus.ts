/**
 * CU5 — Gestión de Flota
 * Clase: Autobus
 *
 * Responsabilidades (diagrama M7CU):
 * - Almacenar datos técnicos y operativos del autobús
 * - Controlar estado de disponibilidad
 * - Validar unicidad de placas y número económico
 * - Permitir cambio de estado operativo
 * - Verificar compatibilidad con viajes
 * - Gestionar tipo de autobús
 *
 * Colabora con: Mantenimiento, AsignacionAutobusViaje, Viaje, Conductor
 * También referenciado en: CU3 (Horarios), CU7 (Andenes)
 */

import { TipoServicio, EstadoAutobus } from '@prisma/client'

export class Autobus {
    private autobusID: string
    private numEconomico: string
    private placas: string
    private vin: string
    private marca: string
    private modelo: string
    private anio: number
    private capacidad: number
    private tipoAutobus: TipoServicio
    private estado: EstadoAutobus
    private fechaRegistro: Date

    constructor(
        autobusID: string,
        numEconomico: string,
        placas: string,
        vin: string,
        marca: string,
        modelo: string,
        anio: number,
        capacidad: number,
        tipoAutobus: TipoServicio,
        estado: EstadoAutobus = EstadoAutobus.DISPONIBLE,
        fechaRegistro: Date = new Date()
    ) {
        this.autobusID = autobusID
        this.numEconomico = numEconomico
        this.placas = placas
        this.vin = vin
        this.marca = marca
        this.modelo = modelo
        this.anio = anio
        this.capacidad = capacidad
        this.tipoAutobus = tipoAutobus
        this.estado = estado
        this.fechaRegistro = fechaRegistro
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getAutobusID(): string { return this.autobusID }
    getNumEconomico(): string { return this.numEconomico }
    getPlacas(): string { return this.placas }
    getVin(): string { return this.vin }
    getMarca(): string { return this.marca }
    getModelo(): string { return this.modelo }
    getAnio(): number { return this.anio }
    getCapacidad(): number { return this.capacidad }
    getTipoAutobus(): TipoServicio { return this.tipoAutobus }
    getEstado(): EstadoAutobus { return this.estado }
    getFechaRegistro(): Date { return this.fechaRegistro }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Registra los datos del autobús desde el formulario de alta.
     * Diagrama M7CU: + registraDatos(datos: Map) : Boolean
     */
    registraDatos(datos: Map<string, unknown>): boolean {
        return (
            datos.has('numEconomico') &&
            datos.has('placas') &&
            datos.has('vin') &&
            datos.has('capacidad')
        )
    }

    /**
     * Actualiza los datos técnicos del autobús.
     * Diagrama M7CU: + actualizarDatos(nuevosDatos: Map) : Boolean
     */
    actualizarDatos(nuevosDatos: Map<string, unknown>): boolean {
        if (nuevosDatos.has('marca')) this.marca = nuevosDatos.get('marca') as string
        if (nuevosDatos.has('modelo')) this.modelo = nuevosDatos.get('modelo') as string
        if (nuevosDatos.has('capacidad')) this.capacidad = nuevosDatos.get('capacidad') as number
        return true
    }

    /**
     * Cambia el estado operativo del autobús validando la transición permitida.
     * Diagrama M7CU: + cambiarEstado(nuevoEstado: EstadoAutobus) : Boolean
     * Regla: Asignado NO puede pasar directamente a EnMantenimiento o FueraDeServicio.
     */
    cambiarEstado(nuevoEstado: EstadoAutobus): boolean {
        if (this.estado === EstadoAutobus.ASIGNADO &&
            (nuevoEstado === EstadoAutobus.EN_MANTENIMIENTO || nuevoEstado === EstadoAutobus.FUERA_DE_SERVICIO)) {
            return false  // Debe finalizar el viaje primero
        }
        this.estado = nuevoEstado
        return true
    }

    /**
     * Verifica si el autobús está disponible para ser asignado.
     * Diagrama M7CU: + verificarDisponibilidad() : Boolean
     */
    verificarDisponibilidad(): boolean {
        return this.estado === EstadoAutobus.DISPONIBLE
    }

    /**
     * Establece el estado a DISPONIBLE (tras finalizar viaje o mantenimiento).
     * Diagrama M7CU: + establecerDisponible() : void
     */
    establecerDisponible(): void {
        this.estado = EstadoAutobus.DISPONIBLE
    }

    /**
     * Registra la baja del autobús del inventario activo.
     * Diagrama M7CU: + registrarBajaInterior() : void
     */
    registrarBajaInterior(): void {
        this.estado = EstadoAutobus.FUERA_DE_SERVICIO
    }

    /**
     * Retorna true si el autobús está disponible para asignación.
     * Diagrama CU3/CU7: + estaDisponible() : Boolean
     */
    estaDisponible(): boolean {
        return this.estado === EstadoAutobus.DISPONIBLE
    }

    /**
     * Retorna la información del autobús como string legible.
     * Diagrama CU7: + obtenerInfo() : String
     */
    obtenerInfo(): string {
        return `${this.marca} ${this.modelo} (${this.anio}) — Placas: ${this.placas} — Cap: ${this.capacidad}`
    }
}
