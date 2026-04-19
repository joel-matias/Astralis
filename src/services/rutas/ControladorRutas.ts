import { ValidadorRuta } from './ValidadorRuta'
import { GestorParadas } from './GestorParadas'
import { APIMapas } from './APIMapas'
import { RepositorioRutas } from '@/repositories/rutas/RepositorioRutas'
import { LogAuditoria } from '@/models/rutas/LogAuditoria'
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

    async procesarCreacion(datosRuta: DatosCreacionRuta): Promise<ResultadoCreacion> {
        // Pasos 8-13: validación en tres fases
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

        // Paso 14-16: calcular distancia/tiempo via API Mapas (condicional S2)
        const calculos = await this.apiMapas.calcularDistanciaYTiempo(
            datosRuta.ciudadOrigen,
            datosRuta.ciudadDestino,
            datosRuta.paradas?.map(p => p.ciudad) ?? []
        )
        if (calculos.distanciaKm > 0) {
            datosRuta.distanciaKm = calculos.distanciaKm
            datosRuta.tiempoEstimadoHrs = calculos.tiempoHoras
        }

        // Paso 17-19: procesar paradas si tipo = ConParadas
        const paradasProcesadas = datosRuta.tipoRuta === 'ConParadas' && datosRuta.paradas?.length
            ? this.gestorParadas.procesarParadas(datosRuta.paradas)
            : []

        // Paso 15: verificar duplicado antes de guardar
        const codigoDuplicado = await this.repositorio.verificarDuplicado(
            datosRuta.ciudadOrigen,
            datosRuta.ciudadDestino
        )

        // Paso 20-21: guardar ruta
        const { codigoRuta: codigoGenerado, rutaID } = await this.repositorio.guardarRuta({
            ...datosRuta,
            paradas: paradasProcesadas,
        })

        // Paso 22: registrar en LogAuditoria
        const log = new LogAuditoria(
            crypto.randomUUID(),
            datosRuta.usuarioID,
            'CREAR_RUTA',
            new Date(),
            'Exito'
        )
        log.registrar('CREAR_RUTA', 'Exito')
        await this.repositorio.registrarLog(
            datosRuta.usuarioID,
            log.getAccion(),
            codigoGenerado,
            log.getFechaHora()
        )

        return {
            codigoGenerado,
            rutaID,
            ...(codigoDuplicado ? { duplicado: codigoDuplicado } : {}),
        }
    }

    // Notifica a los sistemas relacionados cuando una ruta cambia de estado o datos.
    // Stub — la integración real con notificaciones se define en CU posteriores.
    async notificarCambios(rutaID: string): Promise<void> {
        void rutaID
    }
}
