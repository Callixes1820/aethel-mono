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
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone number is required"),
    address: z.string().optional(),
})

import { Guest } from "@/types/reservation"; // Ensure this type exists or use any

export function AddGuestForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: any }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: initialData?.first_name || "",
            last_name: initialData?.last_name || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            address: initialData?.address || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const url = initialData ? `/api/guests/${initialData.guest_id}` : "/api/guests";
            const method = initialData ? "PATCH" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error(initialData ? "Failed to update guest" : "Failed to add guest");

            onSuccess();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <div className="flex gap-2">
                                    <Select
                                        defaultValue={field.value?.startsWith("+63") || !field.value ? "+63" : "02"}
                                        onValueChange={(val) => {
                                            const current = field.value || "";
                                            const clean = current.replace(/^\+63\s*|^02\s*/, "").trim();
                                            field.onChange(`${val} ${clean}`);
                                        }}
                                    >
                                        <SelectTrigger className="w-[80px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="+63">+63</SelectItem>
                                            <SelectItem value="02">02</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="956 345 3213"
                                        value={field.value ? field.value.replace(/^\+63\s*|^02\s*/, "") : ""}
                                        onChange={(e) => {
                                            let raw = e.target.value.replace(/\D/g, ""); // Remove non-digits

                                            // Format based on standard mobile length (10 digits)
                                            if (raw.length > 10) raw = raw.slice(0, 10);

                                            // Apply spacing: 956 345 3213
                                            let formatted = raw;
                                            if (raw.length > 3) formatted = `${raw.slice(0, 3)} ${raw.slice(3)}`;
                                            if (raw.length > 6) formatted = `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`;

                                            // Get current prefix from value or default
                                            const currentPrefix = field.value?.startsWith("02") ? "02" : "+63";
                                            field.onChange(`${currentPrefix} ${formatted}`);
                                        }}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input placeholder="123 Main St, City" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">{initialData ? "Update Guest" : "Add Guest"}</Button>
            </form>
        </Form>
    )
}
