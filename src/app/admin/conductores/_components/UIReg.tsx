'use client'

// D7 CU6 — UIReg: Formulario Registro Conductor
import { useActionState } from 'react'
import { registrarConductorAction } from '../actions'

function fechaLocal() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const initialState = { ok: false, error: undefined as string | undefined, conductorID: undefined as string | undefined }

export default function UIReg() {
    const [state, formAction, pending] = useActionState(
        async (_prev: typeof initialState, formData: FormData) => {
            const res = await registrarConductorAction(formData)
            return { ...initialState, ...res }
        },
        initialState
    )

    if (state.ok && state.conductorID) {
        return (
            <div className="bg-primary-fixed/20 border border-primary rounded-xl p-6 text-center">
                <span className="material-symbols-outlined text-5xl text-primary mb-2 block">check_circle</span>
                <p className="text-on-surface font-semibold">Conductor registrado correctamente</p>
                <a href={`/admin/conductores/${state.conductorID}`}
                    className="mt-4 inline-flex items-center gap-2 text-primary hover:underline text-sm">
                    Ver detalle
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </a>
            </div>
        )
    }

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
                    <input name="nombreCompleto" required
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Nombre completo del conductor" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">CURP *</label>
                    <input name="curp" required maxLength={18} pattern="[A-Za-z]{4}\d{6}[HhMm][A-Za-z]{5}[A-Za-z\d]\d"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-mono uppercase"
                        placeholder="CURP (18 caracteres)" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Número de licencia *</label>
                    <input name="numeroLicencia" required
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        placeholder="Número de licencia" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Vigencia de licencia *</label>
                    <input name="vigenciaLicencia" type="date" required min={fechaLocal()}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Teléfono</label>
                    <input name="numeroTelefonico" maxLength={10} pattern="\d{10}"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="10 dígitos" />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Domicilio</label>
                    <input name="domicilio"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Domicilio del conductor" />
                </div>
            </div>

            <div className="flex gap-4 pt-2">
                <button type="submit" disabled={pending}
                    className="bg-primary text-on-primary px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                    <span className="material-symbols-outlined">person_add</span>
                    {pending ? 'Registrando…' : 'Registrar conductor'}
                </button>
                <a href="/admin/conductores"
                    className="px-6 py-3 rounded-xl text-secondary border border-outline-variant hover:bg-surface-container-low transition-colors">
                    Cancelar
                </a>
            </div>
        </form>
    )
}
