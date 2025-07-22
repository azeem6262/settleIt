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
    <div className="bg-zinc-100 text-zinc-900 min-h-screen">
      <Navbar />

      {/* Hero Section / Slideshow */}
      <section className="relative h-[480px] overflow-hidden">
      {slides.map((slide, index) => (
      <motion.div
      key={index}
      initial={{ opacity: 0 }}
      animate={{ opacity: currentSlide === index ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
      >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${slide.image})`, zIndex: 10 }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-zinc-900 bg-opacity-50" />
      {/* Text content */}
      <div className="relative z-20 backdrop-blur-sm bg-zinc-100/10 flex flex-col items-center justify-center h-full text-center px-4 text-zinc-100">
        <h1 className="text-4xl md:text-5xl font-semibold mb-4">{slide.title}</h1>
        <p className="text-lg max-w-xl">{slide.description}</p>
      </div>
      </motion.div>
      ))}
      </section>


      {/* Features Section */}
<section className="py-20 px-6 max-w-7xl mx-auto">
  <motion.h2
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-4xl font-bold text-center text-zinc-800 mb-12"
  >
    Powerful Simplicity
  </motion.h2>
  <div className="grid md:grid-cols-3 gap-8">
    {[
      {
        title: "Add Expenses",
        desc: "Split bills and purchases fairly among friends or roommates with just a few clicks.",
        icon: "➕",
      },
      {
        title: "Track Balances",
        desc: "View real-time balance sheets and a breakdown of who owes whom.",
        icon: "📊",
      },
      {
        title: "Settle Payments",
        desc: "Instantly mark payments as settled to keep everything up-to-date.",
        icon: "✅",
      },
    ].map((feature, i) => (
      <motion.div
        key={i}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="bg-zinc-100 p-8 rounded-2xl shadow-md border border-zinc-200 hover:shadow-lg"
      >
        <div className="text-5xl mb-6">{feature.icon}</div>
        <h3 className="text-2xl font-semibold mb-3 text-zinc-800">{feature.title}</h3>
        <p className="text-zinc-600">{feature.desc}</p>
      </motion.div>
    ))}
  </div>
</section>

{/* CTA Section */}
<section className="py-20 bg-zinc-900 text-zinc-100 text-center px-6">
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-4xl font-bold mb-4"
  >
    Start Splitting Smarter
  </motion.h2>
  <p className="text-zinc-400 max-w-xl mx-auto mb-8">
    Create a group, track expenses, and settle balances effortlessly — all in one place.
  </p>
  <button
    onClick={()=> signIn("google", { callbackUrl: "/dashboardPersonal" })}
    className="inline-block px-6 py-3 rounded-xl bg-zinc-100 text-zinc-900 font-semibold hover:bg-zinc-300 transition"
  >
    Sign In with Google
  </button>
</section>

{/* Footer */}
<footer className="bg-zinc-100 text-zinc-600 border-t border-zinc-200 py-10 px-6">
  <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 text-sm">
    <div>
      <h3 className="font-semibold text-zinc-800 mb-2">About</h3>
      <p>
        settleIt is a modern tool for students to manage shared expenses and settle up easily with minimum fuss.
      </p>
    </div>
    <div>
      <h3 className="font-semibold text-zinc-800 mb-2">Quick Links</h3>
      <ul className="space-y-1">
        <li><a href="/" className="hover:text-zinc-800">Home</a></li>
        <li><a href="/dashboard" className="hover:text-zinc-800">Dashboard</a></li>
        <li><a href="/groups" className="hover:text-zinc-800">Groups</a></li>
      </ul>
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
