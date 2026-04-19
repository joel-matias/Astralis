// Representa un horario asignado a una ruta — versión simplificada para CU2; se expande en CU3
export type EstadoHorario = string // los valores del enum se definen en CU3 (Programar Horario)

export class Horario {
    private horarioID: string
    private rutaID: string
    private autobusID: string
    private conductorID: string
    private horaSalida: Date
    private horaLlegada: Date
    private estado: EstadoHorario

    constructor(
        horarioID: string,
        rutaID: string,
        autobusID: string,
        conductorID: string,
        horaSalida: Date,
        horaLlegada: Date,
        estado: EstadoHorario
    ) {
        this.horarioID = horarioID
        this.rutaID = rutaID
        this.autobusID = autobusID
        this.conductorID = conductorID
        this.horaSalida = horaSalida
        this.horaLlegada = horaLlegada
        this.estado = estado
    }

    getHorarioID(): string { return this.horarioID }
    getRutaID(): string { return this.rutaID }
    getAutobusID(): string { return this.autobusID }
    getConductorID(): string { return this.conductorID }
    getHoraSalida(): Date { return this.horaSalida }
    getHoraLlegada(): Date { return this.horaLlegada }
    getEstado(): EstadoHorario { return this.estado }

    // La lógica completa de programación la implementa HorarioService en CU3
    programar(): void {}

    // La lógica completa de cancelación la implementa HorarioService en CU3
    cancelar(): void {}

    // Stub parcial — la verificación real de conflictos de horario requiere consulta a BD (CU3)
    verificarDisponibilidad(): boolean {
        return this.horaSalida > new Date()
    }
}
