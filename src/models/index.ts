// seguridad (CU1)
export { Usuario } from './seguridad/Usuario'
export { EstadoUsuario } from '@prisma/client'
export { Rol } from './seguridad/Rol'
export { SesionActiva } from './seguridad/SesionActiva'
export { LogAuditoria as LogAuditoriaSeguridad } from './seguridad/LogAuditoria'

// rutas (CU2) — Usuario y LogAuditoria propios del módulo, distintos a los de seguridad
export { Ruta, type TipoRuta, type EstadoRuta } from './rutas/Ruta'
export { ParadaIntermedia } from './rutas/ParadaIntermedia'
export { Horario, type EstadoHorario } from './rutas/Horario'
export { Usuario as UsuarioRutas } from './rutas/Usuario'
export { LogAuditoria as LogAuditoriaRutas } from './rutas/LogAuditoria'
export type { RutaDTO, DatosParadaDTO } from './rutas/RutaDTO'
