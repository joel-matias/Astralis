'use client'

import { useState, useTransition, useRef } from 'react'
import { RutaMapWrapper } from '../RutaMapWrapper'
import { crearRuta, calcularDistanciaRuta } from '../../actions'
import type { DatosBasicos } from './PasoIngresoBasico'
import type { ParadaWizard } from './PasoConfiguracionParadas'
import type { RutaDTO } from '@/models/rutas/RutaDTO'

interface Props {
    datos: DatosBasicos
    paradas: ParadaWizard[]
    onAtras: () => void
    onGuardado: (rutaID: string) => void
}

// Estados internos del paso (VisualizandoMapa → CalculandoRuta → ResultadoCalculado)
type EstadoMapa = 'visualizando' | 'calculando' | 'resultado'

export function PasoVisualizacionMapa({ datos, paradas, onAtras, onGuardado }: Props) {
    const [estadoMapa, setEstadoMapa] = useState<EstadoMapa>('visualizando')
    const [distanciaKm, setDistanciaKm] = useState(0)
    const [tiempoHrs, setTiempoHrs] = useState(0)
    const [errorAPI, setErrorAPI] = useState(false)      // E6: ErrorAPIMapas
    const [error, setError] = useState<string | null>(null)
    const [warning, setWarning] = useState<string | null>(null)  // E4: AdvertenciaDuplicado
    const [isPending, startTransition] = useTransition()
    const ultimosDatosRef = useRef<RutaDTO | null>(null)

    // S2: CalculandoRuta — llama a Mapbox para obtener distancia y tiempo reales
    async function calcular() {
        setEstadoMapa('calculando')
        setErrorAPI(false)
        setError(null)

        const ciudadesParadas = paradas.map(p => p.ciudad)
        const resultado = await calcularDistanciaRuta(datos.ciudadOrigen, datos.ciudadDestino, ciudadesParadas)

        if (resultado.distanciaKm === 0) {
            // E6: API no disponible — el usuario puede ingresar valores manualmente
            setErrorAPI(true)
            setEstadoMapa('visualizando')
        } else {
            setDistanciaKm(resultado.distanciaKm)
            setTiempoHrs(resultado.tiempoHoras)
            setEstadoMapa('resultado')
        }
    }

    function buildRutaDTO(omitirDuplicado = false): RutaDTO {
        return {
            codigoRuta: datos.codigoRuta,
            tipoRuta: datos.tipoRuta,
            tarifaBase: datos.tarifaBase,
            ciudadOrigen: datos.ciudadOrigen,
            terminalOrigen: datos.terminalOrigen,
            ciudadDestino: datos.ciudadDestino,
            terminalDestino: datos.terminalDestino,
            distanciaKm,
            tiempoEstimadoHrs: tiempoHrs,
            paradas: paradas.map(({ key: _k, ...rest }) => rest),
            omitirDuplicado,
        }
    }

    function guardar(omitirDuplicado = false) {
        setError(null)
        setWarning(null)

        if (distanciaKm <= 0 || tiempoHrs <= 0) {
            setError('Ingresa la distancia y el tiempo estimado antes de guardar.')
            return
        }

        const dto = buildRutaDTO(omitirDuplicado)
        ultimosDatosRef.current = dto

        startTransition(async () => {
            const resultado = await crearRuta(dto)
            if (!resultado) return
            if ('warning' in resultado) {
                setWarning(resultado.warning)
            } else if ('error' in resultado) {
                setError(resultado.error)
            } else if ('rutaID' in resultado) {
                onGuardado(resultado.rutaID)
            }
        })
    }

    return (
        <div className="space-y-6">

            {/* Mapa del trayecto */}
            <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <div className="flex items-center gap-3 p-6 border-b border-surface-container-low">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">map</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-headline">Visualización del Trayecto</h2>
                        <p className="text-sm text-secondary">
                            {datos.ciudadOrigen} → {datos.ciudadDestino}
                            {paradas.length > 0 && ` · ${paradas.length} parada${paradas.length > 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>
                <div className="h-72 relative">
                    <RutaMapWrapper
                        origen={datos.ciudadOrigen}
                        destino={datos.ciudadDestino}
                        paradas={paradas.map(p => ({ ciudad: p.ciudad }))}
                    />
                </div>
            </section>

            {/* CalculandoRuta / ResultadoCalculado / ErrorAPIMapas */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_0_40px_rgba(20,27,44,0.04)]">

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">straighten</span>
                    </div>
                    <h2 className="text-xl font-bold font-headline">Distancia y Tiempo</h2>
                </div>

                {errorAPI && (
                    <div data-testid="error-api-mapas" role="alert"
                        className="flex items-center gap-3 px-5 py-4 mb-6 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                        <span className="material-symbols-outlined shrink-0">wifi_off</span>
                        No se pudo conectar con el servicio de mapas. Ingresa los valores manualmente.
                    </div>
                )}

                {error && (
                    <div data-testid="ruta-form-error" role="alert"
                        className="flex items-center gap-3 px-5 py-4 mb-6 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                        <span className="material-symbols-outlined shrink-0">error</span>
                        {error}
                    </div>
                )}

                {/* E4: AdvertenciaDuplicado */}
                {warning && (
                    <div data-testid="ruta-form-warning" role="alert"
                        className="flex items-start gap-3 px-5 py-4 mb-6 bg-tertiary-container text-on-tertiary-container rounded-xl text-sm">
                        <span className="material-symbols-outlined shrink-0 mt-0.5">warning</span>
                        <div className="flex-1">
                            <p className="font-semibold mb-3">{warning}</p>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => guardar(true)} disabled={isPending}
                                    className="px-4 py-1.5 bg-on-tertiary-container text-tertiary-container rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-60">
                                    Guardar de todas formas
                                </button>
                                <button type="button" onClick={() => setWarning(null)}
                                    className="px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-tertiary-container/50 transition-colors">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                    <div className="flex items-center gap-6 p-6 bg-surface-container-low rounded-xl">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <span className="material-symbols-outlined">distance</span>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-secondary uppercase mb-1 tracking-wider">
                                Distancia Total <span className="text-error">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number" min="0" step="0.1"
                                    value={distanciaKm || ''}
                                    onChange={e => setDistanciaKm(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-24 bg-transparent border-0 text-2xl font-bold p-0 focus:ring-0 text-on-surface"
                                />
                                <span className="text-lg font-medium text-secondary">km</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 p-6 bg-surface-container-low rounded-xl">
                        <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                            <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-secondary uppercase mb-1 tracking-wider">
                                Tiempo Estimado <span className="text-error">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number" min="0" step="0.5"
                                    value={tiempoHrs || ''}
                                    onChange={e => setTiempoHrs(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-24 bg-transparent border-0 text-2xl font-bold p-0 focus:ring-0 text-on-surface"
                                />
                                <span className="text-lg font-medium text-secondary">hrs</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón S2: Calcular Dist. y Tiempo */}
                <button
                    type="button"
                    onClick={calcular}
                    disabled={estadoMapa === 'calculando' || isPending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-sm font-bold text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {estadoMapa === 'calculando' ? (
                        <>
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            Calculando ruta...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">calculate</span>
                            {estadoMapa === 'resultado' ? 'Recalcular con Mapbox' : 'Calcular Dist. y Tiempo'}
                        </>
                    )}
                </button>

                {estadoMapa === 'resultado' && (
                    <p className="text-center text-xs text-secondary mt-3">
                        Valores calculados automáticamente. Puedes ajustarlos manualmente si es necesario.
                    </p>
                )}
            </section>

            <div className="flex items-center justify-between pt-2">
                <button
                    type="button"
                    onClick={onAtras}
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-outline-variant font-bold text-secondary hover:bg-surface-container-low transition-all disabled:opacity-60"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Atrás
                </button>
                <button
                    type="button"
                    onClick={() => guardar()}
                    disabled={isPending}
                    className="flex items-center gap-2 px-12 py-3 rounded-xl bg-linear-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isPending ? 'Guardando...' : 'Guardar Ruta'}
                    {!isPending && <span className="material-symbols-outlined">save</span>}
                </button>
            </div>
        </div>
    )
}
