import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const RUTAS_PROTEGIDAS: Record<string, string[]> = {
    '/admin/horarios':   ['ADMIN', 'GERENTE'],
    '/admin/rutas':      ['ADMIN', 'GERENTE'],
    '/admin/flota':      ['ADMIN', 'GERENTE'],
    '/admin/conductores':['ADMIN', 'GERENTE'],
    '/admin/andenes':    ['ADMIN', 'SUPERVISOR_ANDENES'],
    '/admin':            ['ADMIN'],
    '/pos':              ['ADMIN', 'VENDEDOR_TAQUILLA'],
}

export const proxy = auth((req) => {
    const { nextUrl } = req
    const pathname = nextUrl.pathname
    const isLoggedIn = !!req.auth
    if (pathname.startsWith('/login')) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL('/', nextUrl.origin))
        }
        return NextResponse.next()
    }

    if (!isLoggedIn) {
        return NextResponse.redirect(new URL('/login', nextUrl.origin))
    }

    const role = (req.auth?.user as { role?: string } | undefined)?.role ?? ''

    for (const [prefijo, rolesPermitidos] of Object.entries(RUTAS_PROTEGIDAS)) {
        if (pathname.startsWith(prefijo)) {
            if (!rolesPermitidos.includes(role)) {
                return NextResponse.redirect(new URL('/', nextUrl.origin))
            }
            break
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
