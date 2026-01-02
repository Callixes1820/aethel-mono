import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signToken, comparePassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        // Fetch user
        const users: any[] = await query(
            `SELECT u.*, r.role_name 
             FROM users u 
             JOIN roles r ON u.role_id = r.role_id 
             WHERE u.username = ?`,
            [username]
        );

        const user = users[0];

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password
        const isValid = await comparePassword(password, user.password_hash);

        // FOR DEV ONLY: If validation fails, check if password matches plaintext (for legacy/unhashed passwords during migration)
        // In production, REMOVE THIS.
        let fallbackValid = false;
        if (!isValid && password === user.password_hash) {
            fallbackValid = true;
            // Ideally we should re-hash here, but let's keep it simple for now.
        }

        if (!isValid && !fallbackValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create Session
        const token = await signToken({
            userId: user.user_id,
            username: user.username,
            role: user.role_name,
            fullName: user.full_name
        });

        const cookieStore = await cookies();
        cookieStore.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return NextResponse.json({ success: true, user: { username: user.username, role: user.role_name } });

    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
