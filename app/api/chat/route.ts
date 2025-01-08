import axios from 'axios';
import { NextResponse } from 'next/server';

interface ErrorResponse {
    error: string;
}

export async function POST(req: Request) {
    try {
        // Extract user from the request body or headers
        const { user } = await req.json(); // Assuming user data is in the request body (POST data)
        if (!user) {
            return NextResponse.json({ error: 'User not found in request' }, { status: 400 });
        }

        // Replace with your Mattermost server's URL and admin token
        const MM_SERVER_URL = 'http://192.168.0.105:8065';
        const MM_ADMIN_TOKEN = '3yu3foaqw787teyi4wn4w189tr';

        // Get the user's email from Supabase


        const email = user.email;

        if (!email) {
            throw new Error('Invalid user data from Supabase');
        }

        console.log(email);

        // Authenticate or create the Mattermost user
        const mattermostResponse = await axios.post(
            `${MM_SERVER_URL}/api/v4/users/login`,
            { login_id: email, password: 'mohan@2009' },
            {
                headers: {
                    Authorization: `Bearer ${MM_ADMIN_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            }
        );

        const { token } = mattermostResponse.headers;
        // Return the token in a JSON response
        console.log(mattermostResponse.data, mattermostResponse.headers);
        return NextResponse.json({ token, id: mattermostResponse.data.id });
    } catch (error: any) {
        console.error('Error logging in to Mattermost:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to login to Mattermost' }, { status: 500 });
    }
}