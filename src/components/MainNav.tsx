import { auth } from '@/auth'
import MainNavClient from './MainNavClient'

const LINKS_POR_ROL: Record<string, { href: string; label: string }[]> = {
    ADMIN: [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/rutas', label: 'Rutas' },
        { href: '/admin/horarios', label: 'Programación' },
        { href: '/admin/flota', label: 'Flota' },
        { href: '/admin/conductores', label: 'Conductores' },
        { href: '/admin/andenes', label: 'Andenes' },
        { href: '/pos', label: 'Taquilla' },
    ],
    GERENTE: [
        { href: '/admin/rutas', label: 'Rutas' },
        { href: '/admin/horarios', label: 'Programación' },
        { href: '/admin/flota', label: 'Flota' },
        { href: '/admin/conductores', label: 'Conductores' },
    ],
    VENDEDOR_TAQUILLA: [
        { href: '/pos', label: 'Taquilla' },
    ],
    SUPERVISOR_ANDENES: [
        { href: '/admin/andenes', label: 'Andenes' },
    ],
}

export default async function MainNav() {
    const session = await auth()
    const role = (session?.user as { role?: string } | null)?.role ?? ''
    const nombre = session?.user?.name ?? ''
    const links = LINKS_POR_ROL[role] ?? []

    return <MainNavClient links={links} nombre={nombre} role={role} />
}
