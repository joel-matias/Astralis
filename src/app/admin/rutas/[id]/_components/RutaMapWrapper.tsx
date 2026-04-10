'use client'

import dynamic from 'next/dynamic'

const RutaMap = dynamic(
    () => import('./RutaMap').then(m => ({ default: m.RutaMap })),
    { ssr: false }
)

interface Props {
    origen: string
    destino: string
    paradas: { ciudad: string }[]
}

export function RutaMapWrapper(props: Props) {
    return <RutaMap {...props} />
}
