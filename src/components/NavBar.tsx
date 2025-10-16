"use client";

import { clearToken, getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const logout = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="container flex h-14 items-center gap-4">
        <a href="/" className="font-semibold">Bookings</a>
        <a href="/calendar" className=" text-zinc-600 hover:text-zinc-900 ">
          Connect Calendar
        </a>
        <div className="ml-auto flex items-center gap-2">
          {mounted && getToken() && (
            <button onClick={logout} className="btn">Log out</button>
          )}
        </div>
      </div>
    </nav>
  );
}
