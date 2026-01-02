import { NextResponse } from 'next/server';
import { pool, query } from '@/lib/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('room_id');
    const status = searchParams.get('status');

    try {
        let sql = `
            SELECT 
                r.*, 
                g.first_name, g.last_name, g.email,
                rm.room_number
            FROM reservations r
            LEFT JOIN guests g ON r.guest_id = g.guest_id
            LEFT JOIN rooms rm ON r.room_id = rm.room_id
        `;

        const conditions = [];
        const values = [];

        if (roomId) {
            conditions.push("r.room_id = ?");
            values.push(roomId);
        }

        if (status) {
            conditions.push("r.res_status = ?");
            values.push(status);
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        sql += " ORDER BY r.check_in_date DESC";

        const rows = await query<any[]>(sql, values);

        // Transform for frontend (nest guest object)
        const reservations = rows.map(row => ({
            ...row,
            guest: {
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email
            },
            room: {
                room_number: row.room_number
            }
        }));

        return NextResponse.json(reservations);
    } catch (error) {
        console.error('Fetch Reservations Error:', error);
        return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
    }
}

export async function POST(req: Request): Promise<NextResponse> {
    const connection = await pool.getConnection();
    try {
        const body = await req.json();

        // 1. Snapshot price (query DB for current room price)
        const [roomData] = await connection.execute<any[]>(
            'SELECT base_price FROM room_types WHERE type_id = (SELECT type_id FROM rooms WHERE room_id = ?)',
            [body.room_id]
        );

        if (!roomData || roomData.length === 0) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        const basePrice = parseFloat(roomData[0].base_price);
        const nights = Math.ceil(
            (new Date(body.check_out_date).getTime() - new Date(body.check_in_date).getTime()) / (1000 * 3600 * 24)
        );
        const totalAmount = basePrice * (nights || 1); // Ensure at least 1 night charge

        // 2. Check if check-in is today
        const isToday = new Date().toDateString() === new Date(body.check_in_date).toDateString();
        const initialStatus = isToday ? 'Checked_In' : 'Confirmed';

        // 3. Start Transaction
        await connection.beginTransaction();

        // Format dates for MySQL
        const checkIn = new Date(body.check_in_date).toISOString().split('T')[0];
        const checkOut = new Date(body.check_out_date).toISOString().split('T')[0];

        // Create Reservation
        const [resResult] = await connection.execute<any>(`
            INSERT INTO reservations 
            (guest_id, room_id, check_in_date, check_out_date, total_amount, res_status, price_per_night_at_booking)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            body.guest_id,
            body.room_id,
            checkIn,
            checkOut,
            totalAmount,
            initialStatus,
            basePrice
        ]);

        // If Checked_In, update Room Status
        if (isToday) {
            await connection.execute(
                'UPDATE rooms SET status = ? WHERE room_id = ?',
                ['Occupied', body.room_id]
            );
        }

        // Commit Transaction
        await connection.commit();

        return NextResponse.json({
            message: "Reservation created",
            res_id: resResult.insertId,
            status: initialStatus,
            total_amount: totalAmount
        });

    } catch (error) {
        await connection.rollback();
        console.error('Reservation Create Failed:', error);
        // @ts-ignore
        return NextResponse.json({ error: `Failed to create reservation: ${error.message || error}` }, { status: 500 });
    } finally {
        connection.release();
    }
}

