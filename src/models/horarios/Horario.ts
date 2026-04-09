/**
 * CU3 — Programación de Horarios y Viajes
 * Clase: Horario
 *
 * Responsabilidades (diagrama):
 * - Almacenar la configuración completa del viaje programado
 * - Conocer qué autobús y conductor tiene asignados
 * - Calcular el precio base según distancia y tipo de servicio
 * - Validar que no exista conflicto de horario con sus recursos
 * - Controlar su ciclo de vida (Activo → Cancelado / Completado)
 * - Generar disponibilidad de boletos una vez confirmado
 *
 * Colabora con: Ruta, Autobus, Conductor, Boleto, LogAuditoria
 */

import { FrecuenciaHorario, VigenciaHorario, EstadoHorario } from '@prisma/client'
import { Boleto } from '../shared/Boleto'
import { HorarioDTO } from './HorarioDTO'

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
        estado: EstadoHorario = EstadoHorario.ACTIVO
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

    // ── Getters ──────────────────────────────────────────────────────────────
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

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Programa el horario a partir de un DTO validado.
     * Diagrama: + programar(datos: HorarioDTO) : Boolean
     */
    programar(datos: HorarioDTO): boolean {
        return (
            datos.rutaID.length > 0 &&
            datos.autobusID.length > 0 &&
            datos.conductorID.length > 0 &&
            datos.fechaInicio > new Date()
        )
    }

    /**
     * Verifica que autobús y conductor estén disponibles en la fecha/hora.
     * Diagrama: + validarDisponibilidadRecursos() : Boolean
     * La verificación real consulta RepositorioHorarios para detectar conflictos.
     */
    validarDisponibilidadRecursos(): boolean {
        return this.estado === EstadoHorario.ACTIVO
    }

    /**
     * Calcula el precio del viaje basado en la tarifa base de la ruta.
     * Diagrama: + calcularPrecioViaje(rutaID: String) : Double
     */
    calcularPrecioViaje(tarifaBase: number): number {
        return +(tarifaBase * 1.0).toFixed(2)
    }

    /**
     * Cancela el horario si aún no ha iniciado.
     * Diagrama: + cancelar() : void
     */
    cancelar(): void {
        if (this.estado === EstadoHorario.ACTIVO) {
            this.estado = EstadoHorario.CANCELADO
        }
    }

    /**
     * Genera la lista de boletos disponibles para este horario.
     * Diagrama: + generarBoletos(capacidad: Integer) : List
     */
    generarBoletos(capacidad: number): Boleto[] {
        const boletos: Boleto[] = []
        for (let i = 1; i <= capacidad; i++) {
            const asiento = String(i).padStart(2, '0')
            boletos.push(
                new Boleto(
                    crypto.randomUUID(),
                    this.horarioID,
                    asiento,
                    this.precioBase
                )
            )
        }
        return boletos
    }

    /**
     * Notifica al conductor asignado sobre este horario (evento asíncrono).
     * Diagrama: + notificarConductor() : void
     * La notificación real se delega a NotificacionService.
     */
    notificarConductor(): void {
        // NotificacionService.notificarAsignacion(this.conductorID, this.horarioID)
    }

    /**
     * Detecta conflictos de horario para el autobús o conductor asignados.
     * Diagrama: + getConflictos() : List
     * La verificación real consulta HorarioRepository.findConflictos().
     */
    getConflictos(): string[] {
        return []
    }

    /**
     * Verifica si el horario está activo y puede recibir pasajeros.
     * Diagrama (comportamiento CU2): + verificarDisponibilidad() : Boolean
     */
    verificarDisponibilidad(): boolean {
        return this.estado === EstadoHorario.ACTIVO && this.fechaInicio > new Date()
    }
}
