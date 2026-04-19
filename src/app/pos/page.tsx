import VentaWizard from './_components/VentaWizard'
import { ViajeRepository } from '@/repositories/boletos/ViajeRepository'

export default async function POSPage() {
    const repo = new ViajeRepository()
    const origenes = await repo.obtenerOrigenes()

    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                    Punto de Venta
                </h1>
                <p className="text-secondary text-sm mt-1">Venta de boletos en taquilla</p>
            </header>
            <VentaWizard origenes={origenes} />
        </div>
    )
}
