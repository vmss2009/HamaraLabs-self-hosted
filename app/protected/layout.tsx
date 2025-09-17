"use client";

import { SessionProvider } from "next-auth/react";
import Drawer from "@/components/Drawer";
import AuthGuard from "@/components/AuthGuard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthGuard>
        <div className="flex">
          <Drawer />
          <main className="">{children}</main>
        </div>
      </AuthGuard>
    </SessionProvider>
  );
}
