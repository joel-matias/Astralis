'use client'

import { useState, type FormEvent } from 'react'
import { CityInput } from '../CityInput'

// Datos recogidos en el paso 1 — se pasan al wizard y luego al paso 3 para guardar
export interface DatosBasicos {
    codigoRuta: string
    tipoRuta: string   // 'DIRECTA' | 'CON_PARADAS'
    tarifaBase: number
    ciudadOrigen: string
    terminalOrigen: string
    ciudadDestino: string
    terminalDestino: string
}

interface Props {
    codigoGenerado: string
    defaultValues?: Partial<DatosBasicos>
    onSiguiente: (datos: DatosBasicos) => void
}

// Estados de error del diagrama D6: E1, E2, E3
type ErrorEstado = 'ErrorCamposVacios' | 'ErrorOrigenDestino' | 'ErrorValoresNumericos' | null

export function PasoIngresoBasico({ codigoGenerado, defaultValues = {}, onSiguiente }: Props) {
    const [errorEstado, setErrorEstado] = useState<ErrorEstado>(null)

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrorEstado(null)
        const form = e.currentTarget
        const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value?.trim() ?? ''

        const datos: DatosBasicos = {
            codigoRuta: get('codigoRuta'),
            tipoRuta: get('tipoRuta'),
            tarifaBase: parseFloat(get('tarifaBase')) || 0,
            ciudadOrigen: get('ciudadOrigen'),
            terminalOrigen: get('terminalOrigen'),
            ciudadDestino: get('ciudadDestino'),
            terminalDestino: get('terminalDestino'),
        }

        // E1: campos obligatorios vacíos
        if (!datos.codigoRuta || !datos.ciudadOrigen || !datos.terminalOrigen ||
            !datos.ciudadDestino || !datos.terminalDestino) {
            setErrorEstado('ErrorCamposVacios')
            return
        }

        // E2: origen igual a destino
        if (datos.ciudadOrigen.toLowerCase() === datos.ciudadDestino.toLowerCase()) {
            setErrorEstado('ErrorOrigenDestino')
            return
        }

        // E3: tarifa base inválida (distancia/tiempo se validan en paso 3)
        if (datos.tarifaBase <= 0) {
            setErrorEstado('ErrorValoresNumericos')
            return
        }

        onSiguiente(datos)
    }

    return (
        <form onSubmit={handleSubmit} noValidate>

            {errorEstado === 'ErrorCamposVacios' && (
                <div data-testid="error-campos-vacios" role="alert"
                    className="flex items-center gap-3 px-5 py-4 mb-6 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                    <span className="material-symbols-outlined shrink-0">error</span>
                    Completa todos los campos obligatorios antes de continuar.
                </div>
            )}

            {errorEstado === 'ErrorOrigenDestino' && (
                <div data-testid="error-origen-destino" role="alert"
                    className="flex items-center gap-3 px-5 py-4 mb-6 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                    <span className="material-symbols-outlined shrink-0">error</span>
                    La ciudad de origen y destino no pueden ser iguales.
                </div>
            )}

            {errorEstado === 'ErrorValoresNumericos' && (
                <div data-testid="error-valores-numericos" role="alert"
                    className="flex items-center gap-3 px-5 py-4 mb-6 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                    <span className="material-symbols-outlined shrink-0">error</span>
                    La tarifa base debe ser mayor a 0.
                </div>
            )}

            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_0_40px_rgba(20,27,44,0.04)]">

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">route</span>
                    </div>
                    <h2 className="text-xl font-bold font-headline">Datos Generales</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-on-surface-variant ml-1">
                            Código de Ruta <span className="text-error">*</span>
                        </label>
                        <input
                            name="codigoRuta"
                            defaultValue={defaultValues.codigoRuta ?? codigoGenerado}
                            placeholder="RUT-001"
                            className="w-full bg-surface-container-low border-0 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant uppercase text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-on-surface-variant ml-1">
                            Tipo de Servicio <span className="text-error">*</span>
                        </label>
                        <select
                            name="tipoRuta"
                            defaultValue={defaultValues.tipoRuta ?? 'DIRECTA'}
                            className="w-full bg-surface-container-low border-0 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-on-surface transition-all text-sm"
                        >
                            <option value="DIRECTA">DIRECTA</option>
                            <option value="CON_PARADAS">CON ESCALA</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-on-surface-variant ml-1">
                            Tarifa Base ($) <span className="text-error">*</span>
                        </label>
                        <input
                            name="tarifaBase"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={defaultValues.tarifaBase}
                            placeholder="0.00"
                            className="w-full bg-surface-container-low border-0 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-on-surface transition-all text-sm"
                        />
                    </div>

                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

                        <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary/40">
                            <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                ORIGEN
                            </h3>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                                        Ciudad Origen <span className="text-error">*</span>
                                    </label>
                                    <CityInput
                                        name="ciudadOrigen"
                                        defaultValue={defaultValues.ciudadOrigen}
                                        placeholder="Ciudad de México"
                                        className="w-full bg-surface-container-lowest border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                                        Terminal Origen <span className="text-error">*</span>
                                    </label>
                                    <input
                                        name="terminalOrigen"
                                        defaultValue={defaultValues.terminalOrigen}
                                        placeholder="Central del Norte"
                                        className="w-full bg-surface-container-lowest border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-secondary/40">
                            <h3 className="text-sm font-bold text-secondary mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">flag</span>
                                DESTINO
                            </h3>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                                        Ciudad Destino <span className="text-error">*</span>
                                    </label>
                                    <CityInput
                                        name="ciudadDestino"
                                        defaultValue={defaultValues.ciudadDestino}
                                        placeholder="Guadalajara"
                                        className="w-full bg-surface-container-lowest border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                                        Terminal Destino <span className="text-error">*</span>
                                    </label>
                                    <input
                                        name="terminalDestino"
                                        defaultValue={defaultValues.terminalDestino}
                                        placeholder="Nueva Central Camionera"
                                        className="w-full bg-surface-container-lowest border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    className="flex items-center gap-2 px-10 py-3 rounded-xl bg-linear-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                >
                    Siguiente
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </form>
    )
}
