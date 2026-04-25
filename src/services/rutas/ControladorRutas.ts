import { Ruta, type TipoRuta } from '@/models/rutas/Ruta'
import { LogAuditoria } from '@/models/rutas/LogAuditoria'
import { ValidadorRuta } from './ValidadorRuta'
import { GestorParadas } from './GestorParadas'
import { APIMapas } from './APIMapas'
import { AuditoriaService } from './AuditoriaService'
import { RepositorioRutas } from '@/repositories/rutas/RepositorioRutas'
import type { DatosParada } from './GestorParadas'

export interface DatosCreacionRuta {
    codigoRuta: string
    nombreRuta: string
    ciudadOrigen: string
    terminalOrigen: string
    ciudadDestino: string
    terminalDestino: string
    distanciaKm: number
    tiempoEstimadoHrs: number
    tipoRuta: 'Directa' | 'ConParadas'
    tarifaBase: number
    estado: 'Activa' | 'Inactiva'
    paradas?: DatosParada[]
    usuarioID: string
}

export interface ResultadoCreacion {
    codigoGenerado: string
    rutaID: string
    duplicado?: string
}

export class ControladorRutas {
    private validador = new ValidadorRuta()
    private gestorParadas = new GestorParadas()
    private apiMapas = new APIMapas()
    private repositorio = new RepositorioRutas()
    private auditoria = new AuditoriaService()

    async procesarCreacion(datosRuta: DatosCreacionRuta): Promise<ResultadoCreacion> {
        // Pasos 8-13: validación en tres fases via ValidadorRuta
        const datosPlanos = datosRuta as unknown as Record<string, unknown>
        if (!this.validador.validarCamposObligatorios(datosPlanos)) {
            throw new Error('Completa todos los campos obligatorios.')
        }
        if (!this.validador.validarOrigenDistintoDestino(datosRuta.ciudadOrigen, datosRuta.ciudadDestino)) {
            throw new Error('El origen y destino no pueden ser iguales.')
        }
        if (!this.validador.validarValoresNumericos(datosRuta.distanciaKm, datosRuta.tiempoEstimadoHrs, datosRuta.tarifaBase)) {
            throw new Error('Distancia, tiempo y tarifa deben ser mayores a 0.')
        }

        // Paso 14-16: calcular distancia/tiempo via APIMapas (condicional S2)
        const calculos = await this.apiMapas.calcularDistanciaYTiempo(
            datosRuta.ciudadOrigen,
            datosRuta.ciudadDestino,
            datosRuta.paradas?.map(p => p.ciudad) ?? []
        )
        if (calculos.distanciaKm > 0) {
            datosRuta.distanciaKm = calculos.distanciaKm
            datosRuta.tiempoEstimadoHrs = calculos.tiempoHoras
        }

        // Paso 17-19: procesar paradas si tipo = ConParadas via GestorParadas → ParadaIntermedia
        const paradasProcesadas = datosRuta.tipoRuta === 'ConParadas' && datosRuta.paradas?.length
            ? this.gestorParadas.procesarParadas(datosRuta.paradas)
            : []

        // Paso 15: verificar duplicado en BD antes de crear la instancia
        const codigoDuplicado = await this.repositorio.verificarDuplicado(
            datosRuta.ciudadOrigen,
            datosRuta.ciudadDestino
        )

        // D4: instanciar el modelo Ruta con los datos validados y calculados
        const tipoRuta: TipoRuta = datosRuta.tipoRuta === 'ConParadas' ? 'ConParadas' : 'Directa'
        const ruta = new Ruta(
            crypto.randomUUID(),
            datosRuta.codigoRuta,
            datosRuta.nombreRuta,
            datosRuta.ciudadOrigen,
            datosRuta.terminalOrigen,
            datosRuta.ciudadDestino,
            datosRuta.terminalDestino,
            datosRuta.distanciaKm,
            datosRuta.tiempoEstimadoHrs,
            tipoRuta,
            datosRuta.tarifaBase,
            datosRuta.estado === 'Activa' ? 'Activa' : 'Inactiva'
        )

        // D4: agregarParada() valida e inserta cada parada en la lista ordenada del modelo
        for (const p of paradasProcesadas) {
            ruta.agregarParada(p)
        }

        // D4: validarDatos() verifica la integridad completa de la instancia antes de persistir
        if (!ruta.validarDatos()) {
            throw new Error('Datos de la ruta inválidos tras validación del modelo.')
        }

        // Paso 20-21: guardar la instancia Ruta via repositorio (usa getters del modelo)
        const { codigoRuta: codigoGenerado, rutaID } = await this.repositorio.guardarRuta(ruta, datosRuta.usuarioID)

        // Paso 22: instanciar LogAuditoria, llamar registrar() y persistir vía AuditoriaService
        const log = new LogAuditoria(
            crypto.randomUUID(),
            datosRuta.usuarioID,
            'CREAR_RUTA',
            new Date(),
            'Exito'
        )
        log.registrar('CREAR_RUTA', 'Exito')
        await this.auditoria.registrarCreacion(
            datosRuta.usuarioID,
            codigoGenerado,
            log.getFechaHora()
        )

        return {
            codigoGenerado,
            rutaID,
            ...(codigoDuplicado ? { duplicado: codigoDuplicado } : {}),
        }
    }

