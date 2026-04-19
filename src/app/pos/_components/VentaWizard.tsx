'use client'

import { useState } from 'react'
import type { EstadoVenta } from '../../../models/boletos/EstadoVenta'
import ResumenVenta from './ResumenVenta'
import PasoBuscandoViaje from './pasos/PasoBuscandoViaje'
import PasoAsientosReservados from './pasos/PasoAsientosReservados'
import PasoProcesandoPago from './pasos/PasoProcesandoPago'
import PasoBoletoEmitido from './pasos/PasoBoletoEmitido'
import PasoVentaFinalizada from './pasos/PasoVentaFinalizada'

export type ViajeSeleccionado = {
    id: string
    autobusID: string
    origen: string
    destino: string
    fecha: string
    hora: string
    tipoServicio: string
    precio: number
    asientosLibres: number
}

export type AsientoSeleccionado = {
    numero: string
    asientoID: string
}

export type DatosVenta = {
    viaje: ViajeSeleccionado | null
    numPasajeros: number
    asientos: AsientoSeleccionado[]
    cliente: { nombre: string; email: string } | null
    metodoPago: 'TPV' | 'EFECTIVO' | null
    montoRecibido: number
    transaccionId: string
    boletos: { id: string; qr: string; asiento: string }[]
}

const PASOS = [
    { key: 'buscar',   label: 'Buscar viaje', icon: 'search'                     },
    { key: 'asientos', label: 'Asientos',     icon: 'airline_seat_recline_extra' },
    { key: 'pago',     label: 'Pago',         icon: 'payments'                   },
    { key: 'boleto',   label: 'Boleto',       icon: 'confirmation_number'        },
]

const ESTADO_A_PASO: Record<EstadoVenta, number> = {
    Iniciado:                  0,
    BuscandoViaje:             0,
    ViajeSeleccionado:         1,
    AsientosReservados:        1,
    ProcesandoPago:            2,
    PagoAprobado:              2,
    PagoRechazado:             2,
    BoletoEmitido:             3,
    ComprobanteFiscalGenerado: 3,
    VentaFinalizada:           3,
}

const datosIniciales: DatosVenta = {
    viaje: null,
    numPasajeros: 1,
    asientos: [],
    cliente: null,
    metodoPago: null,
    montoRecibido: 0,
    transaccionId: '',
    boletos: [],
}

interface Props {
    origenes: string[]
}

export default function VentaWizard({ origenes }: Props) {
    const [estado, setEstado] = useState<EstadoVenta>('BuscandoViaje')
    const [datos, setDatos] = useState<DatosVenta>(datosIniciales)

    const pasoActivo = ESTADO_A_PASO[estado] ?? 0
    const esCompleto = estado === 'VentaFinalizada'

    function nueva() {
        setEstado('BuscandoViaje')
        setDatos(datosIniciales)
    }

    return (
        <div className="flex gap-6 items-start">
            {/* Panel izquierdo — flujo de venta */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Indicador de pasos */}
                {!esCompleto && (
                    <div className="bg-surface-container-lowest border-b border-outline-variant px-8 py-3 shrink-0">
                        <div className="flex items-center gap-2">
                            {PASOS.map((paso, i) => {
                                const activo    = i === pasoActivo
                                const completado = i < pasoActivo
                                return (
                                    <div key={paso.key} className="flex items-center gap-2">
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                            activo
                                                ? 'bg-primary text-on-primary'
                                                : completado
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-surface-container text-secondary'
                                        }`}>
                                            <span className="material-symbols-outlined text-[16px]"
                                                style={completado ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                                                {completado ? 'check_circle' : paso.icon}
                                            </span>
                                            <span>{paso.label}</span>
                                        </div>
                                        {i < PASOS.length - 1 && (
                                            <span className={`h-px w-8 ${i < pasoActivo ? 'bg-primary' : 'bg-outline-variant'}`} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Contenido del paso activo */}
                <div className="flex-1">
                    {(estado === 'BuscandoViaje' || estado === 'Iniciado') && (
                        <PasoBuscandoViaje
                            origenes={origenes}
                            onViajeSeleccionado={(viaje, numPasajeros) => {
                                setDatos(d => ({ ...d, viaje, numPasajeros, asientos: [] }))
                                setEstado('ViajeSeleccionado')
                            }}
                        />
                    )}
                    {(estado === 'ViajeSeleccionado' || estado === 'AsientosReservados') && (
                        <PasoAsientosReservados
                            viaje={datos.viaje!}
                            numPasajeros={datos.numPasajeros}
                            asientosSeleccionados={datos.asientos}
                            onAsientosConfirmados={(asientos) => {
                                setDatos(d => ({ ...d, asientos }))
                                setEstado('AsientosReservados')
                            }}
                            onContinuar={() => setEstado('ProcesandoPago')}
                            onVolver={() => setEstado('BuscandoViaje')}
                        />
                    )}
                    {(estado === 'ProcesandoPago' || estado === 'PagoRechazado') && (
                        <PasoProcesandoPago
                            datos={datos}
                            rechazado={estado === 'PagoRechazado'}
                            onPagoExitoso={(cliente, metodoPago, montoRecibido, transaccionId, boletos) => {
                                setDatos(d => ({ ...d, cliente, metodoPago, montoRecibido, transaccionId, boletos }))
                                setEstado('BoletoEmitido')
                            }}
                            onPagoRechazado={() => setEstado('PagoRechazado')}
                            onVolver={() => setEstado('AsientosReservados')}
                        />
                    )}
                    {(estado === 'BoletoEmitido' || estado === 'ComprobanteFiscalGenerado') && (
                        <PasoBoletoEmitido
                            datos={datos}
                            onFinalizar={() => setEstado('VentaFinalizada')}
                        />
                    )}
                    {estado === 'VentaFinalizada' && (
                        <PasoVentaFinalizada
                            datos={datos}
                            onNuevaVenta={nueva}
                        />
                    )}
                </div>
            </div>

            {/* Panel derecho — resumen de venta */}
            {!esCompleto && (
                <ResumenVenta
                    datos={datos}
                    estado={estado}
                    onConfirmarPago={() => setEstado('ProcesandoPago')}
                />
            )}
        </div>
    )
}
