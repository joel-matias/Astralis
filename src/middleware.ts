import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthRoute = req.nextUrl.pathname.startsWith('/login')

    // Si ya se autentico no puede volver al login, lo redirigimos a la pagina home
    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    // Si va a una ruta protegida cuando no este auteticado, lo redirigimos a la pagina d login
    if (!isAuthRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
})

export const config = {
    // Protege todo excepto archivos estáticos y API de auth
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}