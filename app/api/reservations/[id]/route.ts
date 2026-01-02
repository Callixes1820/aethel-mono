import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const reservationId = id;
        const body = await request.json();
        const { res_status, discount } = body;

        // Valid statuses: 'Pending', 'Confirmed', 'Checked_In', 'Checked_Out', 'Cancelled'

        if (discount !== undefined) {
            await query('UPDATE reservations SET discount = ? WHERE res_id = ?', [discount, reservationId]);
        }

        if (res_status) {
            await query('UPDATE reservations SET res_status = ? WHERE res_id = ?', [res_status, reservationId]);
        }

        // If status becomes Checked_In or Checked_Out, we might want to update Room status too?
        // For now, keep it simple as requested. Using triggers or separate logic is better for complex state.

        return NextResponse.json({ message: 'Reservation status updated' });
    } catch (error: any) {
        console.error('Update Reservation Error:', error);
        return NextResponse.json({ error: `Failed to update reservation: ${error.message}` }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await query('DELETE FROM reservations WHERE res_id = ?', [id]);
        return NextResponse.json({ message: 'Reservation deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: `Failed to delete reservation: ${error.message}` }, { status: 500 });
    }
}
