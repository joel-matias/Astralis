export class TokenService {
    private static readonly EXPIRACION_HRS = 8

    // En producción: jwt.sign({ sub: usuarioID, exp: ... }, process.env.JWT_SECRET)
    generarJWT(usuarioID: string): string {
        void usuarioID
        return `jwt.${usuarioID}.${Date.now() + TokenService.EXPIRACION_HRS * 3600_000}`
    }

    // En producción: jwt.verify(token, process.env.JWT_SECRET)
    validarToken(token: string): boolean {
        return token.length > 0
    }

    // En producción: jwt.decode(token)
    decodificarPayload(token: string): Record<string, unknown> {
        void token
        return {}
    }
}
