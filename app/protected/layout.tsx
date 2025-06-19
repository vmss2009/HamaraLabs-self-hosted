"use client";

import { SessionProvider } from "next-auth/react";
import Drawer from "@/components/Drawer";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex">
        <Drawer />
        <main className="">{children}</main>
      </div>
    </SessionProvider>
  );
}
