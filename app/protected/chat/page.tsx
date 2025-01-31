"use client"

import React, { useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { CircularProgress, Box } from '@mui/material';

export default function ChatPage() {
    useEffect(() => {
        (async() => {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            try {
                const response: Response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user }),
                });
    
                const data = await response.json();
    
                if (data.success) {
                    const mattermostUrl = `http://192.168.0.109:8065`;
                    window.location.href = mattermostUrl;
                } else {
                    console.error('Failed to retrieve Mattermost token');
                }
            } catch (error) {
                console.error('Error during Mattermost login:', error);
            }
        })();
    }, []);

    return (
        <Box
            sx={{
                position: "fixed", // Make the box fixed to the viewport
                top: 0,
                left: 0,
                width: "100vw", // Full viewport width
                height: "100vh", // Full viewport height
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <CircularProgress
                sx={{
                    width: "80px !important", // Set loader width
                    height: "80px !important", // Set loader height
                }}
            />
        </Box>
    );
}