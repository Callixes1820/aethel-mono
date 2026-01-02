"use client";

import { useState, useEffect } from "react";
import { Reservation } from "@/types/reservation";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BookingForm } from "@/components/dashboard/BookingForm";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    async function fetchReservations() {
        try {
            const res = await fetch('/api/reservations', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setReservations(data);
            }
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReservations();
    }, []);

    const handleSuccess = () => {
        setOpen(false);
        fetchReservations();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Reservations</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="cursor-pointer gap-2">
                            <Plus className="h-4 w-4" />
                            Add Reservation
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Reservation</DialogTitle>
                            <DialogDescription>
                                Book a stay for an existing guest.
                            </DialogDescription>
                        </DialogHeader>
                        <BookingForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="text-center py-8 text-slate-400">Loading reservations...</div>
            ) : (
                <DataTable columns={columns} data={reservations} meta={{ updateData: fetchReservations }} />
            )}
        </div>
    );
}
