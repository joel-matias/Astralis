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

    registraDatos(datos: Map<string, unknown>): boolean {
        return (
            datos.has('numEconomico') &&
            datos.has('placas') &&
            datos.has('vin') &&
            datos.has('capacidad')
        )
    }

    actualizarDatos(nuevosDatos: Map<string, unknown>): boolean {
        if (nuevosDatos.has('marca')) this.marca = nuevosDatos.get('marca') as string
        if (nuevosDatos.has('modelo')) this.modelo = nuevosDatos.get('modelo') as string
        if (nuevosDatos.has('capacidad')) this.capacidad = nuevosDatos.get('capacidad') as number
        return true
    }

    // Regla: Asignado NO puede pasar directamente a EnMantenimiento o FueraDeServicio; debe finalizar el viaje primero
    cambiarEstado(nuevoEstado: EstadoAutobus): boolean {
        if (this.estado === EstadoAutobus.ASIGNADO &&
            (nuevoEstado === EstadoAutobus.EN_MANTENIMIENTO || nuevoEstado === EstadoAutobus.FUERA_DE_SERVICIO)) {
            return false
        }
        this.estado = nuevoEstado
        return true
    }

    verificarDisponibilidad(): boolean {
        return this.estado === EstadoAutobus.DISPONIBLE
    }

    establecerDisponible(): void {
        this.estado = EstadoAutobus.DISPONIBLE
    }

    registrarBajaInterior(): void {
        this.estado = EstadoAutobus.FUERA_DE_SERVICIO
    }

    estaDisponible(): boolean {
        return this.estado === EstadoAutobus.DISPONIBLE
    }

    obtenerInfo(): string {
        return `${this.marca} ${this.modelo} (${this.anio}) — Placas: ${this.placas} — Cap: ${this.capacidad}`
    }
}
