// Manually defined types since Prisma generation is failing in this environment.

export type RoomStatus = 'Available' | 'Occupied' | 'Dirty' | 'Maintenance';

export interface RoomType {
    type_id: number;
    type_name: string;
    base_price: number; // Converted to number
    capacity: number;
    description: string | null;
}

export interface SafeRoom {
    room_id: number;
    room_number: string;
    type_id: number | null;
    status: RoomStatus;
    type: RoomType | null;
}
