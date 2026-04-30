// D1, D2, D3 CU6 — Vincula un Conductor con un Viaje programado; registra trazabilidad de asignaciones
import { Conductor } from './Conductor'
import { Viaje } from './Viaje'
import { EstadoConductor } from '@prisma/client'

export class AsignacionConductorViaje {
    // D3: idAsignacion: int → String (UUID) en código
    private idAsignacion: string
    private fechaAsignacion: Date
    private observaciones: string

    private conductor: Conductor | null
    private viaje: Viaje | null

    constructor(
        idAsignacion: string,
        fechaAsignacion: Date = new Date(),
        observaciones: string = ''
    ) {
        this.idAsignacion = idAsignacion
        this.fechaAsignacion = fechaAsignacion
        this.observaciones = observaciones
        this.conductor = null
        this.viaje = null
    }

    getIdAsignacion(): string { return this.idAsignacion }
    getFechaAsignacion(): Date { return this.fechaAsignacion }
    getObservaciones(): string { return this.observaciones }
    getConductor(): Conductor | null { return this.conductor }
    getViaje(): Viaje | null { return this.viaje }

    // D3: crearAsignacion(conductor: Conductor, viaje: Viaje): boolean
    crearAsignacion(conductor: Conductor, viaje: Viaje): boolean {
        if (!conductor.esActivo()) return false
        if (!conductor.verificarLicenciaVigente()) return false
        if (!viaje.estaProgramado()) return false
        this.conductor = conductor
        this.viaje = viaje
        conductor.cambiarEstado(EstadoConductor.NO_DISPONIBLE)
        return true
    }

    // D3: validarChoqueHorario(): boolean — verificación real: BaseDatos.verificarChoqueHorario()
    validarChoqueHorario(): boolean {
        return true
    }

    // D3: validarConductorApto(): boolean
    validarConductorApto(): boolean {
        return (
            this.conductor !== null &&
            this.conductor.esActivo() &&
            this.conductor.verificarLicenciaVigente()
        )
    }

    // D3, D5: liberar(): boolean — viaje finalizado; conductor vuelve a Activo
    liberar(): boolean {
        if (!this.conductor) return false
        this.conductor.establecerEstadoActivo()
        this.conductor = null
        this.viaje = null
        return true
    }
}
