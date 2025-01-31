import axios from 'axios';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    const cookieStore = await cookies();
    
    try {
        const { user } = await req.json(); // Assuming user data is in the request body (POST data)

        // Extract user from the request body or headers
        if (!user) {
            return NextResponse.json({ error: 'User not found in request' }, { status: 400 });
        }
        
        // Replace with your Mattermost server's URL and admin token
        const MM_SERVER_URL = 'http://192.168.0.109:8065';
        const MM_ADMIN_TOKEN = process.env.MATTERMOST_ADMIN_TOKEN;
        const MM_PASSWORD = user.user_metadata.mm_password;
        console.log(MM_PASSWORD);

        // Get the user's email from Supabase
        const email = user.email;

        if (!email) {
            throw new Error('Invalid user data from Supabase');
        }

        console.log(email, MM_PASSWORD);

        // Authenticate or create the Mattermost user
        const mattermostResponse = await axios.post(
            `${MM_SERVER_URL}/api/v4/users/login`,
            { login_id: email, password: MM_PASSWORD },
            {
                headers: {
                    Authorization: `Bearer ${MM_ADMIN_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            }
        );

        const { token } = mattermostResponse.headers;

        cookieStore.set('MMAUTHTOKEN', token, { path: '/' });
        cookieStore.set('MMUSERID', mattermostResponse.data.id, { path: '/' });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error logging in to Mattermost:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to login to Mattermost' }, { status: 500 });
    }
}