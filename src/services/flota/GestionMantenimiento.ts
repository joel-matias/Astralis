import { prisma } from '@/lib/prisma'
import { Mantenimiento } from '@/models/flota/Mantenimiento'
import { Autobus } from '@/models/flota/Autobus'
import { BaseDatos } from './BaseDatos'
import { AuditoriaService } from './AuditoriaService'
import { TipoMantenimiento, EstadoAutobus } from '@prisma/client'
import { randomUUID } from 'crypto'

export interface DatosMantenimiento {
    tipo: TipoMantenimiento
    fechaInicio: Date
    kilometraje: number
    descripcionActividad: string
    refacciones: string
    responsable: string
    importaciones?: string
    observaciones?: string
}

export type ResultadoMantenimiento =
    | { exito: true; mantenimientoID: string }
    | { exito: false; motivo: 'no_encontrado' | 'autobus_no_disponible' | 'mto_ya_abierto' | 'datos_incompletos' | 'error_bd' }

export type ResultadoCierreMto =
    | { exito: true }
    | { exito: false; motivo: 'no_encontrado' | 'ya_cerrado' | 'fecha_invalida' | 'error_bd' }

// D8: NegMtto — Gestión Mantenimiento
// D1, D4 — registra y cierra mantenimientos; aplica reglas del diagrama de estados
export class GestionMantenimiento {
    private bd = new BaseDatos()
    private auditoria = new AuditoriaService()

    // D4, D2 — registra un mantenimiento; el autobús debe estar Disponible y sin mto abierto
    async registrarMantenimiento(autobusID: string, datos: DatosMantenimiento, usuarioEmail: string): Promise<ResultadoMantenimiento> {
        const registro = await prisma.autobus.findUnique({ where: { autobusID } })
        if (!registro) return { exito: false, motivo: 'no_encontrado' }

        // D6 — no puede iniciar mto si tiene viaje activo
        if (registro.estadoOperativo === EstadoAutobus.ASIGNADO) {
            return { exito: false, motivo: 'autobus_no_disponible' }
        }

        // D1 — no puede haber dos mantenimientos abiertos para el mismo autobús
        const mtoAbierto = await prisma.mantenimiento.findFirst({
            where: { autobusID, estaAbierto: true },
        })
        if (mtoAbierto) return { exito: false, motivo: 'mto_ya_abierto' }

        const bus = new Autobus(
            registro.autobusID, registro.numeroEconomico, registro.placas, registro.vin,
            registro.marca, registro.modelo, registro.anio, registro.capacidadAsientos,
            registro.tipoServicio, registro.estadoOperativo, registro.fechaRegistro,
        )

        const mantenimientoID = randomUUID()
        const mto = new Mantenimiento(
            mantenimientoID,
            datos.tipo,
            datos.fechaInicio,
            datos.kilometraje,
            datos.descripcionActividad,
            datos.refacciones,
            datos.responsable,
            datos.importaciones ?? '',
            datos.observaciones ?? '',
        )

        const mapa = new Map<string, unknown>([
            ['tipo', datos.tipo],
            ['kilometraje', datos.kilometraje],
            ['descripcionActividad', datos.descripcionActividad],
            ['responsable', datos.responsable],
        ])

        const valido = mto.crearMantenimientoValido(mapa, bus)
        if (!valido) return { exito: false, motivo: 'datos_incompletos' }

        const guardado = await this.bd.guardarMantenimiento(mto, autobusID)
        if (!guardado) return { exito: false, motivo: 'error_bd' }

        // D6 — cambia estado a EN_MANTENIMIENTO
        await prisma.autobus.update({
            where: { autobusID },
            data: { estadoOperativo: EstadoAutobus.EN_MANTENIMIENTO },
        })

        await this.auditoria.registrarEvento(
            usuarioEmail,
            'Registro mantenimiento',
            `${registro.numeroEconomico} — ${datos.tipo}`
        )

        return { exito: true, mantenimientoID }
    }

    // D4 — cierra el mantenimiento con la fecha dada; libera el autobús (→ Disponible)
    async cerrarMantenimiento(mantenimientoID: string, fechaCierre: Date, usuarioEmail: string): Promise<ResultadoCierreMto> {
        const registro = await prisma.mantenimiento.findUnique({
            where: { mantenimientoID },
            include: { autobus: true },
        })
        if (!registro) return { exito: false, motivo: 'no_encontrado' }
        if (!registro.estaAbierto) return { exito: false, motivo: 'ya_cerrado' }
        if (fechaCierre < registro.fechaInicio) return { exito: false, motivo: 'fecha_invalida' }

        const mto = new Mantenimiento(
            registro.mantenimientoID, registro.tipo, registro.fechaInicio,
            Number(registro.kilometraje ?? 0), registro.descripcionActividad,
            registro.refaccionesInsumos ?? '', registro.responsable, '', registro.observaciones ?? '',
        )

        const ok = mto.cerrarFecha(fechaCierre)
        if (!ok) return { exito: false, motivo: 'fecha_invalida' }

        await prisma.mantenimiento.update({
            where: { mantenimientoID },
            data: { fechaFin: fechaCierre, estaAbierto: false },
        })

        // D6 — al cerrar mantenimiento el autobús vuelve a Disponible
        await prisma.autobus.update({
            where: { autobusID: registro.autobusID },
            data: {
                estadoOperativo: EstadoAutobus.DISPONIBLE,
                ultimoMantenimiento: fechaCierre,
            },
        })

        await this.auditoria.registrarEvento(
            usuarioEmail,
            'Cierre mantenimiento',
            `${registro.autobus.numeroEconomico} — cerrado ${fechaCierre.toISOString()}`
        )

        return { exito: true }
    }
}
