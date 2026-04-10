import { TipoMantenimiento } from '@prisma/client'
import { Autobus } from './Autobus'

export class Mantenimiento {
    private mantenimientoID: string
    private tipo: TipoMantenimiento
    private fechaInicio: Date
    private fechaFin: Date | null
    private kilometraje: number
    private descripcionActividad: string
    private refacciones: number          // costo en pesos
    private responsable: string
    private observaciones: string

    constructor(
        mantenimientoID: string,
        tipo: TipoMantenimiento,
        fechaInicio: Date,
        kilometraje: number,
        descripcionActividad: string,
        refacciones: number,
        responsable: string,
        observaciones: string = '',
        fechaFin: Date | null = null
    ) {
        this.mantenimientoID = mantenimientoID
        this.tipo = tipo
        this.fechaInicio = fechaInicio
        this.fechaFin = fechaFin
        this.kilometraje = kilometraje
        this.descripcionActividad = descripcionActividad
        this.refacciones = refacciones
        this.responsable = responsable
        this.observaciones = observaciones
    }

    getMantenimientoID(): string { return this.mantenimientoID }
    getTipo(): TipoMantenimiento { return this.tipo }
    getFechaInicio(): Date { return this.fechaInicio }
    getFechaFin(): Date | null { return this.fechaFin }
    getKilometraje(): number { return this.kilometraje }
    getDescripcionActividad(): string { return this.descripcionActividad }
    getRefacciones(): number { return this.refacciones }
    getResponsable(): string { return this.responsable }
    getObservaciones(): string { return this.observaciones }

    // Regla: no puede iniciar si el autobús tiene viaje activo; no puede haber dos mantenimientos abiertos para el mismo autobús
    crearMantenimientoInicio(datos: Map<string, unknown>, autobus: Autobus): boolean {
        if (!autobus.estaDisponible()) return false
        const tieneDatos =
            datos.has('tipo') &&
            datos.has('kilometraje') &&
            datos.has('descripcionActividad')
        if (tieneDatos) {
            autobus.cambiarEstado('EN_MANTENIMIENTO' as Parameters<typeof autobus.cambiarEstado>[0])
        }
        return tieneDatos
    }

    cerrarFin(fecha: Date): boolean {
        if (fecha < this.fechaInicio) return false
        this.fechaFin = fecha
        return true
    }

    estaAbierto(): boolean {
        return this.fechaFin === null
    }
}
