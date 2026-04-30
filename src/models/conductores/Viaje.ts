// D3 CU6 — Viaje como proyección de Horario para el contexto de Administración de Conductores
export class Viaje {
    // D3: idViaje: int → String (UUID) en código
    private idViaje: string
    private ruta: string
    private fechaHoraSalida: Date
    private duracionEstimada: number       // D3: int → number
    private estado: string

    constructor(
        idViaje: string,
        ruta: string,
        fechaHoraSalida: Date,
        duracionEstimada: number,
        estado: string = 'Programado'
    ) {
        this.idViaje = idViaje
        this.ruta = ruta
        this.fechaHoraSalida = fechaHoraSalida
        this.duracionEstimada = duracionEstimada
        this.estado = estado
    }

    getIdViaje(): string { return this.idViaje }
    getRuta(): string { return this.ruta }
    getFechaHoraSalida(): Date { return this.fechaHoraSalida }
    getDuracionEstimada(): number { return this.duracionEstimada }
    getEstado(): string { return this.estado }

    // D3: obtenerInfoViaje(): Map
    obtenerInfoViaje(): Map<string, unknown> {
        const info = new Map<string, unknown>()
        info.set('idViaje', this.idViaje)
        info.set('ruta', this.ruta)
        info.set('fechaHoraSalida', this.fechaHoraSalida)
        info.set('duracionEstimada', this.duracionEstimada)
        info.set('estado', this.estado)
        return info
    }

    // D3: estaActivo(): boolean
    estaActivo(): boolean {
        return this.estado === 'Activo'
    }

    // D3: estaProgramado(): boolean
    estaProgramado(): boolean {
        return this.estado === 'Programado' && this.fechaHoraSalida > new Date()
    }
}
