import { Autobus } from './Autobus'
import { Viaje } from '../shared/Viaje'

export class AsignacionAutobusViaje {
    private asignacionID: string
    private fechaAsignacion: Date
    private observaciones: string

    private autobus: Autobus | null
    private viaje: Viaje | null
    private conductorID: string | null

    constructor(
        asignacionID: string,
        fechaAsignacion: Date = new Date(),
        observaciones: string = ''
    ) {
        this.asignacionID = asignacionID
        this.fechaAsignacion = fechaAsignacion
        this.observaciones = observaciones
        this.autobus = null
        this.viaje = null
        this.conductorID = null
    }

    getAsignacionID(): string { return this.asignacionID }
    getFechaAsignacion(): Date { return this.fechaAsignacion }
    getObservaciones(): string { return this.observaciones }
    getAutobus(): Autobus | null { return this.autobus }
    getViaje(): Viaje | null { return this.viaje }
    getConductorID(): string | null { return this.conductorID }

    crearAsignacion(autobus: Autobus, viaje: Viaje, conductorID: string): boolean {
        if (!autobus.estaDisponible()) return false
        if (!viaje.estaProgramado()) return false
        this.autobus = autobus
        this.viaje = viaje
        this.conductorID = conductorID
        autobus.cambiarEstado('ASIGNADO' as Parameters<typeof autobus.cambiarEstado>[0])
        return true
    }

    // La verificación real consulta AsignacionRepository
    validarChoqueHorario(): boolean {
        return true
    }

    validarAutobusDisponible(): boolean {
        return this.autobus?.estaDisponible() ?? false
    }

    liberar(): boolean {
        if (!this.autobus) return false
        this.autobus.establecerDisponible()
        this.autobus = null
        this.viaje = null
        this.conductorID = null
        return true
    }
}
