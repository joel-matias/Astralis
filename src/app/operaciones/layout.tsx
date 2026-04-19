import MainNav from '@/components/MainNav'

export default function OperacionesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background text-on-background min-h-screen">
            <MainNav />
            <div className="pt-16">{children}</div>
        </div>
    )
}
