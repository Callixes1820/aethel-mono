import { pool } from '@/lib/db';

async function checkReservations() {
    try {
        const [rows] = await pool.query("SELECT res_id, guest_id, res_status FROM reservations ORDER BY res_id ASC");
        console.log("--- RESERVATIONS ---");
        (rows as any[]).forEach(r => {
            console.log(JSON.stringify(r));
        });
    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit();
    }
}

checkReservations();
