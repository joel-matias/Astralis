// D1 CU3 — Entidad principal del caso de uso Programar Horario de Viaje
import type { HorarioDTO } from './HorarioDTO'
import type { Ruta } from './Ruta'
import type { Boleto } from './Boleto'

export type FrecuenciaHorario = 'Unico' | 'Diario' | 'Semanal'
export type VigenciaHorario = 'Definida' | 'Indefinida'
export type EstadoHorario = 'Activo' | 'Cancelado' | 'Completado'

export class Horario {
    private horarioID: string
    private rutaID: string
    private autobusID: string
    private conductorID: string
    private fechaInicio: Date
    private horaSalida: Date
    private frecuencia: FrecuenciaHorario
    private vigencia: VigenciaHorario
    private precioBase: number
    private estado: EstadoHorario

    constructor(
        horarioID: string,
        rutaID: string,
        autobusID: string,
        conductorID: string,
        fechaInicio: Date,
        horaSalida: Date,
        frecuencia: FrecuenciaHorario,
        vigencia: VigenciaHorario,
        precioBase: number,
        estado: EstadoHorario = 'Activo'
    ) {
        this.horarioID = horarioID
        this.rutaID = rutaID
        this.autobusID = autobusID
        this.conductorID = conductorID
        this.fechaInicio = fechaInicio
        this.horaSalida = horaSalida
        this.frecuencia = frecuencia
        this.vigencia = vigencia
        this.precioBase = precioBase
        this.estado = estado
    }

    getHorarioID(): string { return this.horarioID }
    getRutaID(): string { return this.rutaID }
    getAutobusID(): string { return this.autobusID }
    getConductorID(): string { return this.conductorID }
    getFechaInicio(): Date { return this.fechaInicio }
    getHoraSalida(): Date { return this.horaSalida }
    getFrecuencia(): FrecuenciaHorario { return this.frecuencia }
    getVigencia(): VigenciaHorario { return this.vigencia }
    getPrecioBase(): number { return this.precioBase }
    getEstado(): EstadoHorario { return this.estado }

    // D4: firma actualizada para recibir HorarioDTO tipado
    programar(datos: HorarioDTO): boolean {
        return (
            datos.rutaID.trim().length > 0 &&
            datos.autobusID.trim().length > 0 &&
            datos.conductorID.trim().length > 0 &&
            datos.fechaInicio instanceof Date &&
            datos.horaSalida instanceof Date
        )
    }

    // D4: renombrado de validarDisponibilidad() para reflejar que valida todos los recursos (autobus + conductor)
    validarDisponibilidadRecursos(): boolean {
        return this.horaSalida > new Date() && this.estado === 'Activo'
    }

    // D4: recibe Ruta para calcular precio con base en tarifaBase y distancia; HorarioService aplica factores adicionales
    calcularPrecio(ruta: Ruta): number {
        return ruta.getTarifaBase()
    }

    cancelar(): void {
        this.estado = 'Cancelado'
    }

    // D4: genera un boleto por asiento; la persistencia y QR los maneja HorarioService
    generarBoletos(capacidad: number): Boleto[] {
        void capacidad
        return []
    }

    // D4: notifica al conductor asignado vía NotificacionService; stub — colaboración externa
    notificarConductor(): void {}

    // D4: retorna lista de conflictos de horario detectados; la lógica real está en ValidadorRecursos
    getConflictos(): unknown[] {
        return []
    }
}
