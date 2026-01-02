import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-[#1E293B]">
                <Sidebar />
            </div>
            <main className="md:pl-72 bg-[#0F172A] min-h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
