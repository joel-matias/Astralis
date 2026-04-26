import { Autobus } from './Autobus'
import { Viaje } from './Viaje'
import { Conductor } from './Conductor'

// D1, D4, D5 — AsignacionAutobusViaje: vincula un Autobus con un Viaje y un Conductor
export class AsignacionAutobusViaje {
    private asignacionID: string
    private fechaAsignacion: Date    // D4: DateTime
    private observaciones: string    // D4: String

    private autobus: Autobus | null
    private viaje: Viaje | null
    private conductor: Conductor | null

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
        this.conductor = null
    }

    getAsignacionID(): string { return this.asignacionID }
    getFechaAsignacion(): Date { return this.fechaAsignacion }
    getObservaciones(): string { return this.observaciones }
    getAutobus(): Autobus | null { return this.autobus }
    getViaje(): Viaje | null { return this.viaje }
    getConductor(): Conductor | null { return this.conductor }

    // D4, D2 — vincula autobús con viaje del conductor; aplica reglas de disponibilidad
    crearAsignacion(autobus: Autobus, viaje: Viaje, conductor: Conductor): boolean {
        if (!autobus.estaDisponible()) return false
        if (!viaje.estaProgramado()) return false
        if (!conductor.verificarEstadoActivo()) return false
        this.autobus = autobus
        this.viaje = viaje
        this.conductor = conductor
        autobus.establecerEnTransporte(true)
        return true
    }

    // D4, D2 — verifica que no exista choque de horario para el autobús; lógica real en BaseDatos
    validarChoqueHorario(): boolean {
        return true
    }

    // D4, D2 — verifica estado activo y disponibilidad del autobús a asignar
    validarAutobusDisponible(): boolean {
        return this.autobus?.estaDisponible() ?? false
    }

    // D4 — libera el autobús al finalizar el viaje; estado → DISPONIBLE
    liberar(): boolean {
        if (!this.autobus) return false
        this.autobus.establecerEnTransporte(false)
        this.autobus = null
        this.viaje = null
        this.conductor = null
        return true
    }
}
