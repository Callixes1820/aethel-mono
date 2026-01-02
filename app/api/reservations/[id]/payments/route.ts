import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const payments = await query('SELECT * FROM payments WHERE reservation_id = ? ORDER BY payment_date DESC', [id]);
        return NextResponse.json(payments);
    } catch (error) {
        console.error("Failed to fetch payments:", error);
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { amount, method, reference } = body;

        if (!amount || !method) {
            return NextResponse.json({ error: "Amount and method are required" }, { status: 400 });
        }

        const result: any = await query(
            'INSERT INTO payments (reservation_id, amount, method, reference) VALUES (?, ?, ?, ?)',
            [id, amount, method, reference || null]
        );

        return NextResponse.json({
            message: "Payment recorded",
            payment_id: result.insertId,
            amount,
            method,
            payment_date: new Date().toISOString()
        });
    } catch (error) {
        console.error("Failed to record payment:", error);
        return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
    }
}
