// D1, D4, D5 — Viaje: proyección del Horario para el contexto de Gestión de Flota
// Almacena información de ruta y horario; verifica disponibilidad de horario y permite asignación de autobús
export class Viaje {
    private idViaje: number            // D4: int
    private ruta: number               // D4: int (FK a Ruta)
    private fechaHoraSalida: Date      // D4: DateTime
    private fechaHoraLlegada: Date     // D4: DateTime
    private auto: number               // D4: int (FK a Autobus)
    private estado: string             // D4: String ('Activo'|'Programado'|'Cancelado'|'Completado')

    constructor(
        idViaje: number,
        ruta: number,
        fechaHoraSalida: Date,
        fechaHoraLlegada: Date,
        auto: number,
        estado: string = 'Programado'
    ) {
        this.idViaje = idViaje
        this.ruta = ruta
        this.fechaHoraSalida = fechaHoraSalida
        this.fechaHoraLlegada = fechaHoraLlegada
        this.auto = auto
        this.estado = estado
    }

    getIdViaje(): number { return this.idViaje }
    getRuta(): number { return this.ruta }
    getFechaHoraSalida(): Date { return this.fechaHoraSalida }
    getFechaHoraLlegada(): Date { return this.fechaHoraLlegada }
    getAuto(): number { return this.auto }
    getEstado(): string { return this.estado }

    // D4 — retorna información del viaje como mapa clave-valor
    obtenerViajes(): Map<string, unknown> {
        const mapa = new Map<string, unknown>()
        mapa.set('idViaje', this.idViaje)
        mapa.set('ruta', this.ruta)
        mapa.set('fechaHoraSalida', this.fechaHoraSalida)
        mapa.set('fechaHoraLlegada', this.fechaHoraLlegada)
        mapa.set('auto', this.auto)
        mapa.set('estado', this.estado)
        return mapa
    }

    // D4 — retorna true si el viaje está en curso
    estaActivo(): boolean {
        return this.estado === 'Activo'
    }

    // D4 — retorna true si el viaje está programado y su fecha aún no ha pasado
    estaProgramado(): boolean {
        return this.estado === 'Programado' && this.fechaHoraSalida > new Date()
    }
}
