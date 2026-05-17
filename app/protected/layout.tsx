"use client";

import { SessionProvider } from "next-auth/react";
import Drawer from "@/components/ui/Drawer";
import AuthGuard from "@/components/form/AuthGuard";

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
          <main className="flex-1 w-full">{children}</main>
        </div>
      </AuthGuard>
    </SessionProvider>
  );
}
