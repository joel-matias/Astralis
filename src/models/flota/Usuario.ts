// D1, D4, D5 — Usuario: actor del sistema con rol y permisos
// Roles: Administrador, Gerente de Operaciones, Despachador de Unidades, Personal de Mantenimiento
export class Usuario {
    private idUsuario: number          // D4: int
    private nombreUsuario: string      // D4: String
    private rol: string                // D4: String

    constructor(idUsuario: number, nombreUsuario: string, rol: string) {
        this.idUsuario = idUsuario
        this.nombreUsuario = nombreUsuario
        this.rol = rol
    }

    getIdUsuario(): number { return this.idUsuario }
    getNombreUsuario(): string { return this.nombreUsuario }
    getRol(): string { return this.rol }

    // D4 — verifica credenciales del actor en el sistema
    autenticar(): boolean {
        return this.nombreUsuario.trim() !== '' && this.rol.trim() !== ''
    }

    // D4 — verifica si el rol del usuario permite la acción indicada
    verificarPermiso(accion: string): boolean {
        const permisosAdmin = ['registrar', 'actualizar', 'cambiarEstado', 'asignar', 'mantenimiento', 'ver']
        const permisosGerente = ['actualizar', 'cambiarEstado', 'asignar', 'ver']
        const permisosDespachador = ['asignar', 'ver']
        const permisosMantenimiento = ['mantenimiento', 'ver']

        if (this.rol === 'ADMIN') return permisosAdmin.includes(accion)
        if (this.rol === 'GERENTE') return permisosGerente.includes(accion)
        if (this.rol === 'DESPACHADOR_UNIDADES') return permisosDespachador.includes(accion)
        if (this.rol === 'PERSONAL_MANTENIMIENTO') return permisosMantenimiento.includes(accion)
        return false
    }
}
