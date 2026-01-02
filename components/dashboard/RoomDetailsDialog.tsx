import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SafeRoom } from "@/types/room"
import { Bed, User, Wrench, History } from "lucide-react"

export function RoomDetailsDialog({ room }: { room: SafeRoom }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto text-sm cursor-pointer">
                    View Details
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-[#1E293B] border-slate-700 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Room {room.room_number} Details
                        <span className="text-xs font-normal text-slate-400 px-2 py-0.5 rounded-full border border-slate-600">
                            {room.type?.type_name}
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        Full overview of room status and history.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-3 rounded-md border border-slate-800">
                            <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                                <Bed className="h-3 w-3" /> Capacity
                            </div>
                            <div className="font-semibold text-lg">{room.type?.capacity || 2} Guests</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-md border border-slate-800">
                            <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                                Price / Night
                            </div>
                            <div className="font-semibold text-lg text-emerald-400">
                                ₱{room.type?.base_price?.toLocaleString() || '0'}
                            </div>
                        </div>
                    </div>

                    {/* Current Status Context */}
                    {room.status === 'Occupied' && (
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-md">
                            <div className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                                <User className="h-4 w-4" /> Current Guest
                            </div>
                            <div className="text-sm text-slate-300">
                                Guest information is protected. Check Reservations for details.
                            </div>
                        </div>
                    )}

                    {room.status === 'Maintenance' && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-md">
                            <div className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                                <Wrench className="h-4 w-4" /> Maintenance Log
                            </div>
                            <div className="text-sm text-slate-300">
                                A/C Repair pending. Reported today.
                            </div>
                        </div>
                    )}

                    {/* History */}
                    <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-slate-300">
                            <History className="h-4 w-4" /> Recent History
                        </h4>
                        <div className="space-y-2">
                            <HistoryList roomId={room.room_id} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function HistoryList({ roomId }: { roomId: number }) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/reservations?room_id=${roomId}&status=Checked_Out`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setHistory(data.slice(0, 3)); // Show top 3
                }
            })
            .catch(err => console.error("Failed to load history", err))
            .finally(() => setLoading(false));
    }, [roomId]);

    if (loading) return <div className="text-xs text-slate-500">Loading history...</div>;
    if (history.length === 0) return <div className="text-xs text-slate-500">No recent history.</div>;

    return (
        <>
            {history.map(res => (
                <div key={res.res_id} className="flex justify-between text-xs p-2 rounded hover:bg-slate-800/50">
                    <span className="text-slate-400">
                        {new Date(res.check_in_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {' - '}
                        {new Date(res.check_out_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-slate-500">{res.res_status.replace('_', ' ')}</span>
                </div>
            ))}
        </>
    );
}

