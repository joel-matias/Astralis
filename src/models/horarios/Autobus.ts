// D1 CU3 — Autobús como recurso asignable a un horario; la gestión completa es CU5 Gestión de Flota
import type { Horario } from './Horario'
export type TipoServicio = 'Economico' | 'Ejecutivo' | 'Lujo'
export type EstadoOperativo = 'Disponible' | 'EnServicio' | 'Mantenimiento' | 'FueraDeServicio'

export class Autobus {
    private autobusID: string
    private numeroEconomico: string
    private marca: string
    private modelo: string
    private capacidad: number
    private tipoServicio: TipoServicio
    private estadoOperativo: EstadoOperativo
    private ultimoMantenimiento: Date

    constructor(
        autobusID: string,
        numeroEconomico: string,
        marca: string,
        modelo: string,
        capacidad: number,
        tipoServicio: TipoServicio,
        estadoOperativo: EstadoOperativo = 'Disponible',
        ultimoMantenimiento: Date = new Date()
    ) {
        this.autobusID = autobusID
        this.numeroEconomico = numeroEconomico
        this.marca = marca
        this.modelo = modelo
        this.capacidad = capacidad
        this.tipoServicio = tipoServicio
        this.estadoOperativo = estadoOperativo
        this.ultimoMantenimiento = ultimoMantenimiento
    }

    getAutobusID(): string { return this.autobusID }
    getNumeroEconomico(): string { return this.numeroEconomico }
    getMarca(): string { return this.marca }
    getModelo(): string { return this.modelo }
    getCapacidad(): number { return this.capacidad }
    getTipoServicio(): TipoServicio { return this.tipoServicio }
    getEstadoOperativo(): EstadoOperativo { return this.estadoOperativo }
    getUltimoMantenimiento(): Date { return this.ultimoMantenimiento }

    // La verificación de conflictos reales (viajes en esa fecha/hora) la ejecuta ValidadorRecursos
    estaDisponible(fecha: Date, hora: Date): boolean {
        void fecha
        void hora
        return this.estadoOperativo === 'Disponible'
    }

    asignarAHorario(horarioID: string): void {
        void horarioID
        this.estadoOperativo = 'EnServicio'
    }

    // D4: verifica si el horario h genera un conflicto de tiempo con este autobús; lógica real en ValidadorRecursos
    tieneConflictoHorario(h: Horario): boolean {
        void h
        return false
    }

    // D4: verifica que el autobús no esté en estado Mantenimiento o FueraDeServicio
    cumpleIntervalMantenimiento(): boolean {
        return this.estadoOperativo !== 'Mantenimiento' && this.estadoOperativo !== 'FueraDeServicio'
    }
}
