"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { SafeRoom } from "@/types/room"

const FormSchema = z.object({
    guest_id: z.number(),
    room_id: z.string().min(1, "Please select a room"),
    check_in: z.date(),
    check_out: z.date(),
}).refine((data) => data.check_out > data.check_in, {
    message: "Check-out must be after check-in",
    path: ["check_out"],
});

export function BookingForm({ onSuccess, preSelectedGuestId }: { onSuccess: () => void, preSelectedGuestId?: number }) {
    const [guests, setGuests] = useState<{ label: string, value: number }[]>([]);
    const [rooms, setRooms] = useState<SafeRoom[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            guest_id: preSelectedGuestId,
        }
    })

    const checkIn = form.watch("check_in");
    const checkOut = form.watch("check_out");

    useEffect(() => {
        // Fetch Guests
        fetch('/api/guests')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setGuests(data.map((g: any) => ({
                        label: `${g.first_name} ${g.last_name}`,
                        value: g.guest_id
                    })));
                }

                // If preSelectedGuestId is provided, ensure field is set (sometimes defaultValues race with render)
                if (preSelectedGuestId) {
                    form.setValue("guest_id", preSelectedGuestId);
                }
            })
            .catch(console.error);
    }, [preSelectedGuestId, form]);

    // Fetch rooms when dates change
    useEffect(() => {
        if (checkIn && checkOut && checkOut > checkIn) {
            setLoadingRooms(true);
            const start = format(checkIn, 'yyyy-MM-dd');
            const end = format(checkOut, 'yyyy-MM-dd');

            fetch(`/api/rooms?check_in=${start}&check_out=${end}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        // Backend now filters out conflicting rooms
                        setRooms(data.filter((r: any) => r.status !== 'Maintenance'));
                    }
                })
                .catch(console.error)
                .finally(() => setLoadingRooms(false));
        } else {
            setRooms([]);
        }
    }, [checkIn, checkOut]);

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guest_id: data.guest_id,
                    room_id: parseInt(data.room_id),
                    check_in_date: data.check_in,
                    check_out_date: data.check_out
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Server Error:", errorData);
                throw new Error(errorData.error || 'Failed to create reservation');
            }

            onSuccess();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <FormField
                    control={form.control}
                    name="guest_id"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Guest</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            disabled={!!preSelectedGuestId}
                                            className={cn(
                                                "w-full justify-between",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value
                                                ? guests.find(
                                                    (guest) => guest.value === field.value
                                                )?.label
                                                : "Select guest"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search guest..." />
                                        <CommandList>
                                            <CommandEmpty>No guest found.</CommandEmpty>
                                            <CommandGroup>
                                                {guests.map((guest) => (
                                                    <CommandItem
                                                        value={guest.label}
                                                        key={guest.value}
                                                        onSelect={() => {
                                                            form.setValue("guest_id", guest.value)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                guest.value === field.value
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {guest.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="check_in"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Check In Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => {
                                                if (date) {
                                                    const newDate = new Date(date);
                                                    newDate.setHours(12, 0, 0, 0);
                                                    field.onChange(newDate);
                                                }
                                            }}
                                            disabled={(date) =>
                                                date < new Date(new Date().setHours(0, 0, 0, 0))
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="check_out"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Check Out Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => {
                                                if (date) {
                                                    const newDate = new Date(date);
                                                    newDate.setHours(12, 0, 0, 0);
                                                    field.onChange(newDate);
                                                }
                                            }}
                                            disabled={(date) =>
                                                date <= (checkIn || new Date())
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="room_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Room</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={rooms.length === 0 || loadingRooms}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={
                                            loadingRooms ? "Loading availability..." :
                                                (!checkIn || !checkOut) ? "Select dates first" :
                                                    rooms.length === 0 ? "No rooms available" : "Select a room"
                                        } />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {rooms.map((room) => (
                                        <SelectItem key={room.room_id} value={String(room.room_id)}>
                                            {room.room_number} - {room.type?.type_name} (₱{room.type?.base_price})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Only available rooms for the selected dates are shown.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">Create Reservation</Button>
            </form>
        </Form>
    )
}
