"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Reservation } from "@/types/reservation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MessageSquare, CalendarPlus, History, Crown, CheckCircle2, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookingForm } from "@/components/dashboard/BookingForm";

// Mock reservation history type extending base Reservation
interface ReservationHistory extends Reservation {
    room_number: string;
}

// Columns for Guest History
const historyColumns: ColumnDef<ReservationHistory>[] = [
    {
        accessorKey: "res_id",
        header: "Res ID",
    },
    {
        accessorKey: "room_number",
        header: "Room",
    },
    {
        accessorKey: "check_in_date",
        header: "Check In",
        cell: ({ row }) => new Date(row.original.check_in_date).toLocaleDateString(),
    },
    {
        accessorKey: "check_out_date",
        header: "Check Out",
        cell: ({ row }) => new Date(row.original.check_out_date).toLocaleDateString(),
    },
    {
        accessorKey: "total_amount",
        header: "Amount",
        cell: ({ row }) => `$${Number(row.original.total_amount).toFixed(2)}`,
    },
    {
        accessorKey: "res_status",
        header: "Status",
        cell: ({ row }) => <Badge variant="outline">{row.original.res_status}</Badge>,
    },
];

export default function GuestProfilePage() {
    const params = useParams();
    const id = params.id;
    const [guest, setGuest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [openBooking, setOpenBooking] = useState(false);

    useEffect(() => {
        if (!id) return;

        async function fetchGuest() {
            try {
                const res = await fetch(`/api/guests/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setGuest(data);
                }
            } catch (error) {
                console.error("Failed to load guest", error);
            } finally {
                setLoading(false);
            }
        }
        fetchGuest();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;
    if (!guest) return <div className="p-8 text-center text-slate-400">Guest not found</div>;

    const totalSpend = guest.reservations?.reduce((sum: number, res: any) => sum + Number(res.total_amount), 0) || 0;
    const avgDailyRate = totalSpend / (guest.reservations?.length || 1) || 0;

    // Determine VIP Color
    const getVipBadgeColor = (status: string) => {
        if (!status) return "bg-slate-500/10";
        if (status.includes("Noble")) return "bg-slate-900 text-slate-100 border-slate-700";
        if (status.includes("Aethel")) return "bg-amber-400 text-amber-950 border-amber-500";
        return "bg-slate-300 text-slate-900 border-slate-400";
    };

    return (
        <div className="space-y-6">
            {/* Header / Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        {guest.first_name} {guest.last_name}
                        <Badge variant="outline" className={getVipBadgeColor(guest.vip_status)}>
                            {guest.vip_status}
                        </Badge>
                    </h2>
                    <p className="text-muted-foreground">{guest.email} • {guest.phone}</p>
                </div>
            </div>
            <Dialog open={openBooking} onOpenChange={setOpenBooking}>
                <DialogTrigger asChild>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
                        <CalendarPlus className="h-4 w-4" />
                        New Reservation
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Reservation for {guest.first_name}</DialogTitle>
                    </DialogHeader>
                    <BookingForm
                        preSelectedGuestId={guest.guest_id}
                        onSuccess={() => {
                            setOpenBooking(false);
                            // Refresh guest data to show new reservation
                            window.location.reload();
                        }}
                    />
                </DialogContent>
            </Dialog>


            {/* Loyalty & Stats Grid */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                {/* Loyalty Card - Takes 2 cols on large screens */}
                <div className="col-span-1 lg:col-span-2">
                    <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border-indigo-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium flex items-center gap-2 text-indigo-100">
                                <Crown className="h-5 w-5 text-amber-500" />
                                Loyalty Status: <span className="text-amber-400 font-bold">{guest.loyalty_tier || 'Mono'}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(() => {
                                    const totalStays = guest.reservations?.filter((r: any) => r.res_status === 'Checked_Out').length || 0;
                                    let nextTier = 'Noble';
                                    let targetStays = 15;
                                    let progress = 0;

                                    if (totalStays < 6) {
                                        nextTier = 'Aethel';
                                        targetStays = 6;
                                        progress = (totalStays / 6) * 100;
                                    } else if (totalStays < 15) {
                                        nextTier = 'Noble';
                                        targetStays = 15;
                                        progress = ((totalStays - 6) / (15 - 6)) * 100; // Relative progress
                                    } else {
                                        progress = 100;
                                    }

                                    const staysNeeded = Math.max(0, targetStays - totalStays);

                                    return (
                                        <>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm text-slate-400">
                                                    <span>Currrent Progress ({totalStays} Stays)</span>
                                                    {staysNeeded > 0 ? (
                                                        <span>{staysNeeded} stays to {nextTier}</span>
                                                    ) : (
                                                        <span className="text-amber-400 font-semibold">Max Tier Reached!</span>
                                                    )}
                                                </div>
                                                <Progress value={progress} className="h-3" />
                                            </div>

                                            {/* Unlocked Perks */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 py-2">
                                                <div className="flex items-center gap-2 text-sm text-slate-300 opacity-50">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Member Rate
                                                </div>
                                                <div className={cn("flex items-center gap-2 text-sm", totalStays >= 6 ? "text-slate-200" : "text-slate-600")}>
                                                    {totalStays >= 6 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4" />} Late Checkout
                                                </div>
                                                <div className={cn("flex items-center gap-2 text-sm", totalStays >= 15 ? "text-slate-200" : "text-slate-600")}>
                                                    {totalStays >= 15 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4" />} Free Breakfast
                                                </div>
                                                <div className={cn("flex items-center gap-2 text-sm", totalStays >= 15 ? "text-slate-200" : "text-slate-600")}>
                                                    {totalStays >= 15 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4" />} Room Upgrade
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Lifetime Stats */}
                <div className="col-span-1 grid grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lifetime Spend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">${totalSpend.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Daily Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">${avgDailyRate.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                {/* Left Column: Preferences & Info */}
                <div className="col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>Customize stay experience</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="late-checkout">Late Checkout</Label>
                                <Switch id="late-checkout" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="extra-towels">Extra Towels</Label>
                                <Switch id="extra-towels" />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="silent-room">Silent Room</Label>
                                <Switch id="silent-room" defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Communications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-900/50 p-3 rounded-md border border-slate-800 text-sm text-slate-300 min-h-[100px]">
                                <div className="flex gap-2 mb-2 text-xs text-slate-500">
                                    <MessageSquare className="h-3 w-3" />
                                    <span>Last request: 2 months ago</span>
                                </div>
                                "Requested extra pillows upon arrival."
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full mt-2 text-xs"
                                onClick={() => alert("Communication Logs feature coming soon!")}
                            >
                                View Full Log
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: History & Last Stay */}
                <div className="col-span-1 lg:col-span-2 space-y-4">
                    {/* Last Stay Summary */}
                    <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-indigo-500/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-4 w-4 text-indigo-400" />
                                Last Stay Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-4">
                            {(() => {
                                const lastStay = guest.reservations && guest.reservations.length > 0 ? guest.reservations[0] : null;
                                if (!lastStay) return <div className="col-span-3 text-sm text-muted-foreground">No stay history.</div>;

                                return (
                                    <>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Room</div>
                                            <div className="font-mono text-lg">{lastStay.room_number || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Dates</div>
                                            <div className="text-sm">
                                                {new Date(lastStay.check_in_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                {' - '}
                                                {new Date(lastStay.check_out_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Total</div>
                                            <div className="text-sm font-medium text-emerald-500">
                                                ₱{Number(lastStay.total_amount).toLocaleString()}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </CardContent>
                    </Card>

                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Stay History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={historyColumns} data={guest.reservations} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
