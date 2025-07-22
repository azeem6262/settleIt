"use client";

import React from 'react';
import Link from 'next/link';
import { Tally5, UserCircle } from 'lucide-react';
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

function Navbar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  
  if (status === "loading") return null;

  return (
    <div className="navbar w-full flex items-center justify-between h-16 bg-zinc-900 px-6">
      {/* Logo Section */}
      <Link href="/" className="flex items-center">
        <Tally5 color="#ffffff" className="w-8 h-8" />
      </Link>

      {/* Auth Links */}
      <div className="flex items-center space-x-4">
        {!isLoggedIn ? (
          <>
            {/* Register/Login links (optional) 
            {["Login", "Register"].map((item, index) => (
              <Link
                key={index}
                href={`/${item.toLowerCase()}`}
                className="text-sm md:text-base capitalize px-4 py-2 border border-zinc-700 rounded-full hover:bg-zinc-100 hover:text-zinc-900 text-zinc-200 transition"
              >
                {item}
              </Link>
            ))}
            */}
             <img
             src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
             alt="Google"
             className="w-6 h-6"
             />

            {/* Google Sign In button */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboardPersonal" })}
              className="text-sm md:text-base px-4 py-2 text-white rounded-full hover:text-black hover:bg-zinc-100 transition"
            >
              Sign in with Google
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => signOut({callbackUrl: "/"})}
              className="text-zinc-200 hover:text-red-500"
            >
              Log out
            </button>
            <Image
              src={session.user.image}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full hover:opacity-80"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
