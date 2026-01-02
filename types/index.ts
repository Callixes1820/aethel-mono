// TypeScript interfaces mirroring the SQL schema

export interface Guest {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    address?: string;
    created_at: Date;
}

export enum RoomStatus {
    Available = 'Available',
    Occupied = 'Occupied',
    Dirty = 'Dirty',
    Maintenance = 'Maintenance'
}

export interface Room {
    id: number;
    room_number: string;
    type_id: number;
    status: RoomStatus;
}
