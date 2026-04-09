/**
 * CU1 — Seguridad y Autenticación
 * Clase: Rol
 *
 * Responsabilidades (diagrama):
 * - Definir qué módulos puede acceder cada actor
 * - Verificar si un usuario tiene permiso para una acción específica del sistema
 * - Exponer lista de permisos para validación
 *
 * Colabora con: Usuario (es consultado)
 */

export interface Permiso {
    permisoID: string
    rolID: string
    accion: string
    modulo: string
}

export class Rol {
    private rolID: string
    private nombre: string
    private permisos: Permiso[]

    constructor(rolID: string, nombre: string, permisos: Permiso[] = []) {
        this.rolID = rolID
        this.nombre = nombre
        this.permisos = permisos
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getRolID(): string {
        return this.rolID
    }

    getNombre(): string {
        return this.nombre
    }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Verifica si el rol tiene permiso para ejecutar una acción específica.
     * Diagrama: + tienePermiso(accion: String) : Boolean
     */
    tienePermiso(accion: string): boolean {
        return this.permisos.some(
            (p) => p.accion === accion || p.accion === '*'
        )
    }

    /**
     * Retorna la lista completa de permisos asignados al rol.
     * Diagrama: + obtenerPermisos() : List
     */
    obtenerPermisos(): Permiso[] {
        return [...this.permisos]
    }
}
