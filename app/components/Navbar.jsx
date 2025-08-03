"use client";

import React from 'react';
import Link from 'next/link';
import { Tally5 } from 'lucide-react';
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

function Navbar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  if (status === "loading") return null;

  return (
    <div className="w-full bg-zinc-900 px-4 sm:px-6 py-3">
      <div className="flex sm:flex sm:items-center sm:justify-between">
        {/* Top row: Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Tally5 color="#ffffff" className="w-7 h-7 sm:w-8 sm:h-8" />
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="mt-3 sm:mt-0 flex items-center justify-start sm:justify-end space-x-3 ml-auto mb-2">
          {!isLoggedIn ? (
            <>
              {/* Register/Login links  */}
            {/*
            {["Login", "Register"].map((item, index) => (
              <Link
                key={index}
                href={`/${item.toLowerCase()}`}
                className="text-xs sm:text-sm md:text-base capitalize px-3 sm:px-4 py-2 border border-zinc-700 rounded-full hover:bg-zinc-100 hover:text-zinc-900 text-zinc-200 transition"
              >
                {item}
              </Link>
            ))}
            */}
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5 sm:w-6 sm:h-6"
              />

              
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboardPersonal" })}
                className="text-sm sm:text-base px-3 py-2 text-white rounded-full hover:text-black hover:bg-zinc-100 transition whitespace-nowrap"
              >
                Sign in with Google
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-zinc-200 text-sm sm:text-base font-semibold hover:text-red-500"
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
    </div>
  );
}

export default Navbar;
