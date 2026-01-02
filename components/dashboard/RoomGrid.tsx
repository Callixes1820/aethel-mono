"use client";

import { useState, useEffect } from "react";
import { SafeRoom, RoomStatus } from "@/types/room";
import { RoomCard } from "./RoomCard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface RoomGridProps {
    initialRooms: SafeRoom[];
}

export function RoomGrid({ initialRooms }: RoomGridProps) {
    const [rooms, setRooms] = useState<SafeRoom[]>(initialRooms);
    const [filterStatus, setFilterStatus] = useState<string>("All");
    const [filterFloor, setFilterFloor] = useState<string>("All");

    useEffect(() => {
        setRooms(initialRooms);
    }, [initialRooms]);

    const floors = Array.from(new Set(initialRooms.map(r => r.room_number.charAt(0)))).sort();

    const filteredRooms = rooms.filter(room => {
        const statusMatch = filterStatus === "All" || room.status === filterStatus;
        const floorMatch = filterFloor === "All" || room.room_number.startsWith(filterFloor);
        return statusMatch && floorMatch;
    });

    const handleUpdateStatus = async (roomId: number, status: RoomStatus) => {
        // Optimistic update
        setRooms(prev => prev.map(r => r.room_id === roomId ? { ...r, status } : r));

        try {
            const res = await fetch(`/api/rooms/${roomId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update');
            }

        } catch (error) {
            console.error("Failed to update status", error);
            // Revert optimistic update
            setRooms(initialRooms);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Occupied">Occupied</SelectItem>
                            <SelectItem value="Dirty">Dirty</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Floor</label>
                    <Select value={filterFloor} onValueChange={setFilterFloor}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Floor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Floors</SelectItem>
                            {floors.map(f => (
                                <SelectItem key={f} value={f}>Floor {f}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="ml-auto text-sm text-muted-foreground">
                    Showing {filteredRooms.length} rooms
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredRooms.map(room => (
                    <RoomCard
                        key={room.room_id}
                        room={room}
                        onUpdateStatus={handleUpdateStatus}
                    />
                ))}
            </div>
        </div>
    );
}
