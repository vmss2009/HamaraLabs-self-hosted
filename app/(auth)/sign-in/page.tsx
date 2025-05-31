"use client";
import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20">
      <h1 className="text-3xl font-bold">Welcome to HamaraLabs</h1>
      <button
        onClick={() => signIn("authentik")}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Sign in with Authentik
      </button>
    </div>
  );
}
