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

    getRolID(): string {
        return this.rolID
    }

    getNombre(): string {
        return this.nombre
    }

    tienePermiso(accion: string): boolean {
        return this.permisos.some(
            (p) => p.accion === accion || p.accion === '*'
        )
    }

    obtenerPermisos(): Permiso[] {
        return [...this.permisos]
    }
}
