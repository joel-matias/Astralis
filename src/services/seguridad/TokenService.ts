import { createHmac } from 'crypto'

const SECRET = process.env.JWT_SECRET ?? 'astralis-dev-secret-change-in-prod'

function b64url(s: string): string {
    return Buffer.from(s).toString('base64url')
}

const HEADER = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))

export class TokenService {
    private static readonly EXPIRACION_HRS = 8

    generarJWT(usuarioID: string): string {
        const now = Math.floor(Date.now() / 1000)
        const payload = b64url(JSON.stringify({
            sub: usuarioID,
            iat: now,
            exp: now + TokenService.EXPIRACION_HRS * 3600,
        }))
        const sig = createHmac('sha256', SECRET)
            .update(`${HEADER}.${payload}`)
            .digest('base64url')
        return `${HEADER}.${payload}.${sig}`
    }

    validarToken(token: string): boolean {
        try {
            const parts = token.split('.')
            if (parts.length !== 3) return false
            const [header, payload, sig] = parts
            const expected = createHmac('sha256', SECRET)
                .update(`${header}.${payload}`)
                .digest('base64url')
            if (sig !== expected) return false
            const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { exp?: number }
            return typeof data.exp === 'number' && data.exp > Math.floor(Date.now() / 1000)
        } catch {
            return false
        }
    }

    decodificarPayload(token: string): Record<string, unknown> {
        try {
            const parts = token.split('.')
            if (parts.length !== 3) return {}
            return JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as Record<string, unknown>
        } catch {
            return {}
        }
    }
}
