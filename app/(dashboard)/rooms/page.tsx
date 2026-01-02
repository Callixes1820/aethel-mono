"use client";

import { useState, useEffect } from "react";
import { RoomGrid } from "@/components/dashboard/RoomGrid";
import { SafeRoom } from "@/types/room";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpNarrowWide, ArrowDownWideNarrow } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AddRoomForm } from "@/components/dashboard/AddRoomForm";

export default function RoomsPage() {
    const [open, setOpen] = useState(false);
    const [rooms, setRooms] = useState<SafeRoom[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch rooms on mount
    useEffect(() => {
        fetchRooms();
    }, []);

    async function fetchRooms() {
        try {
            const res = await fetch('/api/rooms');
            if (res.ok) {
                const data = await res.json();
                setRooms(data);
            }
        } catch (error) {
            console.error("Failed to fetch rooms", error);
        } finally {
            setLoading(false);
        }
    }

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const sortedRooms = [...rooms].sort((a, b) => {
        // Assuming room_number is numeric or numeric-string (e.g. "101")
        const numA = parseInt(a.room_number) || 0;
        const numB = parseInt(b.room_number) || 0;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Rooms</h2>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="gap-2"
                    >
                        {sortOrder === 'asc' ? (
                            <>
                                <ArrowUpNarrowWide className="h-4 w-4" />
                                Rooms Toggle
                            </>
                        ) : (
                            <>
                                <ArrowDownWideNarrow className="h-4 w-4" />
                                Rooms Toggle
                            </>
                        )}
                    </Button>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 cursor-pointer">
                                <Plus className="h-4 w-4" />
                                Add Room
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Room</DialogTitle>
                            </DialogHeader>
                            <AddRoomForm onSuccess={() => {
                                setOpen(false);
                                fetchRooms(); // Refresh list after add
                            }} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            {loading ? (
                <div className="text-center py-8 text-slate-400">Loading rooms...</div>
            ) : (
                <RoomGrid initialRooms={sortedRooms} />
            )}
        </div>
    );
}
