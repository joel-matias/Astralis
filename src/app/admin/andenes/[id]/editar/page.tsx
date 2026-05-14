import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AndenForm } from '../../_components/AndenForm'
import { actualizarAnden } from '../../actions'

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditarAndenPage({ params }: Props) {
    const { id } = await params

    const anden = await prisma.anden.findUnique({
        where: { andenID: id },
    })

    if (!anden) notFound()

    const action = actualizarAnden.bind(null, id)

    return (
        <div className="pt-8 pb-12 px-6 max-w-5xl mx-auto">
            <header className="mb-10">
                <nav className="flex items-center gap-2 text-secondary mb-3 text-sm font-medium">
                    <Link href="/admin/andenes" className="hover:text-primary transition-colors">Andenes</Link>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <Link href={`/admin/andenes/${id}`} className="hover:text-primary transition-colors">
                        Andén #{anden.numero}
                    </Link>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="text-on-surface">Editar</span>
                </nav>
                <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                    Editar Andén #{anden.numero}
                </h1>
                <p className="text-secondary mt-1 text-sm">Modifica los datos del andén.</p>
            </header>

            <AndenForm
                modo="editar"
                action={action}
                defaultValues={{
                    numero: anden.numero,
                    capacidad: anden.capacidad,
                    estado: anden.estado,
                    horarioDisponible: anden.horarioDisponible,
                }}
            />
        </div>
    )
}
