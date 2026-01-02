"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertCircle, User } from "lucide-react";
import Image from "next/image";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        // ... (existing logic)
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            // Success
            router.push("/rooms");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/am-browser.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-25"
                    priority
                />
                <div className="absolute inset-0 bg-black/95" /> {/* Extremely Dark Overlay */}
            </div>

            <NeonGradientCard className="w-full max-w-md shadow-2xl" borderSize={2} neonColor="#FFD700">
                <Card className="border-0 bg-transparent text-slate-50">
                    <CardHeader className="text-center space-y-6 pb-6 pt-8">
                        <div className="mx-auto bg-white rounded-full p-4 w-32 h-32 flex items-center justify-center shadow-2xl shadow-white/10">
                            <Image
                                src="/aethel_mono_browser.png"
                                alt="Logo"
                                width={100}
                                height={100}
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-bold text-white tracking-tight">Welcome Back</CardTitle>
                            <CardDescription className="text-slate-400 text-base">Sign in to Aethel Mono HMS</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-slate-300 font-medium">Username</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-[#FFD700] transition-colors duration-300" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={loading}
                                        required
                                        className="pl-10 bg-black/50 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-[#FFD700] h-11 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-300 font-medium">Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-[#FFD700] transition-colors duration-300" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                        className="pl-10 bg-black/50 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-[#FFD700] h-11 transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 text-sm text-red-300 bg-red-950/40 border border-red-900/50 rounded-md flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-slate-100 hover:bg-[#FFD700] hover:text-black hover:scale-[1.02] cursor-pointer text-black font-bold h-11 transition-all duration-300 shadow-lg" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center text-xs text-slate-500 font-medium tracking-wide uppercase pb-8">
                        Secured Log in
                    </CardFooter>
                </Card>
            </NeonGradientCard>
        </div>
    );
}
