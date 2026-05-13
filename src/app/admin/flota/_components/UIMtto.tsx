'use client'

// D1, D4 CU5 — UIMtto: Formulario Registro Mantenimiento (abre y cierra mantenimientos)
import { useMantenimiento } from '@/hooks/flota/useMantenimiento'
import { TipoMantenimiento } from '@prisma/client'

const INPUT = 'w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-secondary'
const LABEL = 'block text-sm font-medium text-on-surface mb-1.5'

interface MantenimientoAbierto {
    mantenimientoID: string
    tipo: TipoMantenimiento
    fechaInicio: Date
    descripcionActividad: string
    responsable: string
}

interface Props {
    autobusID: string
    numeroEconomico: string
    mantenimientoAbierto?: MantenimientoAbierto | null
    onCambio?: () => void
}

export function UIMtto({ autobusID, numeroEconomico, mantenimientoAbierto, onCambio }: Props) {
    const { mensaje, fechaCierre, setFechaCierre, isPending, abrir, cerrar } = useMantenimiento()

    const Feedback = () => mensaje ? (
        <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
            mensaje.tipo === 'error' ? 'bg-error-container text-error' : 'bg-primary-fixed text-primary'
        }`}>
            <span className="material-symbols-outlined text-base">
                {mensaje.tipo === 'error' ? 'error' : 'check_circle'}
            </span>
            {mensaje.texto}
        </div>
    ) : null

    if (mantenimientoAbierto) {
        return (
            <div className="space-y-4" data-testid="panel-cierre-mto">
                <div className="bg-tertiary-container rounded-xl px-5 py-4 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-tertiary text-base">build</span>
                        <p className="font-semibold text-tertiary">
                            Mantenimiento abierto — {mantenimientoAbierto.tipo === 'PREVENTIVO' ? 'Preventivo' : 'Correctivo'}
                        </p>
                    </div>
                    <p className="text-on-surface text-sm">{mantenimientoAbierto.descripcionActividad}</p>
                    <p className="text-secondary text-xs mt-1">Responsable: {mantenimientoAbierto.responsable}</p>
                    <p className="text-secondary text-xs">
                        Inicio: {new Date(mantenimientoAbierto.fechaInicio).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                    </p>
                </div>

                <div>
                    <label className={LABEL}>Fecha de cierre <span className="text-error">*</span></label>
                    <input type="datetime-local" value={fechaCierre} onChange={e => setFechaCierre(e.target.value)}
                        className={INPUT} />
                </div>

                <Feedback />

                <button onClick={() => cerrar(mantenimientoAbierto.mantenimientoID, onCambio)} disabled={isPending}
                    className="bg-primary-fixed text-primary font-semibold text-sm py-2.5 px-5 rounded-xl hover:bg-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    {isPending ? 'Cerrando…' : 'Cerrar mantenimiento'}
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={e => { e.preventDefault(); abrir(autobusID, new FormData(e.currentTarget), onCambio) }}
            className="space-y-4" data-testid="form-mantenimiento">
            <p className="text-sm text-secondary">
                Registrar mantenimiento para <strong className="text-on-surface">{numeroEconomico}</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={LABEL}>Tipo <span className="text-error">*</span></label>
                    <select name="tipo" required className={INPUT}>
                        <option value="">Seleccionar…</option>
                        <option value="PREVENTIVO">Preventivo</option>
                        <option value="CORRECTIVO">Correctivo</option>
                    </select>
                </div>
                <div>
                    <label className={LABEL}>Fecha de inicio <span className="text-error">*</span></label>
                    <input name="fechaInicio" type="datetime-local" required className={INPUT} />
                </div>
                <div>
                    <label className={LABEL}>Kilometraje <span className="text-error">*</span></label>
                    <input name="kilometraje" type="number" min={0} required placeholder="120000" className={INPUT} />
                </div>
                <div>
                    <label className={LABEL}>Responsable <span className="text-error">*</span></label>
                    <input name="responsable" required placeholder="Ing. García" className={INPUT} />
                </div>
                <div className="md:col-span-2">
                    <label className={LABEL}>Descripción de actividad <span className="text-error">*</span></label>
                    <textarea name="descripcionActividad" required rows={2} placeholder="Describe la actividad…"
                        className={`${INPUT} resize-none`} />
                </div>
                <div>
                    <label className={LABEL}>Refacciones e insumos</label>
                    <input name="refacciones" placeholder="Filtros, aceite, etc." className={INPUT} />
                </div>
                <div>
                    <label className={LABEL}>Importaciones estimadas</label>
                    <input name="importaciones" placeholder="$1,500.00" className={INPUT} />
                </div>
                <div className="md:col-span-2">
                    <label className={LABEL}>Observaciones</label>
                    <textarea name="observaciones" rows={2} className={`${INPUT} resize-none`} />
                </div>
            </div>

            <Feedback />

            <button type="submit" disabled={isPending}
                className="bg-tertiary-container text-tertiary font-semibold text-sm py-2.5 px-5 rounded-xl hover:bg-tertiary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">build</span>
                {isPending ? 'Registrando…' : 'Registrar mantenimiento'}
            </button>
        </form>
    )
}
