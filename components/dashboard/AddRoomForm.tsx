"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
    room_number: z.string().min(1, "Room number is required"),
    floor: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Floor must be a positive number",
    }),
    type_id: z.string().min(1, "Room type is required"),
})

const ROOM_TYPES = [
    { id: "1", name: "Standard Single (₱5,500)", price: 5500 },
    { id: "2", name: "Standard Double (₱6,800)", price: 6800 },
    { id: "3", name: "Mono Twin (₱7,800)", price: 7800 },
    { id: "4", name: "Aethel Deluxe (₱9,500)", price: 9500 },
    { id: "5", name: "Mono Loft (₱12,500)", price: 12500 },
    { id: "6", name: "Aethel Executive (₱16,000)", price: 16000 },
    { id: "7", name: "Presidential Aethel Suite (₱45,000)", price: 45000 },
]

export function AddRoomForm({ onSuccess }: { onSuccess: () => void }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            room_number: "",
            floor: "",
            type_id: "",
        },
    })

    const roomNumber = form.watch("room_number");

    useEffect(() => {
        if (roomNumber && roomNumber.length > 0) {
            const firstDigit = roomNumber.charAt(0);
            if (!isNaN(Number(firstDigit))) {
                form.setValue("floor", firstDigit);
            }
        }
    }, [roomNumber, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const res = await fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const error = await res.json();
                console.error("Failed to add room", error);
                // In a real app, set form error here
                return;
            }

            // Refresh via callback
            onSuccess();
        } catch (error) {
            console.error("Submission error", error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="room_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Room Number</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. 301" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="floor"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Floor</FormLabel>
                            <FormControl>
                                {/* Auto-calculated, read-only */}
                                <Input type="number" {...field} readOnly className="bg-slate-100 text-slate-500 cursor-not-allowed" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="type_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Room Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {ROOM_TYPES.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">Add Room</Button>
            </form>
        </Form>
    )
}
