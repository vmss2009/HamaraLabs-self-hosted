"use client";

import { SessionProvider } from "next-auth/react";
import Drawer from "@/components/drawer";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>
    <div className="flex">
      <Drawer />
      <main className="ml-10 p-6">{children}</main>
    </div>
  </SessionProvider>;
}