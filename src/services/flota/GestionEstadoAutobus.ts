import { prisma } from '@/lib/prisma'
import { Autobus } from '@/models/flota/Autobus'
import { BaseDatos } from './BaseDatos'
import { AuditoriaService } from './AuditoriaService'
import { EstadoAutobus } from '@prisma/client'

export type ResultadoCambioEstado =
    | { exito: true; estadoAnterior: EstadoAutobus; estadoNuevo: EstadoAutobus }
    | { exito: false; motivo: 'no_encontrado' | 'transicion_invalida' | 'tiene_mto_abierto' | 'error_bd' }

// D8: NegEst — Gestión Estado Autobús
// D6 — orquesta las transiciones del Diagrama de Estados del Autobús
export class GestionEstadoAutobus {
    private bd = new BaseDatos()
    private auditoria = new AuditoriaService()

    // D6 — aplica la transición de estado con todas las reglas del diagrama
    async cambiarEstadoAutobus(autobusID: string, nuevoEstado: EstadoAutobus, motivo: string, usuarioEmail: string): Promise<ResultadoCambioEstado> {
        const registro = await prisma.autobus.findUnique({ where: { autobusID } })
        if (!registro) return { exito: false, motivo: 'no_encontrado' }

        const bus = new Autobus(
            registro.autobusID, registro.numeroEconomico, registro.placas, registro.vin,
            registro.marca, registro.modelo, registro.anio, registro.capacidadAsientos,
            registro.tipoServicio, registro.estadoOperativo, registro.fechaRegistro,
        )

        const estadoAnterior = bus.getEstado()

        // D6 — para volver a Disponible no debe existir mantenimiento abierto
        if (nuevoEstado === EstadoAutobus.DISPONIBLE) {
            const mtoAbierto = await prisma.mantenimiento.findFirst({
                where: { autobusID, estaAbierto: true },
            })
            if (mtoAbierto) return { exito: false, motivo: 'tiene_mto_abierto' }
        }

        // D6 — aplica regla de transición (ASIGNADO no puede ir a EN_MANTENIMIENTO/FUERA_DE_SERVICIO)
        const ok = bus.cambiarEstadoNuevoEstado(nuevoEstado)
        if (!ok) return { exito: false, motivo: 'transicion_invalida' }

        const guardado = await this.bd.actualizarEstadoAutobus(bus)
        if (!guardado) return { exito: false, motivo: 'error_bd' }

        await this.auditoria.registrarEvento(
            usuarioEmail,
            'Cambio estado autobús',
            `${registro.numeroEconomico}: ${estadoAnterior} → ${nuevoEstado}${motivo ? ` | ${motivo}` : ''}`
        )

        return { exito: true, estadoAnterior, estadoNuevo: nuevoEstado }
    }

    // D6 — activa reactivación desde FueraDeServicio (sin mantenimiento pendiente)
    async reactivarAutobus(autobusID: string, motivo: string, usuarioEmail: string): Promise<ResultadoCambioEstado> {
        return this.cambiarEstadoAutobus(autobusID, EstadoAutobus.DISPONIBLE, motivo, usuarioEmail)
    }

    // D6 — pone el autobús FueraDeServicio por falla grave
    async registrarFallaGrave(autobusID: string, motivo: string, usuarioEmail: string): Promise<ResultadoCambioEstado> {
        return this.cambiarEstadoAutobus(autobusID, EstadoAutobus.FUERA_DE_SERVICIO, motivo, usuarioEmail)
    }
}
