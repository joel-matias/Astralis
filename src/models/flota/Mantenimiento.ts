import { TipoMantenimiento } from '@prisma/client'
import { Autobus } from './Autobus'

export { TipoMantenimiento }

// D1, D4, D5 — Clase Mantenimiento (Preventivo | Correctivo)
export class Mantenimiento {
    private mantenimientoID: string
    private tipo: TipoMantenimiento    // D1: TipoMantenimiento (Preventivo|Correctivo)
    private fechaInicio: Date          // D4: DateTime
    private fechaFin: Date | null      // D4: DateTime (nullable mientras esté abierto)
    private kilometraje: number        // D4: double
    private descripcionActividad: string
    private refacciones: string        // D5: String (partes usadas)
    private responsable: string        // D4: String
    private importaciones: string      // D5: String (costos estimados de insumos)
    private observaciones: string

    constructor(
        mantenimientoID: string,
        tipo: TipoMantenimiento,
        fechaInicio: Date,
        kilometraje: number,
        descripcionActividad: string,
        refacciones: string,
        responsable: string,
        importaciones: string = '',
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
        this.importaciones = importaciones
        this.observaciones = observaciones
    }

    getMantenimientoID(): string { return this.mantenimientoID }
    getTipo(): TipoMantenimiento { return this.tipo }
    getFechaInicio(): Date { return this.fechaInicio }
    getFechaFin(): Date | null { return this.fechaFin }
    getKilometraje(): number { return this.kilometraje }
    getDescripcionActividad(): string { return this.descripcionActividad }
    getRefacciones(): string { return this.refacciones }
    getResponsable(): string { return this.responsable }
    getImportaciones(): string { return this.importaciones }
    getObservaciones(): string { return this.observaciones }

    // D4, D2 — crea mantenimiento válido; aplica regla: autobús debe estar disponible (sin viaje activo)
    //          y no puede haber dos mantenimientos abiertos para el mismo autobús
    crearMantenimientoValido(datos: Map<string, unknown>, autobus: Autobus): boolean {
        if (!autobus.estaDisponible()) return false
        const tieneDatos =
            datos.has('tipo') &&
            datos.has('kilometraje') &&
            datos.has('descripcionActividad') &&
            datos.has('responsable')
        if (tieneDatos) {
            autobus.cambiarEstadoNuevoEstado('EN_MANTENIMIENTO' as Parameters<typeof autobus.cambiarEstadoNuevoEstado>[0])
        }
        return tieneDatos
    }

    // D4 — cierra el mantenimiento con la fecha dada; retorna false si la fecha es anterior al inicio
    cerrarFecha(fecha: Date): boolean {
        if (fecha < this.fechaInicio) return false
        this.fechaFin = fecha
        return true
    }

    // D4 — retorna true si este registro está en condición válida de abrirse (fechaFin === null)
    esValidoAbrirlo(): boolean {
        return this.fechaFin === null
    }
}
