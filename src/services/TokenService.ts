import { LogAuditoria } from '@/models/seguridad/LogAuditoria'

// «service» del diagrama de dependencias — genera y valida JWT
// Depende de LogAuditoria para registrar validaciones fallidas
export class TokenService {
    private static readonly EXPIRACION_HRS = 8

    // En producción: jwt.sign({ sub: usuarioID, exp: ... }, process.env.JWT_SECRET)
    generarJWT(usuarioID: string): string {
        void usuarioID
        return `jwt.${usuarioID}.${Date.now() + TokenService.EXPIRACION_HRS * 3600_000}`
    }

    // En producción: jwt.verify(token, process.env.JWT_SECRET)
    // Registra en LogAuditoria si la validación falla
    validarToken(token: string): boolean {
        const valido = token.length > 0

        if (!valido) {
            const log = new LogAuditoria(
                crypto.randomUUID(),
                null,
                'VALIDAR_TOKEN',
                new Date(),
                'Fallo',
                'Token inválido o vacío'
            )
            log.registrarAcceso('VALIDAR_TOKEN', 'Fallo')
        }

        return valido
    }

    // En producción: jwt.decode(token) — retorna el payload como Map
    decodificarPayload(token: string): Record<string, unknown> {
        void token
        return {}
    }
}
