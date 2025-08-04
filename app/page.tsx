"use client";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

const slides = [
  {
    title: "Split expenses without friction",
    description: "Track shared costs with friends, roommates, or teams.",
    image: "/banner1.jpg",
  },
  {
    title: "Know who owes whom — instantly",
    description: "We handle the math. You stay focused on life.",
    image: "/banner2.jpg",
  },
  {
    title: "Settle up in one tap",
    description: "Mark payments done and keep your group clear.",
    image: "/banner3.jpg",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-zinc-100 text-zinc-900 min-h-screen flex flex-col">
  <Navbar />

  {/* Hero Section */}
  <div className="flex flex-col md:flex-row mt-8 px-2 gap-4">
    {/* Slideshow */}
    <section className="relative w-full md:w-2/3 rounded-2xl overflow-hidden aspect-video md:aspect-auto h-[300px] md:h-[480px]">
      {slides.map((slide, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: currentSlide === index ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})`, zIndex: 10 }}
          />
          <div className="absolute inset-0 bg-zinc-900 bg-opacity-50" />
          <div className="relative z-20 backdrop-blur-sm bg-zinc-100/10 flex flex-col items-center justify-center h-full text-center px-4 text-zinc-100">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold mb-4">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-lg max-w-xl">{slide.description}</p>
          </div>
        </motion.div>
      ))}
    </section>

    {/* CTA Section */}
    <section className="w-full md:w-1/3 bg-zinc-900 text-zinc-100 rounded-2xl py-12 px-6 flex flex-col justify-center items-center text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
      >
        Start Splitting Smarter
      </motion.h2>
      <p className="text-sm sm:text-base text-zinc-400 max-w-md mb-6">
        Create a group, track expenses, and settle balances effortlessly — all in one place.
      </p>
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboardPersonal" })}
        className="px-6 py-3 rounded-xl bg-zinc-100 text-zinc-900 font-semibold hover:bg-zinc-300 transition text-sm sm:text-base"
      >
        Sign In with Google
      </button>
      <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          className="w-5 h-5 sm:w-6 sm:h-6 mt-5"
      />
    </section>
  </div>

  {/* Footer */}
  <footer className="bg-zinc-100 text-zinc-600 border-t border-zinc-200 py-10 px-6 mt-12">
    <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-3 text-sm">
      <div>
        <h3 className="font-semibold text-zinc-800 mb-2">About</h3>
        <p>
          settleIt is a modern tool for students to manage shared expenses and settle up easily with minimum fuss.
        </p>
      </div>
      
      <div>
        <h3 className="font-semibold text-zinc-800 mb-2">Contact</h3>
        <p>Email: support@settleIt.app</p>
      </div>
    </div>
    <div className="text-center text-xs mt-8 text-zinc-400">
      &copy; {new Date().getFullYear()} settleIt. All rights reserved.
    </div>
  </footer>
</div>

  );
}
