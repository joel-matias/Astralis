import { AdminNav } from './_components/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background text-on-background min-h-screen">
            <AdminNav />
            <div className="pt-16">{children}</div>
        </div>
    )
}
