'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { EstadoRuta } from '@prisma/client'
import { toggleEstadoRuta } from '../actions'
import { PasoIngresoBasico } from './pasos/PasoIngresoBasico'
import { PasoConfiguracionParadas } from './pasos/PasoConfiguracionParadas'
import { PasoVisualizacionMapa } from './pasos/PasoVisualizacionMapa'
import type { DatosBasicos } from './pasos/PasoIngresoBasico'
import type { ParadaWizard } from './pasos/PasoConfiguracionParadas'

// Estados del wizard según D6: FormularioInicial → IngresoBasico → ... → PreguntandoActivacion
type EstadoWizard =
    | 'ingreso_basico'
    | 'configurando_paradas'
    | 'visualizando_mapa'
    | 'preguntando_activacion'

interface Props {
    codigoGenerado: string
}

export function RutaWizard({ codigoGenerado }: Props) {
    const router = useRouter()
    const [estado, setEstado] = useState<EstadoWizard>('ingreso_basico')
    const [datosBasicos, setDatosBasicos] = useState<DatosBasicos | null>(null)
    const [paradas, setParadas] = useState<ParadaWizard[]>([])
    const [rutaIDGuardada, setRutaIDGuardada] = useState<string | null>(null)
    const [activando, startTransition] = useTransition()

    // Transición ValidandoDatosBasicos → ConfigurandoParadas | VisualizandoMapa
    function handleSiguiente(datos: DatosBasicos) {
        setDatosBasicos(datos)
        if (datos.tipoRuta === 'CON_PARADAS') {
            setEstado('configurando_paradas')
        } else {
            setEstado('visualizando_mapa')
        }
    }

    function handleFinalizarParadas(paradasFinales: ParadaWizard[]) {
        setParadas(paradasFinales)
        setEstado('visualizando_mapa')
    }

    // Ruta guardada como Inactiva (RN3) → PreguntandoActivacion
    function handleGuardado(rutaID: string) {
        setRutaIDGuardada(rutaID)
        setEstado('preguntando_activacion')
    }

    function activarRuta() {
        if (!rutaIDGuardada) return
        startTransition(async () => {
            await toggleEstadoRuta(rutaIDGuardada, EstadoRuta.INACTIVA)
            router.push('/admin/rutas')
        })
    }

    function noActivar() {
        router.push('/admin/rutas')
    }

    // Paso actual para el indicador (1-based, excluyendo el estado de activación)
    const pasoActual = estado === 'ingreso_basico' ? 1
        : estado === 'configurando_paradas' ? 2
            : 3
    const totalPasos = datosBasicos?.tipoRuta === 'CON_PARADAS' ? 3 : 2

    const pasosMostrados = datosBasicos?.tipoRuta === 'CON_PARADAS'
        ? ['Datos Básicos', 'Paradas', 'Mapa y Ruta']
        : ['Datos Básicos', 'Mapa y Ruta']

    const pasoIndex = datosBasicos?.tipoRuta === 'CON_PARADAS'
        ? pasoActual - 1
        : pasoActual === 1 ? 0 : 1

    return (
        <div className="space-y-8">

            {/* Indicador de pasos — visible mientras no se esté en PreguntandoActivacion */}
            {estado !== 'preguntando_activacion' && (
                <nav className="flex items-center gap-0">
                    {pasosMostrados.map((nombre, i) => {
                        const activo = i === pasoIndex
                        const completado = i < pasoIndex
                        return (
                            <div key={nombre} className="flex items-center flex-1">
                                <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all ${activo
                                        ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                                        : completado
                                            ? 'bg-surface-container-high text-primary'
                                            : 'bg-surface-container-low text-outline'
                                    }`}>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activo
                                            ? 'bg-on-primary/20'
                                            : completado
                                                ? 'bg-primary text-on-primary'
                                                : 'bg-surface-container text-outline'
                                        }`}>
                                        {completado
                                            ? <span className="material-symbols-outlined text-sm">check</span>
                                            : i + 1
                                        }
                                    </span>
                                    <span className="text-sm font-semibold hidden sm:block">{nombre}</span>
                                </div>
                                {i < pasosMostrados.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 ${completado ? 'bg-primary' : 'bg-surface-container-high'}`} />
                                )}
                            </div>
                        )
                    })}
                    <div className="text-xs text-secondary ml-4 whitespace-nowrap hidden sm:block">
                        {pasoIndex + 1} de {totalPasos}
                    </div>
                </nav>
            )}

            {/* Paso 1: IngresoBasico */}
            {estado === 'ingreso_basico' && (
                <PasoIngresoBasico
                    codigoGenerado={codigoGenerado}
                    onSiguiente={handleSiguiente}
                />
            )}

            {/* Paso 2: ConfigurandoParadas (solo si tipoRuta = CON_PARADAS) */}
            {estado === 'configurando_paradas' && (
                <PasoConfiguracionParadas
                    paradas={paradas}
                    onFinalizar={handleFinalizarParadas}
                    onAtras={() => setEstado('ingreso_basico')}
                />
            )}

            {/* Paso 3: VisualizandoMapa → CalculandoRuta → ResultadoCalculado → GuardandoEnBD */}
            {estado === 'visualizando_mapa' && datosBasicos && (
                <PasoVisualizacionMapa
                    datos={datosBasicos}
                    paradas={paradas}
                    onAtras={() => setEstado(datosBasicos.tipoRuta === 'CON_PARADAS' ? 'configurando_paradas' : 'ingreso_basico')}
                    onGuardado={handleGuardado}
                />
            )}

            {/* RutaGuardadaInactiva → PreguntandoActivacion */}
            {estado === 'preguntando_activacion' && (
                <div className="flex items-center justify-center min-h-100">
                    <div className="bg-surface-container-lowest rounded-2xl p-10 shadow-[0_0_80px_rgba(20,27,44,0.08)] max-w-md w-full text-center">

                        <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-3xl text-primary">check_circle</span>
                        </div>

                        <h2 className="text-2xl font-extrabold font-headline text-on-surface mb-2">
                            Ruta Guardada
                        </h2>
                        <p className="text-secondary text-sm mb-2">
                            La ruta fue registrada como <strong>Inactiva</strong>.
                        </p>
                        <p className="text-secondary text-sm mb-8">
                            ¿Deseas activarla ahora para que esté disponible para programar viajes?
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={activarRuta}
                                disabled={activando}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 disabled:opacity-60"
                            >
                                <span className="material-symbols-outlined">power_settings_new</span>
                                {activando ? 'Activando...' : 'Activar Ahora'}
                            </button>
                            <button
                                type="button"
                                onClick={noActivar}
                                disabled={activando}
                                className="w-full px-6 py-3 rounded-xl border border-outline-variant font-bold text-secondary hover:bg-surface-container-low transition-all disabled:opacity-60"
                            >
                                No activar por ahora
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
