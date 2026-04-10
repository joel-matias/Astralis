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

    programar(datos: HorarioDTO): boolean {
        return (
            datos.rutaID.length > 0 &&
            datos.autobusID.length > 0 &&
            datos.conductorID.length > 0 &&
            datos.fechaInicio > new Date()
        )
    }

    // La verificación real consulta RepositorioHorarios para detectar conflictos
    validarDisponibilidadRecursos(): boolean {
        return this.estado === EstadoHorario.ACTIVO
    }

    calcularPrecioViaje(tarifaBase: number): number {
        return +(tarifaBase * 1.0).toFixed(2)
    }

    cancelar(): void {
        if (this.estado === EstadoHorario.ACTIVO) {
            this.estado = EstadoHorario.CANCELADO
        }
    }

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

    notificarConductor(): void {
        // NotificacionService.notificarAsignacion(this.conductorID, this.horarioID)
    }

    // La verificación real consulta HorarioRepository.findConflictos()
    getConflictos(): string[] {
        return []
    }

    verificarDisponibilidad(): boolean {
        return this.estado === EstadoHorario.ACTIVO && this.fechaInicio > new Date()
    }
}
