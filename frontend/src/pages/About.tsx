import React, { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Star, Shield, Heart, Trophy, Zap } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

// Character-by-character typing animation component
const TypewriterText = ({ text, className = "", delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let currentIndex = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 20);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay, isInView]);

  return (
    <span ref={ref} className={className}>
      {displayedText}
      {displayedText.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
};

const About = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen text-white bg-black">
        {/* Hero Section - Full viewport with gradient */}
        <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-emerald-900 opacity-90" />
        
        {/* Animated orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute rounded-full top-20 right-20 w-96 h-96 bg-emerald-500 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute rounded-full bottom-20 left-20 w-80 h-80 bg-emerald-400 blur-3xl"
        />

        <div className="relative z-10 max-w-6xl px-6 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="mb-6 font-black tracking-tighter text-7xl md:text-9xl">
              <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">
                GoalTime
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-2xl font-light leading-relaxed text-gray-300 md:text-3xl">
              Where passion meets technology
            </p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute transform -translate-x-1/2 bottom-10 left-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex justify-center w-6 h-10 border-2 rounded-full border-emerald-400"
            >
              <div className="w-1 h-2 mt-2 rounded-full bg-emerald-400" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section - Character by character animation */}
      <section className="relative px-6 py-32">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-5xl font-black text-transparent md:text-7xl bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text"
          >
            Our Story
          </motion.h2>

          <div className="space-y-8 text-xl font-light leading-relaxed text-gray-300 md:text-2xl">
            <p>
              <TypewriterText
                text="GoalTime was born from a school project with a simple idea: football should be easy to organize."
                delay={200}
              />
            </p>
            <p>
              <TypewriterText
                text="No endless group chats. No confusing schedules. Just a clear, intuitive way to book your favorite fields, gather your team, and enjoy the game you love."
                delay={3000}
              />
            </p>
            <p>
              <TypewriterText
                text="Built by passionate developer and football enthusiast Salaheddin, GoalTime blends modern technology with the thrill of competition to simplify every step of your football experience."
                delay={7000}
              />
            </p>
          </div>
        </div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 11 }}
          viewport={{ once: true }}
          className="h-px max-w-5xl mx-auto mt-20 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
        />
      </section>

      {/* Why Players Love Us - Bento Grid Style */}
      <section className="px-6 py-32 bg-gradient-to-b from-black to-emerald-950">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="mb-20 text-5xl font-black text-center text-transparent md:text-7xl bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text"
          >
            Why Players Love Us
          </motion.h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Trophy,
                title: "Smart Stadium Booking",
                desc: "Reserve fields in just a few clicks — no more calling or waiting.",
                gradient: "from-emerald-600 to-teal-600",
              },
              {
                icon: Users,
                title: "Team Management",
                desc: "Invite friends, split payments, and track participation easily.",
                gradient: "from-teal-600 to-cyan-600",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                desc: "All transactions are protected with modern payment gateways.",
                gradient: "from-cyan-600 to-emerald-600",
              },
              {
                icon: Star,
                title: "Ratings & Reviews",
                desc: "Share experiences and discover top-rated fields near you.",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                icon: Zap,
                title: "Real-Time Availability",
                desc: "Sessions update live — never double-book again.",
                gradient: "from-teal-500 to-cyan-500",
              },
              {
                icon: Heart,
                title: "Made by Players",
                desc: "Created by football lovers who know the value of a great match.",
                gradient: "from-cyan-500 to-emerald-500",
              },
            ].map(({ icon: Icon, title, desc, gradient }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative p-8 overflow-hidden border border-gray-800 cursor-pointer group bg-gradient-to-br from-gray-900 to-black rounded-3xl"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white w-7 h-7" />
                  </div>
                  
                  <h3 className="mb-3 text-2xl font-bold text-white transition-colors group-hover:text-emerald-400">
                    {title}
                  </h3>
                  <p className="leading-relaxed text-gray-400">
                    {desc}
                  </p>
                </div>

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 bg-gradient-to-r from-transparent via-white to-transparent group-hover:opacity-10"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section - Full bleed */}
      <section className="relative px-6 py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900" />
        
        {/* Animated pattern */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-full h-full opacity-10"
        >
          <div className="absolute border border-white rounded-full top-1/4 left-1/4 w-96 h-96" />
          <div className="absolute border border-white rounded-full bottom-1/4 right-1/4 w-80 h-80" />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-10 text-5xl font-black text-white md:text-7xl"
          >
            Our Mission
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-2xl italic font-light leading-relaxed md:text-4xl text-emerald-50"
          >
            "To make football more accessible, social, and enjoyable — one match at a time."
          </motion.p>
        </div>
      </section>

      
    </div>
    <Footer />
    </>
  );
};

export default About;