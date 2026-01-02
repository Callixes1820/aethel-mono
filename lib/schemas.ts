import { z } from "zod";

// Enums (matching Prisma/SQL)
export const RoomStatusEnum = z.enum(["Available", "Occupied", "Dirty", "Maintenance"]);
export const ReservationStatusEnum = z.enum(["Confirmed", "Checked_In", "Checked_Out", "Cancelled"]);

// Guest Schema
export const GuestSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().min(10, "Phone number required"),
    address: z.string().optional(),
});

// Room Schema
export const RoomSchema = z.object({
    room_number: z.string().min(1, "Room number required"),
    type_id: z.coerce.number().int().positive(),
    status: RoomStatusEnum.default("Available"),
});

// Reservation Schema
export const ReservationSchema = z.object({
    guest_id: z.coerce.number().int().positive(),
    room_id: z.coerce.number().int().positive(),
    check_in_date: z.date(),
    check_out_date: z.date(),
    price_per_night_at_booking: z.coerce.number().min(0),
});
