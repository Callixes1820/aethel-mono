import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        // Query rooms with their types
        const { searchParams } = new URL(request.url);
        const checkIn = searchParams.get('check_in');
        const checkOut = searchParams.get('check_out');

        let sql = `
            SELECT r.*, rt.type_name, rt.base_price, rt.capacity, rt.description 
            FROM rooms r 
            LEFT JOIN room_types rt ON r.type_id = rt.type_id
        `;

        const params: any[] = [];

        // If dates are provided, filter out booked rooms
        if (checkIn && checkOut) {
            sql += `
                WHERE r.room_id NOT IN (
                    SELECT room_id FROM reservations 
                    WHERE res_status IN ('Confirmed', 'Checked_In')
                    AND (
                        (check_in_date < ?) AND 
                        (
                            CASE 
                                WHEN check_in_date = check_out_date THEN DATE_ADD(check_out_date, INTERVAL 1 DAY) 
                                ELSE check_out_date 
                            END > ?
                        )
                    )
                )
            `;
            // Overlap logic: (RequestedStart < ExistingEnd) AND (RequestedEnd > ExistingStart)
            // Existing: check_in_date, check_out_date
            // Requested: checkIn (?), checkOut (?)
            // Logic: (r.check_in_date < RequestedEnd AND r.check_out_date > RequestedStart)
            // Wait, my SQL above: (check_in_date < ? AND check_out_date > ?)
            // check_in_date (Existing Start) < checkOut (Requested End)
            // check_out_date (Existing End) > checkIn (Requested Start)
            params.push(checkOut, checkIn);
        }

        sql += ` ORDER BY r.room_number ASC`;

        const rows = await query<any[]>(sql, params);

        // Transform flat SQL result to nested structure
        const rooms = rows.map((row: any) => ({
            room_id: row.room_id,
            room_number: row.room_number,
            status: row.status,
            type_id: row.type_id,
            type: {
                type_id: row.type_id,
                type_name: row.type_name,
                base_price: parseFloat(row.base_price),
                capacity: row.capacity,
                description: row.description
            }
        }));

        return NextResponse.json(rooms);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.room_number) {
            return NextResponse.json({ error: 'Missing room number' }, { status: 400 });
        }

        const sql = `
            INSERT INTO rooms (room_number, type_id, status) 
            VALUES (?, ?, 'Available')
        `;

        await query(sql, [body.room_number, body.type_id]);

        return NextResponse.json({ message: 'Room created successfully' }, { status: 201 });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Room number already exists' }, { status: 409 });
        }
        console.error('Create Room Error:', error);
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }
}