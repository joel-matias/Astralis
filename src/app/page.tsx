import { redirect } from 'next/navigation'
import { auth } from '@/auth'

function rutaSegunRol(role: string | undefined): string {
    switch (role) {
        case 'ADMIN': return '/admin/dashboard'
        case 'GERENTE': return '/operaciones/dashboard'
        case 'VENDEDOR_TAQUILLA': return '/pos'
        case 'SUPERVISOR_ANDENES': return '/andenes'
        case 'ENCARGADO_EQUIPAJE': return '/equipaje'
        default: return '/login'
    }
}

// Por el momento agrege la redirecion aqui por si creamos una pagina publica despues
export default async function Home() {
    const session = await auth()
    redirect(rutaSegunRol((session?.user as { role?: string } | null)?.role))
}
