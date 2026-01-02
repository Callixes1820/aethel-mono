"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Reservation } from "@/types/reservation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Trash2 } from "lucide-react"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

const StatusCell = ({ row }: { row: any }) => {
    const reservation = row.original;
    const [status, setStatus] = useState(reservation.res_status);

    const handleStatusChange = async (newStatus: string) => {
        setStatus(newStatus);
        try {
            await fetch(`/api/reservations/${reservation.res_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ res_status: newStatus }),
            });
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const getColor = (s: string) => {
        switch (s) {
            case 'Checked_In': return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
            case 'Confirmed': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
            case 'Cancelled': return 'text-red-500 border-red-500/30 bg-red-500/10';
            case 'Checked_Out': return 'text-slate-500 border-slate-500/30 bg-slate-500/10';
            default: return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
        }
    };

    return (
        <Select onValueChange={handleStatusChange} defaultValue={status}>
            <SelectTrigger className={`w-[130px] h-8 border-none ${getColor(status)}`}>
                <SelectValue>{status.replace('_', ' ')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Checked_In">Checked In</SelectItem>
                <SelectItem value="Checked_Out">Checked Out</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
        </Select>
    );
};

const ActionsCell = ({ row }: { row: any }) => {
    const reservation = row.original;

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this reservation?")) return;
        try {
            const res = await fetch(`/api/reservations/${reservation.res_id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                window.location.reload();
            } else {
                alert("Failed to delete reservation");
            }
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    return (
        <div className="flex items-center gap-2 justify-end">
            {reservation.res_status === 'Cancelled' && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-500/10"
                    onClick={handleDelete}
                    title="Delete Reservation"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
};

export const columns: ColumnDef<Reservation>[] = [
    {
        id: "guest",
        accessorFn: (row) => `${row.guest?.first_name} ${row.guest?.last_name}`,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Guest
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const guest = row.original.guest;
            return <div className="font-medium">{guest?.first_name} {guest?.last_name}</div>
        },
    },
    {
        accessorKey: "room.room_number",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Room
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "check_in_date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Check In
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return <div>{new Date(row.getValue("check_in_date")).toLocaleDateString()}</div>
        }
    },
    {
        accessorKey: "check_out_date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Check Out
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return <div>{new Date(row.getValue("check_out_date")).toLocaleDateString()}</div>
        }
    },
    {
        accessorKey: "res_status",
        header: "Status",
        cell: ({ row }) => <StatusCell row={row} />
    },
    {
        accessorKey: "total_amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total_amount"))
            const formatted = new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
            }).format(amount)

            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionsCell row={row} />
    }
]
