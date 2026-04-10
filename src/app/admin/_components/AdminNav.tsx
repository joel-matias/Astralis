'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
    { href: '/admin/dashboard',  label: 'Dashboard' },
    { href: '/admin/rutas',      label: 'Rutas' },
    { href: '/admin/horarios',   label: 'Programación' },
    { href: '/admin/flota',      label: 'Flota' },
    { href: '/admin/reportes',   label: 'Reportes' },
    { href: '/admin/andenes',     label: 'Andenes' },
]

export function AdminNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_0_40px_rgba(20,27,44,0.06)] font-headline tracking-tight">
            <div className="flex justify-between items-center h-16 px-8 max-w-full mx-auto">

                <Link href="/admin/dashboard" className="text-xl font-bold text-primary">
                    Astralis
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {LINKS.map(({ href, label }) => {
                        const active = pathname.startsWith(href)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={
                                    active
                                        ? 'text-primary border-b-2 border-primary font-semibold transition-colors duration-200'
                                        : 'text-secondary font-medium hover:text-primary transition-colors duration-200'
                                }
                            >
                                {label}
                            </Link>
                        )
                    })}
                </div>

                <div className="flex items-center gap-2">
                    <button className="text-secondary hover:text-primary p-2 transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="text-secondary hover:text-primary p-2 transition-colors">
                        <span className="material-symbols-outlined">account_circle</span>
                    </button>
                </div>
            </div>
        </nav>
    )
}
