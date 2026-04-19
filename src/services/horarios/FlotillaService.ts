// D8 CU3 — Acceso al sistema externo de gestión de flota (autobuses y conductores)
import type { Autobus } from '@/models/horarios/Autobus'
import type { Conductor } from '@/models/horarios/Conductor'

export class FlotillaService {

    // Stub — la consulta real requiere integración con el sistema externo de flota
    consultarAutobusesDisponibles(): Autobus[] {
        return []
    }

    consultarConductoresDisponibles(): Conductor[] {
        return []
    }

    sincronizarEstadoRecurso(): void {}

    verificarMantenimientoPendiente(): boolean {
        return false
    }
}
