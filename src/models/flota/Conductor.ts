import { EstadoConductor } from '@prisma/client'

export { EstadoConductor }

// D1, D4, D5 — Conductor: proyección del Conductor para el contexto de Gestión de Flota
// El conductor debe tener viaje programado para asignarse; solo conductores Activo pueden asignarse
export class Conductor {
    private idConductor: number        // D4: int
    private nombreCompleto: string     // D4: String
    private curp: string               // D4: curp:int — implementado como String (CURP es alfanumérico)
    private estado: EstadoConductor    // D4: EstadoConductor

    constructor(
        idConductor: number,
        nombreCompleto: string,
        curp: string,
        estado: EstadoConductor = EstadoConductor.ACTIVO
    ) {
        this.idConductor = idConductor
        this.nombreCompleto = nombreCompleto
        this.curp = curp
        this.estado = estado
    }

    getIdConductor(): number { return this.idConductor }
    getNombreCompleto(): string { return this.nombreCompleto }
    getCurp(): string { return this.curp }
    getEstado(): EstadoConductor { return this.estado }

    // D4, D2 — retorna true si el conductor está en estado ACTIVO
    verificarEstadoActivo(): boolean {
        return this.estado === EstadoConductor.ACTIVO
    }

    // D4, D1 — retorna true si el conductor tiene un viaje programado (lógica real: BaseDatos)
    tieneViajeProgramado(): boolean {
        return false
    }
}
