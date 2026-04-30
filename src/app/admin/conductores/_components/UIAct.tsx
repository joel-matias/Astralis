'use client'

// D7 CU6 — UIAct: Formulario Actualizar Conductor
import { useActionState } from 'react'
import { actualizarConductorAction } from '../actions'

interface Props {
    conductor: {
        conductorID: string
        nombreCompleto: string
        domicilio: string | null
        numeroTelefonico: string | null
        vigenciaLicencia: Date
        curp: string
        numeroLicencia: string
    }
}

const initialState = { ok: false, error: undefined as string | undefined }

export default function UIAct({ conductor }: Props) {
    const [state, formAction, pending] = useActionState(
        async (_prev: typeof initialState, formData: FormData) => {
            const res = await actualizarConductorAction(conductor.conductorID, formData)
            return { ...initialState, ...res }
        },
        initialState
    )

    if (state.ok) {
        return (
            <div className="bg-primary-fixed/20 border border-primary rounded-xl p-6 text-center">
                <span className="material-symbols-outlined text-5xl text-primary mb-2 block">check_circle</span>
                <p className="text-on-surface font-semibold">Datos actualizados correctamente</p>
                <a href={`/admin/conductores/${conductor.conductorID}`}
                    className="mt-4 inline-flex items-center gap-2 text-primary hover:underline text-sm">
                    Ver detalle
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </a>
            </div>
        )
    }

    const vigenciaISO = conductor.vigenciaLicencia.toISOString().split('T')[0]

    return (
        <form action={formAction} className="space-y-6">
            {state.error && (
                <div data-testid="conductor-error"
                    className="bg-error-container text-error rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {state.error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Nombre completo *</label>
                    <input name="nombreCompleto" required defaultValue={conductor.nombreCompleto}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">CURP</label>
                    <input value={conductor.curp} readOnly
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-secondary font-mono opacity-60 cursor-not-allowed" />
                    <p className="text-xs text-secondary mt-1">No modificable</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Número de licencia</label>
                    <input value={conductor.numeroLicencia} readOnly
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-secondary font-mono opacity-60 cursor-not-allowed" />
                    <p className="text-xs text-secondary mt-1">No modificable</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Vigencia de licencia *</label>
                    <input name="vigenciaLicencia" type="date" required defaultValue={vigenciaISO}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Teléfono</label>
                    <input name="numeroTelefonico" maxLength={10} defaultValue={conductor.numeroTelefonico ?? ''}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="10 dígitos" />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Domicilio</label>
                    <input name="domicilio" defaultValue={conductor.domicilio ?? ''}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
            </div>

            <div className="flex gap-4 pt-2">
                <button type="submit" disabled={pending}
                    className="bg-primary text-on-primary px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                    <span className="material-symbols-outlined">save</span>
                    {pending ? 'Guardando…' : 'Guardar cambios'}
                </button>
                <a href={`/admin/conductores/${conductor.conductorID}`}
                    className="px-6 py-3 rounded-xl text-secondary border border-outline-variant hover:bg-surface-container-low transition-colors">
                    Cancelar
                </a>
            </div>
        </form>
    )
}
