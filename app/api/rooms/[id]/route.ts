import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { id } = await params; // Await params for Next.js 15+
        const roomId = id;
        const { status } = body;

        console.log(`Updating Room ID: ${roomId} with Status: ${status}`);

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }
        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is missing' }, { status: 400 });
        }

        // Ensure params are not undefined
        const safeStatus = status || null;
        const safeId = roomId || null;

        await query('UPDATE rooms SET status = ? WHERE room_id = ?', [safeStatus, safeId]);

        return NextResponse.json({ message: 'Room status updated' });
    } catch (error: any) {
        console.error('Update Room Status Failed:', error);
        return NextResponse.json({ error: `Failed to update room status: ${error.message}` }, { status: 500 });
    }
}
