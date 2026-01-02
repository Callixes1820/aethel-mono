import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || 'monthly';

        // 1. Total Revenue (Sum of COMPLETED reservations)
        const revenueResult: any = await query(
            "SELECT SUM(total_amount) as total FROM reservations WHERE res_status = 'Checked_Out'"
        );
        const totalRevenue = revenueResult[0]?.total || 0;

        // 2. Total Guests
        const guestsResult: any = await query('SELECT COUNT(*) as count FROM guests');
        const totalGuests = guestsResult[0]?.count || 0;

        // 3. Active Bookings (Confirmed or Checked_In)
        const activeResult: any = await query(
            "SELECT COUNT(*) as count FROM reservations WHERE res_status IN ('Confirmed', 'Checked_In')"
        );
        const activeBookings = activeResult[0]?.count || 0;

        // 4. Occupancy Rate
        // Get total rooms count
        const roomsResult: any = await query('SELECT COUNT(*) as count FROM rooms WHERE status != "Maintenance"');
        const totalRooms = roomsResult[0]?.count || 1; // Avoid div by zero

        // Get currently occupied rooms (Checked_In)
        const occupiedResult: any = await query(
            "SELECT COUNT(*) as count FROM reservations WHERE res_status = 'Checked_In'"
        );
        const occupiedRooms = occupiedResult[0]?.count || 0;
        const occupancyRate = (occupiedRooms / totalRooms) * 100;

        // 5. Recent Bookings (Last 5)
        const recentBookings = await query(
            `SELECT r.res_id, g.first_name, g.last_name, r.total_amount, r.res_status 
             FROM reservations r 
             JOIN guests g ON r.guest_id = g.guest_id 
             ORDER BY r.res_id DESC 
             LIMIT 5`
        );

        // 6. Dynamic Chart Data
        let chartData = [];
        let querySql = "";

        if (range === 'daily') {
            // Last 30 days
            querySql = `SELECT DATE(check_out_date) as date, SUM(total_amount) as total 
                         FROM reservations 
                         WHERE res_status = 'Checked_Out' 
                         AND check_out_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                         GROUP BY date 
                         ORDER BY date ASC`;
            const results = await query(querySql);
            chartData = results.map((item: any) => ({
                name: format(new Date(item.date), 'MMM dd'),
                total: Number(item.total)
            }));

        } else if (range === 'yearly') {
            // Last 5 years
            querySql = `SELECT YEAR(check_out_date) as year, SUM(total_amount) as total 
                        FROM reservations 
                        WHERE res_status = 'Checked_Out' 
                        AND check_out_date >= DATE_SUB(NOW(), INTERVAL 5 YEAR)
                        GROUP BY year 
                        ORDER BY year ASC`;
            const results = await query(querySql);
            chartData = results.map((item: any) => ({
                name: String(item.year),
                total: Number(item.total)
            }));

        } else {
            // Monthly (Default) - Last 12 months
            querySql = `SELECT DATE_FORMAT(check_out_date, '%Y-%m') as month, SUM(total_amount) as total 
                        FROM reservations 
                        WHERE res_status = 'Checked_Out' 
                        AND check_out_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                        GROUP BY month 
                        ORDER BY month ASC`;
            const results = await query(querySql);
            chartData = results.map((item: any) => ({
                name: format(new Date(item.month + '-01'), 'MMM yyyy'),
                total: Number(item.total)
            }));
        }

        return NextResponse.json({
            totalRevenue,
            totalGuests,
            activeBookings,
            occupancyRate,
            recentBookings,
            chartData
        });

    } catch (error: any) {
        console.error('Dashboard Stats Error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
