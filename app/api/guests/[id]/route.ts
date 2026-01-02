import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await params;
        const guestId = id;

        // Fetch Guest Details
        const [guest] = await query<any[]>('SELECT * FROM guests WHERE guest_id = ?', [guestId]);

        if (!guest) {
            return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
        }

        // Fetch Reservation History
        const reservations = await query<any[]>(`
            SELECT r.*, rm.room_number 
            FROM reservations r
            LEFT JOIN rooms rm ON r.room_id = rm.room_id
            WHERE r.guest_id = ?
            ORDER BY r.check_in_date DESC
        `, [guestId]);

        return NextResponse.json({ ...guest, reservations });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to fetch guest details' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const guestId = id;
        const body = await request.json();

        // Destructure fields to update
        const { first_name, last_name, email, phone, address } = body;

        await query(`
            UPDATE guests 
            SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?
            WHERE guest_id = ?
        `, [first_name, last_name, email, phone, address, guestId]);

        return NextResponse.json({ message: 'Guest updated successfully' });
    } catch (error) {
        console.error('Update Guest Error:', error);
        return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const guestId = id;

        // Check for reservations
        const reservations = await query<any[]>('SELECT * FROM reservations WHERE guest_id = ?', [guestId]);
        if (reservations.length > 0) {
            return NextResponse.json({ error: 'Cannot delete guest with existing reservations' }, { status: 400 });
        }

        await query('DELETE FROM guests WHERE guest_id = ?', [guestId]);
        return NextResponse.json({ message: 'Guest deleted successfully' });
    } catch (error) {
        console.error('Delete Guest Error:', error);
        return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 });
    }
}
