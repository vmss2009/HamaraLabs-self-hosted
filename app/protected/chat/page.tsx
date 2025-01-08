"use client"

import React, { useState, useEffect } from 'react';
import {createClient} from "@/utils/supabase/client";

export default function ChatPage() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        (async() => {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        })();
    }, []);

    return (
        <ChatButton user={user}/>
    );
}

function ChatButton({ user }: { user: any }) {
    const handleChatClick = async () => {
        try {
            const response: Response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user }),
            });

            const data = await response.json();

            if (data.token !== undefined) {
                const mattermostUrl = `http://192.168.0.105:8065?token=${data.token}`;
                document.cookie = `MMAUTHTOKEN=${data.token}; path=/;`;
                document.cookie = `MMUSERID=${data.id}; path=/;`;
                window.location.href = mattermostUrl;
            } else {
                console.error('Failed to retrieve Mattermost token');
            }
        } catch (error) {
            console.error('Error during Mattermost login:', error);
        }
    };

    return <button onClick={handleChatClick}>Chat</button>;
}