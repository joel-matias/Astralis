'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ROL_INICIO: Record<string, string> = {
    ADMIN: '/admin/dashboard',
    GERENTE: '/operaciones/dashboard',
    VENDEDOR_TAQUILLA: '/pos',
    SUPERVISOR_ANDENES: '/andenes',
    ENCARGADO_EQUIPAJE: '/equipaje',
}

interface Props {
    links: { href: string; label: string }[]
    nombre: string
    role: string
}

export default function MainNavClient({ links, nombre, role }: Props) {
    const pathname = usePathname()
    const inicio = ROL_INICIO[role] ?? '/'

    return (
        <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_0_40px_rgba(20,27,44,0.06)] font-headline tracking-tight">
            <div className="flex justify-between items-center h-16 px-8 max-w-full mx-auto">

                <Link href={inicio} className="text-xl font-bold text-primary shrink-0">
                    Astralis
                </Link>

                <div className="hidden md:flex items-center gap-8 overflow-x-auto">
                    {links.map(({ href, label }) => {
                        const active = pathname === href || pathname.startsWith(href + '/')
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={
                                    active
                                        ? 'text-primary border-b-2 border-primary font-semibold transition-colors duration-200 whitespace-nowrap'
                                        : 'text-secondary font-medium hover:text-primary transition-colors duration-200 whitespace-nowrap'
                                }
                            >
                                {label}
                            </Link>
                        )
                    })}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {nombre && (
                        <span className="text-sm text-secondary font-medium hidden lg:block">{nombre}</span>
                    )}
                    {/* <button className="text-secondary hover:text-primary p-2 transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="text-secondary hover:text-primary p-2 transition-colors">
                        <span className="material-symbols-outlined">account_circle</span>
                    </button> */}
                </div>
            </div>
        </nav>
    )
}
