import React from "react";
import { createClient } from "@/utils/supabase/server";
import { resetPasswordRedirect } from "@/app/actions";
import Button from "@/components/buttons/button";

export default async function HomeDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-medium">Home Dashboard</h1>
            <p className="text-lg">Welcome, {user?.email}</p>
            <Button type="submit" onClick={resetPasswordRedirect}>Reset password</Button>
        </div>
    );
}