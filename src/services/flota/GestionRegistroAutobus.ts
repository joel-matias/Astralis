import { prisma } from '@/lib/prisma'
import { Autobus } from '@/models/flota/Autobus'
import { ValidadorDatos } from '@/models/flota/ValidadorDatos'
import { BaseDatos } from './BaseDatos'
import { AuditoriaService } from './AuditoriaService'
import { TipoServicio, EstadoAutobus } from '@prisma/client'
import { randomUUID } from 'crypto'

export interface DatosRegistroAutobus {
    numeroEconomico: string
    placas: string
    vin: string
    marca: string
    modelo: string
    anio: number
    capacidadAsientos: number
    tipoAutobus: TipoServicio
}

export type ResultadoRegistro =
    | { exito: true; autobusID: string; numeroEconomico: string }
    | { exito: false; motivo: 'campos_faltantes' | 'formato_invalido' | 'duplicado' | 'error_bd' }

export interface DatosActualizacionAutobus {
    marca?: string
    modelo?: string
    capacidadAsientos?: number
    tipoAutobus?: TipoServicio
}

export type ResultadoActualizacion =
    | { exito: true }
    | { exito: false; motivo: string }

// D8: NegReg — Gestión Registro Autobús
// D3, D7 — orquesta el flujo: validar campos → validar formatos → verificar duplicado → crear → guardar → log
export class GestionRegistroAutobus {
    private bd = new BaseDatos()
    private validador = new ValidadorDatos()
    private auditoria = new AuditoriaService()

    // D3, D7 — registra un autobús nuevo en el sistema
    async registrarAutobus(datos: DatosRegistroAutobus, usuarioEmail: string): Promise<ResultadoRegistro> {
        const mapa = new Map<string, unknown>(Object.entries(datos))

        // D7 E1 — valida campos obligatorios
        if (!this.validador.validarCamposObligatorios(mapa)) {
            await this.auditoria.registrarError(usuarioEmail, 'registrarAutobus', 'Campos obligatorios faltantes')
            return { exito: false, motivo: 'campos_faltantes' }
        }

        // D7 E3 — valida formatos
        if (!this.validador.validarFormatos(mapa)) {
            await this.auditoria.registrarError(usuarioEmail, 'registrarAutobus', `Formato inválido: ${datos.placas}/${datos.vin}`)
            return { exito: false, motivo: 'formato_invalido' }
        }

        // D7 E2 — verifica duplicado
        const hayDuplicado = await this.bd.verificarDuplicado(datos.placas, datos.numeroEconomico, datos.vin)
        if (hayDuplicado) {
            await this.auditoria.registrarError(usuarioEmail, 'registrarAutobus', `Duplicado detectado: ${datos.numeroEconomico}/${datos.placas}`)
            return { exito: false, motivo: 'duplicado' }
        }

        // D7 — crea instancia y establece estado Disponible
        const autobusID = randomUUID()
        const nuevoBus = new Autobus(
            autobusID,
            datos.numeroEconomico,
            datos.placas,
            datos.vin,
            datos.marca,
            datos.modelo,
            datos.anio,
            datos.capacidadAsientos,
            datos.tipoAutobus,
            EstadoAutobus.DISPONIBLE,
        )
        nuevoBus.establecerDisponible()

        // D7 — guarda en BD
        const guardado = await this.bd.guardarAutobus(nuevoBus)
        if (!guardado) {
            await this.auditoria.registrarError(usuarioEmail, 'registrarAutobus', `Error al guardar: ${datos.numeroEconomico}`)
            return { exito: false, motivo: 'error_bd' }
        }

        // D7 — crea asientos automáticamente según capacidad
        await this._crearAsientos(autobusID, datos.capacidadAsientos)

        // D7 — registra en log: "Alta de autobús"
        await this.auditoria.registrarEvento(
            usuarioEmail,
            'Alta de autobús',
            `${datos.numeroEconomico}/${datos.placas}`
        )

        return { exito: true, autobusID, numeroEconomico: datos.numeroEconomico }
    }

    // D4 — actualiza datos modificables de un autobús existente
    async actualizarAutobus(autobusID: string, datos: DatosActualizacionAutobus, usuarioEmail: string): Promise<ResultadoActualizacion> {
        const registroActual = await prisma.autobus.findUnique({ where: { autobusID } })
        if (!registroActual) return { exito: false, motivo: 'no_encontrado' }

        const bus = new Autobus(
            registroActual.autobusID,
            registroActual.numeroEconomico,
            registroActual.placas,
            registroActual.vin,
            registroActual.marca,
            registroActual.modelo,
            registroActual.anio,
            registroActual.capacidadAsientos,
            registroActual.tipoServicio,
            registroActual.estadoOperativo,
            registroActual.fechaRegistro,
        )

        const mapa = new Map<string, unknown>(Object.entries(datos).filter(([, v]) => v !== undefined))
        bus.actualizarDatosAutobus(mapa)

        const ok = await this.bd.guardarCambios(bus)
        if (!ok) return { exito: false, motivo: 'error_bd' }

        await this.auditoria.registrarEvento(usuarioEmail, 'Actualización autobús', autobusID)
        return { exito: true }
    }

    private async _crearAsientos(autobusID: string, capacidad: number): Promise<void> {
        const letras = ['A', 'B', 'C', 'D']
        const filas = Math.ceil(capacidad / 4)
        const asientos = []
        let count = 0
        for (let fila = 1; fila <= filas && count < capacidad; fila++) {
            for (const letra of letras) {
                if (count >= capacidad) break
                asientos.push({ autobusID, numero: `${fila}${letra}` })
                count++
            }
        }
        await prisma.asiento.createMany({ data: asientos, skipDuplicates: true })
    }
}
