"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BedDouble, Users, CalendarDays, Settings, LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Rooms",
        icon: BedDouble,
        href: "/rooms",
        color: "text-emerald-500",
    },
    {
        label: "Reservations",
        icon: CalendarDays,
        href: "/reservations",
        color: "text-violet-500",
    },
    {
        label: "Guests",
        icon: Users,
        href: "/guests",
        color: "text-pink-700",
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ username: string; role: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                if (data.user) {
                    setUser(data.user);
                }
            })
            .catch((err) => console.error("Failed to fetch user", err))
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#1E293B] text-white border-r border-[#334155]">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center justify-center mb-10 w-full px-4">
                    <Image
                        src="/aethel_mono_side.png"
                        alt="Aethel Mono"
                        width={200}
                        height={60}
                        className="object-contain h-auto w-auto" // Maintain aspect ratio
                        priority
                    />
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname.includes(route.href) ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* User Profile Section */}
            <div className="px-3 py-2 border-t border-[#334155]">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    </div>
                ) : user ? (
                    <div className="flex items-center gap-x-3 bg-white/5 p-3 rounded-lg mb-2">
                        <Avatar className="h-9 w-9 border border-zinc-500">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} />
                            <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-sm font-medium truncate text-white uppercase">{user.username}</span>
                            <span className="text-xs text-zinc-400 truncate capitalize">{user.role}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-white/10 rounded-full transition text-zinc-400 hover:text-red-400 cursor-pointer"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-xs text-zinc-500">Guest</div>
                )}
            </div>
        </div>
    );
}
