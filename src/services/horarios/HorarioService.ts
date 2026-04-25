// D5 CU3 — Orquesta el caso de uso completo Programar Horario de Viaje
import { prisma } from '@/lib/prisma'
import { Horario } from '@/models/horarios/Horario'
import type { HorarioDTO } from '@/models/horarios/HorarioDTO'
import type { Autobus } from '@/models/horarios/Autobus'
import type { Conductor } from '@/models/horarios/Conductor'
import { Ruta, type EstadoRuta } from '@/models/horarios/Ruta'
import { NotificacionService } from './NotificacionService'
import { ValidadorRecursos } from './ValidadorRecursos'
import { RepositorioHorarios } from '@/repositories/horarios/RepositorioHorarios'

export class HorarioService {
    private notificacion = new NotificacionService()
    private validador = new ValidadorRecursos()
    private repositorio = new RepositorioHorarios()

    // D7 paso 4.1: obtiene instancia de Ruta desde BD para consultar tarifaBase y tiempoEstimadoHrs
    private async obtenerRuta(rutaID: string): Promise<Ruta> {
        const data = await prisma.ruta.findUnique({
            where: { rutaID },
            select: {
                rutaID: true, codigoRuta: true, ciudadOrigen: true, ciudadDestino: true,
                distanciaKm: true, tiempoEstimadoHrs: true, tarifaBase: true, estado: true,
            },
        })
        if (!data) throw new Error('Ruta no encontrada')
        return new Ruta(
            data.rutaID,
            data.codigoRuta,
            data.ciudadOrigen,
            data.ciudadDestino,
            Number(data.distanciaKm),
            Number(data.tiempoEstimadoHrs),
            Number(data.tarifaBase),
            (data.estado === 'ACTIVA' ? 'Activa' : 'Inactiva') as EstadoRuta
        )
    }

    programarHorario(datos: HorarioDTO, precioBase: number): Horario {
        return new Horario(
            crypto.randomUUID(),
            datos.rutaID,
            datos.autobusID,
            datos.conductorID,
            datos.fechaInicio,
            datos.horaSalida,
            datos.frecuencia,
            datos.vigencia,
            precioBase,
            datos.estado ?? 'Activo'
        )
    }

    validarRecursos(autobus: Autobus, conductor: Conductor): boolean {
        return (
            autobus.cumpleIntervalMantenimiento() &&
            conductor.tieneLicenciaVigente() &&
            !conductor.excededHoras(0)
        )
    }

    // D6: delega en ValidadorRecursos que instancia los objetos de dominio y llama sus métodos
    async verificarDisponibilidadRecursos(
        autobusID: string, conductorID: string, fecha: Date, hora: Date, duracionHrs: number
    ): Promise<boolean> {
        return this.validador.validarDisponibilidadRecursos(autobusID, conductorID, fecha, hora, duracionHrs)
    }

    verificarConflictoHorario(fecha: Date, hora: Date): boolean {
        void fecha
        void hora
        return false
    }

    // D6: delega el cálculo al modelo Ruta vía getTarifaBase()
    calcularPrecioViaje(ruta: Ruta): number {
        return ruta.getTarifaBase()
    }

    notificarConductor(conductorID: string, horario: Horario): void {
        this.notificacion.notificarAsignacion(conductorID, horario.getHorarioID())
    }

    async registrarEnLog(usuarioID: string, accion: string, detalles: string): Promise<void> {
        await this.repositorio.guardarLog(usuarioID, accion, detalles)
    }

    // D7: flujo completo — obtiene Ruta → valida recursos → calcula precio → programa → persiste → notifica → registra
    async solicitarProgramacion(datos: HorarioDTO): Promise<string> {
        const ruta = await this.obtenerRuta(datos.rutaID)

        const disponible = await this.verificarDisponibilidadRecursos(
            datos.autobusID,
            datos.conductorID,
            datos.fechaInicio,
            datos.horaSalida,
            ruta.getTiempoEstimadoHrs()
        )
        if (!disponible) throw new Error('E1: recursos no disponibles')

        const precioBase = this.calcularPrecioViaje(ruta)
        const horario = this.programarHorario(datos, precioBase)
        const horarioID = await this.repositorio.save(horario, datos.programadoPorID, datos.fechaFin)
        this.notificarConductor(datos.conductorID, horario)
        await this.registrarEnLog(datos.programadoPorID, 'CREAR_HORARIO', `Horario programado: ${horarioID}`)
        return horarioID
    }

    async cancelar(horarioID: string, usuarioID: string): Promise<void> {
        await this.repositorio.cancelar(horarioID)
        await this.registrarEnLog(usuarioID, 'CANCELAR_HORARIO', `Horario cancelado: ${horarioID}`)
    }
}