    // D7: validación server-side de cada parada antes de agregarla a la lista
    async validarParada(
        parada: DatosParada,
        distanciaTotal: number,
        paradasExistentes: DatosParada[]
    ): Promise<{ valida: boolean; errorDetalle: string | null }> {
        const procesadas = this.gestorParadas.procesarParadas([{ ...parada, ordenEnRuta: 1, tiempoDesdeOrigen: 0 }])
        if (procesadas.length === 0) {
            return { valida: false, errorDetalle: 'Datos de la parada incompletos o inválidos.' }
        }
        if (distanciaTotal > 0 && parada.distanciaDesdeOrigenKm >= distanciaTotal) {
            return { valida: false, errorDetalle: 'La distancia de la parada excede la distancia total de la ruta.' }
        }
        const ciudadDuplicada = paradasExistentes.some(
            p => p.ciudad.trim().toLowerCase() === parada.ciudad.trim().toLowerCase()
        )
        if (ciudadDuplicada) {
            return { valida: false, errorDetalle: `Ya existe una parada en ${parada.ciudad}.` }
        }
        return { valida: true, errorDetalle: null }
    }

    // D4: fetch Ruta → activar()/desactivar() → persiste nuevo estado + LogAuditoria
    // D4: fetch Ruta → activar()/desactivar() → persiste nuevo estado + LogAuditoria
    async toggleEstado(rutaID: string, estadoActual: 'Activa' | 'Inactiva', usuarioID: string): Promise<void> {
        const ruta = await this.repositorio.findByID(rutaID)
        if (!ruta) throw new Error('Ruta no encontrada')

        if (ruta.getEstado() === 'Activa') {
            ruta.desactivar()
        } else {
            ruta.activar()
        }

        const codigoRuta = await this.repositorio.actualizarEstado(rutaID, ruta.getEstado())
        const accion = ruta.getEstado() === 'Activa' ? 'ACTIVAR_RUTA' : 'DESACTIVAR_RUTA'
        await this.auditoria.registrarEvento(usuarioID, accion, codigoRuta)

        void estadoActual // el estado real proviene del modelo; este param queda por compatibilidad de firma
    }

    async procesarActualizacion(rutaID: string, datosRuta: DatosCreacionRuta): Promise<ResultadoCreacion> {
        const datosPlanos = datosRuta as unknown as Record<string, unknown>
        if (!this.validador.validarCamposObligatorios(datosPlanos)) {
            throw new Error('Completa todos los campos obligatorios.')
        }
        if (!this.validador.validarOrigenDistintoDestino(datosRuta.ciudadOrigen, datosRuta.ciudadDestino)) {
            throw new Error('El origen y destino no pueden ser iguales.')
        }
        if (!this.validador.validarValoresNumericos(datosRuta.distanciaKm, datosRuta.tiempoEstimadoHrs, datosRuta.tarifaBase)) {
            throw new Error('Distancia, tiempo y tarifa deben ser mayores a 0.')
        }

        const codigoDuplicado = await this.repositorio.verificarDuplicado(
            datosRuta.ciudadOrigen,
            datosRuta.ciudadDestino,
            rutaID
        )

        const paradasProcesadas = datosRuta.tipoRuta === 'ConParadas' && datosRuta.paradas?.length
            ? this.gestorParadas.procesarParadas(datosRuta.paradas)
            : []

        // D4: instanciar Ruta con datos actualizados, agregar paradas, validar
        const tipoRuta: TipoRuta = datosRuta.tipoRuta === 'ConParadas' ? 'ConParadas' : 'Directa'
        const ruta = new Ruta(
            rutaID,
            datosRuta.codigoRuta,
            datosRuta.nombreRuta,
            datosRuta.ciudadOrigen,
            datosRuta.terminalOrigen,
            datosRuta.ciudadDestino,
            datosRuta.terminalDestino,
            datosRuta.distanciaKm,
            datosRuta.tiempoEstimadoHrs,
            tipoRuta,
            datosRuta.tarifaBase,
            'Activa'
        )

        for (const p of paradasProcesadas) {
            ruta.agregarParada(p)
        }

        if (!ruta.validarDatos()) {
            throw new Error('Datos de la ruta inválidos tras validación del modelo.')
        }

        await this.repositorio.actualizarRuta(rutaID, ruta)

        return {
            codigoGenerado: datosRuta.codigoRuta,
            rutaID,
            ...(codigoDuplicado ? { duplicado: codigoDuplicado } : {}),
        }
    }

    // Stub — la integración real con notificaciones se define en CU posteriores.
    async notificarCambios(rutaID: string): Promise<void> {
        void rutaID
    }
}
