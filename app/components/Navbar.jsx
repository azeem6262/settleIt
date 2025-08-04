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
        <div className="sm:mt-0 flex items-center justify-start sm:justify-end space-x-3 ml-auto">
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
              
              <h1
                className="md:text-5xl font-bold sm:text-4xl py-2 text-white transition whitespace-nowrap"
              >
                settleIt
              </h1>
            </>
          ) : (
            <>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-zinc-200 text-md sm:text-base font-bold hover:text-red-500"
              >
                Sign Out
              </button>
              <Image
                src={session.user.image}
                alt="Profile"
                width={28}
                height={28}
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
