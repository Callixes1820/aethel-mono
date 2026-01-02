"use client";

import { useState, useEffect } from "react";
import { Guest } from "@/types/reservation";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Pencil, Trash } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AddGuestForm } from "@/components/dashboard/AddGuestForm";
import { LoyaltyBadge } from "@/components/ui/loyalty-badge";
import Link from "next/link";

export default function GuestsPage() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    const fetchGuests = async () => {
        try {
            const res = await fetch('/api/guests');
            if (res.ok) {
                const data = await res.json();
                setGuests(data);
            }
        } catch (error) {
            console.error("Failed to load guests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuests();
    }, []);

    const [page, setPage] = useState(1);

    const filteredGuests = guests.filter(g =>
        g.last_name.toLowerCase().includes(search.toLowerCase()) ||
        g.email?.toLowerCase().includes(search.toLowerCase())
    );

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [search]);

    const paginatedGuests = filteredGuests.slice((page - 1) * 10, page * 10);

    const getTier = (stays: number = 0) => {
        if (stays >= 15) return 'Noble';
        if (stays >= 6) return 'Aethel';
        return 'Mono';
    };

    const [selectedGuest, setSelectedGuest] = useState<Guest | undefined>(undefined);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this guest? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                fetchGuests();
            } else {
                alert(data.error || "Failed to delete guest");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Guests</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 cursor-pointer" onClick={() => setSelectedGuest(undefined)}>
                            <Plus className="h-4 w-4" />
                            Add Guest
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedGuest ? "Edit Guest" : "Add New Guest"}</DialogTitle>
                        </DialogHeader>
                        <AddGuestForm
                            initialData={selectedGuest}
                            onSuccess={() => {
                                setOpen(false);
                                fetchGuests();
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center py-4">
                <Input
                    placeholder="Search guests by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Loyalty</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">Loading guests...</TableCell>
                                </TableRow>
                            ) : paginatedGuests.map((guest) => (
                                <TableRow key={guest.guest_id}>
                                    <TableCell className="font-medium">#{guest.guest_id}</TableCell>
                                    <TableCell>
                                        {guest.first_name} {guest.last_name}
                                    </TableCell>
                                    <TableCell>
                                        <LoyaltyBadge tier={getTier(guest.total_stays)} />
                                    </TableCell>
                                    <TableCell>{guest.email || '-'}</TableCell>
                                    <TableCell>{guest.phone || '-'}</TableCell>
                                    <TableCell>{guest.address || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/guests/${guest.guest_id}`}>
                                                <Button variant="outline" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-amber-500 hover:text-amber-600 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedGuest(guest);
                                                    setOpen(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600 cursor-pointer"
                                                onClick={() => handleDelete(guest.guest_id)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && filteredGuests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No guests found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {filteredGuests.length > 0 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Page {page} of {Math.ceil(filteredGuests.length / 10)}
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="hover:bg-primary/20 hover:text-primary transition-colors"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * 10 >= filteredGuests.length}
                            className="hover:bg-primary/20 hover:text-primary transition-colors"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
