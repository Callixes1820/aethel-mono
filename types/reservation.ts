import { RoomStatus } from './room';

// Reservation Types
export type ReservationStatus = 'Confirmed' | 'Checked_In' | 'Checked_Out' | 'Cancelled';

export interface ServiceCharge {
    charge_id: number;
    reservation_id: number;
    description: string;
    amount: number;
    category: string; // New field
    created_at: string;
}

export interface Payment {
    payment_id: number;
    reservation_id: number;
    amount: number;
    method: 'Cash' | 'Card' | 'Transfer' | 'Other';
    reference?: string;
    payment_date: string;
}

export interface Reservation {
    res_id: number;
    guest_id: number;
    room_id: number;
    check_in_date: Date;
    check_out_date: Date;
    total_amount: number; // Converted from Decimal
    discount: number; // New field
    res_status: ReservationStatus;
    price_per_night_at_booking?: number; // Converted from Decimal
    guest?: Guest;
    room?: {
        room_number: string;
        type?: {
            type_name: string;
        }
    };
    charges?: ServiceCharge[];
    payments?: Payment[];
}

// Guest Types
export interface Guest {
    guest_id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    address?: string | null;
    total_stays?: number;
}
