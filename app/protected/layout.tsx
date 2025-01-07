import React from "react";
import Drawer from "@/components/drawer"; // Update the path if different

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <Drawer />
            <main className="ml-10 p-6">{children}</main>
        </div>
    );
}