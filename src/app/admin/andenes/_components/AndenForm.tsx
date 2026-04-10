'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { EstadoAnden } from '@prisma/client'
import type { AndenFormData } from '../actions'

interface Props {
    modo: 'crear' | 'editar'
    action: (data: AndenFormData) => Promise<{ error: string } | void>
    defaultValues?: Partial<AndenFormData>
}

export function AndenForm({ modo, action, defaultValues = {} }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<AndenFormData>({
        numero: defaultValues.numero ?? 0,
        capacidad: defaultValues.capacidad ?? 2,
        estado: defaultValues.estado ?? EstadoAnden.DISPONIBLE,
        horarioDisponible: defaultValues.horarioDisponible ?? '06:00-22:00',
    })

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)

        if (formData.capacidad <= 0) {
            setError('La capacidad debe ser mayor a 0')
            return
        }

        startTransition(async () => {
            const result = await action(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="fixed top-0 right-0 -z-10 w-1/2 h-screen opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container rounded-full blur-[120px]" />
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-secondary rounded-full blur-[100px]" />
            </div>

            <div className="space-y-8">
                {error && (
                    <div
                        data-testid="anden-form-error"
                        role="alert"
                        className="flex items-center gap-3 px-5 py-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium"
                    >
                        <span className="material-symbols-outlined shrink-0">error</span>
                        {error}
                    </div>
                )}

                <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">garage</span>
                        </div>
                        <h2 className="text-xl font-bold font-headline">Datos del Andén</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                        {/* Número */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-on-surface-variant ml-1">
                                Número de Andén <span className="text-error">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.numero}
                                onChange={(e) => setFormData({ ...formData, numero: parseInt(e.target.value) })}
                                placeholder="Ej: 1"
                                required
                                className="w-full bg-surface-container-low border-0 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant text-sm"
                            />
                        </div>

                        {/* Capacidad */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-on-surface-variant ml-1">
                                Capacidad (buses) <span className="text-error">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.capacidad}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value)
                                    if (value > 0) {
                                        setFormData({ ...formData, capacidad: value })
                                    }
                                }}
                                placeholder="Ej: 2"
                                min="1"
                                required
                                className="w-full bg-surface-container-low border-0 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant text-sm"
                            />
                        </div>

                        {/* Estado */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-on-surface-variant ml-1">
                                Estado <span className="text-error">*</span>
                            </label>
                            <select
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoAnden })}
                                className="w-full bg-surface-container-low border-0 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-on-surface transition-all text-sm"
                            >
                                <option value={EstadoAnden.DISPONIBLE}>Disponible</option>
                                <option value={EstadoAnden.OCUPADO}>Ocupado</option>
                                <option value={EstadoAnden.RESERVADO}>Reservado</option>
                            </select>
                        </div>

                        {/* Horario */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-on-surface-variant ml-1">
                                Horario Disponible
                            </label>
                            <input
                                type="text"
                                value={formData.horarioDisponible || ''}
                                onChange={(e) => setFormData({ ...formData, horarioDisponible: e.target.value || null })}
                                placeholder="ej: 06:00-22:00"
                                className="w-full bg-surface-container-low border-0 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant text-sm"
                            />
                        </div>
                    </div>
                </section>

                {/* Botones */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/rutas')}
                        className="px-8 py-3 rounded-xl border border-outline-variant font-bold text-secondary hover:bg-surface-container-low transition-all"
                    >
                        Cancelar 
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-12 py-3 rounded-xl bg-linear-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Guardando...' : modo === 'crear' ? 'Crear Andén' : 'Actualizar Andén'}
                    </button>
                </div>
            </div>
        </form>
    )
}