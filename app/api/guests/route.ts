import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(): Promise<NextResponse> {
    try {
        const guests = await query('SELECT * FROM guests ORDER BY created_at ASC');
        return NextResponse.json(guests);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { first_name, last_name, email, phone, address } = body;

        await query(
            'INSERT INTO guests (first_name, last_name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone, address || null]
        );

        return NextResponse.json({ message: 'Guest added successfully' }, { status: 201 });
    } catch (error) {
        console.error('Add Guest Error:', error);
        return NextResponse.json({ error: 'Failed to add guest' }, { status: 500 });
    }
}
