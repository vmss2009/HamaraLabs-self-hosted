import { signInAction } from "@/app/actions";
import Button from "@/components/buttons/button";
import React from 'react';

export default async function Login() {

  return (
      <form className="flex flex-col gap-4 max-w-sm mx-auto">
        <h1 className="text-2xl font-medium mb-4">Login to HamaraLabs</h1>
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
            type="email"
            id="email"
            name="email"
            required
            className="p-2 border border-gray-300 rounded text-black"
        />
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
            type="password"
            id="password"
            name="password"
            required
            className="p-2 border border-gray-300 rounded text-black"
        />
        <Button type="submit" formAction={signInAction}>Submit</Button>
      </form>
  );
};