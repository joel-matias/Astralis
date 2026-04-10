import { Conductor } from './Conductor'
import { Viaje } from '../shared/Viaje'

export class AsignacionConductorViaje {
    private asignacionID: string
    private fechaAsignacion: Date
    private observaciones: string

    private conductor: Conductor | null
    private viaje: Viaje | null

    constructor(
        asignacionID: string,
        fechaAsignacion: Date = new Date(),
        observaciones: string = ''
    ) {
        this.asignacionID = asignacionID
        this.fechaAsignacion = fechaAsignacion
        this.observaciones = observaciones
        this.conductor = null
        this.viaje = null
    }

    getAsignacionID(): string { return this.asignacionID }
    getFechaAsignacion(): Date { return this.fechaAsignacion }
    getObservaciones(): string { return this.observaciones }
    getConductor(): Conductor | null { return this.conductor }
    getViaje(): Viaje | null { return this.viaje }

    crearAsignacion(conductor: Conductor, viaje: Viaje): boolean {
        if (!conductor.esActivo()) return false
        if (!conductor.verificarLicenciaVigente()) return false
        if (!viaje.estaProgramado()) return false
        this.conductor = conductor
        this.viaje = viaje
        return true
    }

    // Implementación real: BaseDatos.verificarChoqueHorario(conductor, viaje)
    validarChoqueHorario(): boolean {
        return true
    }

    validarConductorApto(): boolean {
        return (
            this.conductor !== null &&
            this.conductor.esActivo() &&
            this.conductor.verificarLicenciaVigente()
        )
    }

    liberar(): boolean {
        if (!this.conductor) return false
        this.conductor.establecerEstadoActivo()
        this.conductor = null
        this.viaje = null
        return true
    }
}
