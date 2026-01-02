import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const charges = await query('SELECT * FROM service_charges WHERE reservation_id = ? ORDER BY created_at DESC', [id]);
        return NextResponse.json(charges);
    } catch (error) {
        console.error("Failed to fetch charges:", error);
        return NextResponse.json({ error: "Failed to fetch charges" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { description, amount, category } = body;

        if (!description || !amount) {
            return NextResponse.json({ error: "Description and amount are required" }, { status: 400 });
        }

        const validCategory = category || 'Other';

        const result: any = await query(
            'INSERT INTO service_charges (reservation_id, description, amount, category) VALUES (?, ?, ?, ?)',
            [id, description, amount, validCategory]
        );

        return NextResponse.json({
            message: "Charge added",
            charge_id: result.insertId,
            description,
            amount,
            category: validCategory,
            created_at: new Date().toISOString()
        });
    } catch (error) {
        console.error("Failed to add charge:", error);
        return NextResponse.json({ error: "Failed to add charge" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Here ID is technically reservation ID but we need charge ID via query or body? 
    // Actually, DELETE usually targets the resource itself. 
    // For simplicity, I'll pass charge_id in body or use a separate route.
    // REST standard: api/charges/[charge_id]. But for now, let's keep it simple or implement specific delete later.
) {
    // Placeholder
    return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
