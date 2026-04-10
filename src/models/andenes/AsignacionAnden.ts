import { EstadoAsignacion } from '@prisma/client'
import { Anden } from './Anden'
import { Autobus } from '../flota/Autobus'
import { Viaje } from '../shared/Viaje'

export class AsignacionAnden {
    private asignacionID: string
    private fechaHora: Date
    private estado: EstadoAsignacion

    private anden: Anden | null
    private autobus: Autobus | null
    private viaje: Viaje | null

    constructor(
        asignacionID: string,
        fechaHora: Date = new Date(),
        estado: EstadoAsignacion = EstadoAsignacion.RESERVADO
    ) {
        this.asignacionID = asignacionID
        this.fechaHora = fechaHora
        this.estado = estado
        this.anden = null
        this.autobus = null
        this.viaje = null
    }

    getAsignacionID(): string { return this.asignacionID }
    getFechaHora(): Date { return this.fechaHora }
    getEstado(): EstadoAsignacion { return this.estado }
    getAnden(): Anden | null { return this.anden }
    getAutobus(): Autobus | null { return this.autobus }
    getViaje(): Viaje | null { return this.viaje }

    guardar(): void {
        if (this.anden) {
            this.anden.actualizarEstado('RESERVADO' as Parameters<typeof this.anden.actualizarEstado>[0])
        }
        this.estado = EstadoAsignacion.RESERVADO
        // RepositorioAndenes.persistirAsignacion(this)
    }

    cancelar(): void {
        if (this.anden) {
            this.anden.actualizarEstado('DISPONIBLE' as Parameters<typeof this.anden.actualizarEstado>[0])
        }
        this.estado = EstadoAsignacion.LIBERADO
    }

    validarDisponibilidad(): boolean {
        return this.anden?.estaDisponible() ?? false
    }

    configurar(anden: Anden, autobus: Autobus, viaje: Viaje): boolean {
        if (!anden.estaDisponible()) return false
        if (!viaje.estaProgramado()) return false
        this.anden = anden
        this.autobus = autobus
        this.viaje = viaje
        return true
    }
}
