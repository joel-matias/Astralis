import { EstadoRuta, TipoRuta } from '@prisma/client'
import { Ruta } from '@/models/rutas/Ruta'
import { ParadaIntermedia } from '@/models/rutas/ParadaIntermedia'
import type { RutaDTO } from '@/models/rutas/RutaDTO'
import { LogAuditoria } from '@/models/seguridad/LogAuditoria'
import type { Usuario } from '@/models/seguridad/Usuario'
import { prisma } from '@/lib/prisma'

export class RutaService {

    private async registrarLog(
        log: LogAuditoria
    ): Promise<void> {
        log.registrar()
        await prisma.logAuditoria.create({
            data: {
                usuarioID: log.getUsuarioID() ?? undefined,
                accion: log.getAccion(),
                modulo: log.getModulo(),
                resultado: log.getResultado(),
                detalles: log.getDetalles(),
            },
        })
    }

    validarDatos(datos: RutaDTO): string | null {
        if (!datos.codigoRuta?.trim() || !datos.ciudadOrigen?.trim() || !datos.ciudadDestino?.trim()
            || !datos.terminalOrigen?.trim() || !datos.terminalDestino?.trim()) {
            return 'Completa todos los campos obligatorios.'
        }
        if (datos.distanciaKm <= 0) return 'La distancia debe ser mayor a 0 km.'
        if (datos.tarifaBase <= 0) return 'La tarifa base debe ser mayor a $0.'
        if (datos.tipoRuta === TipoRuta.CON_PARADAS && datos.paradas.length === 0) {
            return 'Una ruta CON PARADAS debe tener al menos una parada.'
        }

        const ruta = new Ruta(
            '', datos.codigoRuta, datos.ciudadOrigen, datos.ciudadDestino,
            datos.terminalOrigen, datos.terminalDestino, datos.distanciaKm,
            datos.tiempoEstimadoHrs, datos.tipoRuta as TipoRuta,
            datos.tarifaBase, EstadoRuta.INACTIVA
        )
        if (!ruta.validarDatos()) {
            return 'La ciudad de origen y destino no pueden ser iguales.'
        }

        for (const p of datos.paradas) {
            const parada = new ParadaIntermedia('', '', p.nombreParada, p.ciudad, 1, 0, p.tiempoEsperaMin, p.tarifaDesdeOrigen)
            if (!parada.validar()) {
                return `Datos inválidos en la parada "${p.nombreParada || 'sin nombre'}".`
            }
        }

        return null
    }

    async verificarDuplicado(origen: string, destino: string, excludeRutaID?: string): Promise<string | null> {
        const duplicado = await prisma.ruta.findFirst({
            where: {
                ...(excludeRutaID ? { rutaID: { not: excludeRutaID } } : {}),
                ciudadOrigen: origen.trim(),
                ciudadDestino: destino.trim(),
            },
        })
        if (duplicado) {
            return `Ya existe la ruta ${duplicado.codigoRuta} con el mismo origen y destino. ¿Deseas guardar de todas formas?`
        }
        return null
    }

    async crearRuta(datos: RutaDTO, usuario: Usuario): Promise<void> {
        const ruta = usuario.crearRuta(datos)

        await prisma.ruta.create({
            data: {
                codigoRuta: ruta.getCodigoRuta().toUpperCase().trim(),
                nombreRuta: `${ruta.getCiudadOrigen()} - ${ruta.getCiudadDestino()}`,
                ciudadOrigen: ruta.getCiudadOrigen(),
                ciudadDestino: ruta.getCiudadDestino(),
                terminalOrigen: ruta.getTerminalOrigen(),
                terminalDestino: ruta.getTerminalDestino(),
                distanciaKm: ruta.getDistanciaKm(),
                tiempoEstimadoHrs: ruta.getTiempoEstimadoHrs(),
                tipoRuta: ruta.getTipoRuta(),
                tarifaBase: ruta.getTarifaBase(),
                creadoPorID: usuario.getUsuarioID(),
                paradas: {
                    create: datos.paradas.map((p, i) => ({
                        nombreParada: p.nombreParada,
                        ciudad: p.ciudad,
                        ordenEnRuta: i + 1,
                        distanciaDesdeOrigenKm: p.distanciaDesdeOrigenKm,
                        tiempoEsperaMin: p.tiempoEsperaMin,
                        tarifaDesdeOrigen: p.tarifaDesdeOrigen,
                    })),
                },
            },
        })

        const log = new LogAuditoria(
            '', 'CREAR_RUTA', 'rutas', 'Exito',
            usuario.getUsuarioID(),
            `Ruta creada: ${ruta.getCodigoRuta()} (${ruta.getCiudadOrigen()} → ${ruta.getCiudadDestino()})`
        )
        await this.registrarLog(log)
    }

    async actualizarRuta(rutaID: string, datos: RutaDTO, usuario: Usuario): Promise<void> {
        const ruta = usuario.crearRuta(datos)

        await prisma.ruta.update({
            where: { rutaID },
            data: {
                codigoRuta: ruta.getCodigoRuta().toUpperCase().trim(),
                nombreRuta: `${ruta.getCiudadOrigen()} - ${ruta.getCiudadDestino()}`,
                ciudadOrigen: ruta.getCiudadOrigen(),
                ciudadDestino: ruta.getCiudadDestino(),
                terminalOrigen: ruta.getTerminalOrigen(),
                terminalDestino: ruta.getTerminalDestino(),
                distanciaKm: ruta.getDistanciaKm(),
                tiempoEstimadoHrs: ruta.getTiempoEstimadoHrs(),
                tipoRuta: ruta.getTipoRuta(),
                tarifaBase: ruta.getTarifaBase(),
                paradas: {
                    deleteMany: {},
                    create: datos.paradas.map((p, i) => ({
                        nombreParada: p.nombreParada,
                        ciudad: p.ciudad,
                        ordenEnRuta: i + 1,
                        distanciaDesdeOrigenKm: p.distanciaDesdeOrigenKm,
                        tiempoEsperaMin: p.tiempoEsperaMin,
                        tarifaDesdeOrigen: p.tarifaDesdeOrigen,
                    })),
                },
            },
        })

        const log = new LogAuditoria(
            '', 'ACTUALIZAR_RUTA', 'rutas', 'Exito',
            usuario.getUsuarioID(),
            `Ruta actualizada: ${rutaID}`
        )
        await this.registrarLog(log)
    }

    async toggleEstado(rutaID: string, estadoActual: EstadoRuta, usuarioID: string | null): Promise<EstadoRuta> {
        const ruta = new Ruta(rutaID, '', '', '', '', '', 0, 0, TipoRuta.DIRECTA, 0, estadoActual)
        estadoActual === EstadoRuta.ACTIVA ? ruta.desactivar() : ruta.activar()
        const nuevoEstado = ruta.getEstado()

        await prisma.ruta.update({
            where: { rutaID },
            data: { estado: nuevoEstado },
        })

        const log = new LogAuditoria(
            '', nuevoEstado === EstadoRuta.ACTIVA ? 'ACTIVAR_RUTA' : 'DESACTIVAR_RUTA',
            'rutas', 'Exito',
            usuarioID,
            `Ruta ${rutaID} → ${nuevoEstado}`
        )
        await this.registrarLog(log)

        return nuevoEstado
    }
}
