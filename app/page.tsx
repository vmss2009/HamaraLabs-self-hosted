"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/protected/student-snapshot");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20">
      <h1 className="text-3xl font-bold">Redirecting to Student Snapshot...</h1>
    </div>
  );
}