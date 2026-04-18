import bcrypt from 'bcryptjs'
import { EstadoUsuario } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { LogAuditoria } from '@/models/seguridad/LogAuditoria'
import { RepositorioUsuario } from '@/repositories/RepositorioUsuario'
import { ServicioSesion } from '@/services/ServicioSesion'
import { NotificacionService } from '@/services/NotificacionService'

// Resultado tipado para que auth.ts decida qué hacer sin acoplar excepciones aquí
export type ResultadoAutenticacion =
    | { exito: true; sesionID: string; usuarioID: string; nombreCompleto: string; email: string; rol: string }
    | { exito: false; motivo: 'usuario_no_encontrado' | 'credenciales_invalidas' | 'cuenta_bloqueada' }

// Orquesta el flujo completo del diagrama de comunicación (pasos 2 → 10)
export class ControladorAutenticacion {
    private repositorioUsuario = new RepositorioUsuario()
    private servicioSesion = new ServicioSesion()
    private notificacionService = new NotificacionService()

    async autenticar(email: string, contrasena: string, ip: string): Promise<ResultadoAutenticacion> {

        // Paso 3-4: buscarUsuario → RepositorioUsuario → retornarDatos
        const usuario = await this.repositorioUsuario.buscarUsuario(email)

        if (!usuario) {
            await this.registrarAcceso(null, 'LOGIN', ip, 'Fallo', `Email no registrado: ${email}`)
            return { exito: false, motivo: 'usuario_no_encontrado' }
        }

        // Paso 6: verificarEstadoCuenta() — consulta el estado del dominio Usuario
        if (usuario.getEstado() === EstadoUsuario.BLOQUEADO) {
            await this.registrarAcceso(usuario.getUsuarioID(), 'LOGIN', ip, 'Bloqueado', 'Intento de acceso a cuenta bloqueada')
            return { exito: false, motivo: 'cuenta_bloqueada' }
        }

        // Paso 5: validarContrasena(hash) — bcrypt compara la entrada con el hash guardado
        const passwordValida = await bcrypt.compare(contrasena, usuario.getContrasena())

        if (!passwordValida) {
            // E1/E2: credenciales inválidas → incrementar intentos fallidos
            const nuevosIntentos = usuario.getIntentosFallidos() + 1
            const bloquear = nuevosIntentos >= 3

            await this.repositorioUsuario.actualizarIntentos(usuario.getUsuarioID(), nuevosIntentos, bloquear)
            await this.registrarAcceso(
                usuario.getUsuarioID(), 'LOGIN', ip,
                bloquear ? 'Bloqueado' : 'Fallo',
                `Intento ${nuevosIntentos}/3 fallido`
            )

            // E3: al llegar a 3 → registrar bloqueo y notificar al administrador via ServidorSMTP
            if (bloquear) {
                await this.registrarAcceso(
                    usuario.getUsuarioID(), 'BLOQUEO_CUENTA', ip, 'Bloqueado',
                    'Cuenta bloqueada automáticamente tras 3 intentos fallidos'
                )
                // Componente «external» ServidorSMTP del diagrama de componentes
                await this.notificacionService.notificarBloqueo(usuario.getEmail(), nuevosIntentos)
                return { exito: false, motivo: 'cuenta_bloqueada' }
            }

            return { exito: false, motivo: 'credenciales_invalidas' }
        }

        // Estado VerificandoRol (diagrama de estados): el rol debe existir y estar asignado
        // Si el rol es nulo significa que un administrador bloqueó el acceso a nivel de rol
        const rol = usuario.obtenerRol()
        if (!rol || !rol.getNombre()) {
            await this.registrarAcceso(usuario.getUsuarioID(), 'LOGIN', ip, 'Bloqueado', 'Rol no válido o no asignado')
            return { exito: false, motivo: 'cuenta_bloqueada' }
        }

        // Paso 7-8: crearSesion → ServicioSesion → retornarTokenSesion
        const sesion = await this.servicioSesion.crearSesion(usuario.getUsuarioID(), ip)

        // Resetea intentos fallidos en BD ahora que el login fue exitoso
        await this.repositorioUsuario.resetearIntentos(usuario.getUsuarioID())

        // Paso 9: registrarAcceso(usuario, ip, fechaHora) → LogAuditoria
        await this.registrarAcceso(usuario.getUsuarioID(), 'LOGIN', ip, 'Exito', 'Inicio de sesión exitoso')

        // Paso 10: retornarResultado(token, rol)
        return {
            exito: true,
            sesionID: sesion.getSesionID(),
            usuarioID: usuario.getUsuarioID(),
            nombreCompleto: usuario.getNombreCompleto(),
            email: usuario.getEmail(),
            rol: rol.getNombre(),
        }
    }

    // Crea el objeto de dominio LogAuditoria, llama registrar() y persiste en BD
    private async registrarAcceso(
        usuarioID: string | null,
        accion: string,
        ip: string,
        resultado: string,
        detalles: string
    ): Promise<void> {
        const log = new LogAuditoria(
            crypto.randomUUID(),
            usuarioID,
            accion,
            new Date(),
            resultado,
            detalles
        )
        log.registrarAcceso(accion, resultado) // paso 9 del diagrama: registrar en LogAuditoria

        await prisma.logAuditoria.create({
            data: {
                logID: log.getLogID(),
                usuarioID: log.getUsuarioID() ?? undefined,
                accion: log.getAccion(),
                modulo: 'auth', // modulo existe en BD pero no en el dominio del diagrama
                resultado: log.getResultado(),
                detalles: log.getDetalles() ?? undefined,
                ipOrigen: ip,
                fechaHora: log.getFechaHora(),
            },
        })
    }
}
