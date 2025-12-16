import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    "/src/assets/stadium1.jpg",
    "/src/assets/stadium2.jpg",
    "/src/assets/stadium3.jpg",
    "/src/assets/stadium4.jpg",
    "/src/assets/stadium5.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      <Navbar />
      {/* 🌗 Background changes depending on theme */}
      <div className="bg-gradient-to-b from-emerald-50 via-white to-gray-50 dark:from-emerald-950 dark:via-black dark:to-emerald-950 text-gray-800 dark:text-emerald-100 transition-colors duration-500">

        {/* Hero Section */}
        <section className="min-h-[85vh] flex items-center justify-center pt-24 px-6 relative overflow-hidden">
          {/* Floating blur shapes */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-20 right-10 w-72 h-72 bg-emerald-300 dark:bg-emerald-700 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.12, 0.08] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute bottom-20 left-10 w-64 h-64 bg-teal-300 dark:bg-teal-700 rounded-full blur-3xl"
          />

          <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
            {/* Text content */}
            <div>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Book Your Stadium.
                  </span>
                  <br />
                  <span className="text-gray-800 dark:text-emerald-100">Live the Passion.</span>
                </h1>

                <p className="text-lg text-gray-600 dark:text-emerald-300 mb-6 leading-relaxed font-light max-w-lg">
                  Discover, reserve, and play in the best football stadiums near you.
                  Fast booking, verified venues, and a community that shares your passion.
                </p>

                <motion.a
                  href="/stadiums"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-full text-base font-semibold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 transition-all"
                >
                  Explore Stadiums →
                </motion.a>
              </motion.div>
            </div>

            {/* Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl shadow-emerald-200 dark:shadow-emerald-900/50">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={currentImage}
                    src={images[currentImage]}
                    alt={`Stadium ${currentImage + 1}`}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-emerald-800/60 hover:bg-white dark:hover:bg-emerald-700/60 p-3 rounded-full shadow-md"
                >
                  <ChevronLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-emerald-800/60 hover:bg-white dark:hover:bg-emerald-700/60 p-3 rounded-full shadow-md"
                >
                  <ChevronRight className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImage
                          ? "bg-white w-6 dark:bg-emerald-400"
                          : "bg-white/50 dark:bg-emerald-600/50 hover:bg-white/75 dark:hover:bg-emerald-500/70"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl -z-10 blur-xl opacity-20 dark:opacity-10" />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Why Choose GoalTime?
              </h2>
              <p className="text-lg text-gray-600 dark:text-emerald-300 max-w-2xl mx-auto font-light">
                We combine technology and passion to make football reservations as exciting as the game itself.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Clock, title: "Fast Reservations", desc: "Reserve your favorite stadium in seconds.", gradient: "from-emerald-500 to-teal-500" },
                { icon: MapPin, title: "Verified Stadiums", desc: "Trusted, secure, and fairly priced venues.", gradient: "from-teal-500 to-cyan-500" },
                { icon: Users, title: "Community", desc: "Connect, play, and share your victories.", gradient: "from-cyan-500 to-emerald-500" },
              ].map(({ icon: Icon, title, desc, gradient }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group relative bg-white dark:bg-emerald-900/40 rounded-3xl p-6 shadow-md border border-emerald-100 dark:border-emerald-800 hover:shadow-xl transition-all"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`} />
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-emerald-100 group-hover:text-emerald-600">
                    {title}
                  </h3>
                  <p className="text-gray-600 dark:text-emerald-300 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 relative overflow-hidden transition-colors duration-500">
          {/* Background that adapts to theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 dark:from-emerald-900 dark:via-emerald-950 dark:to-black" />

          {/* Animated circles */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-full opacity-10"
          >
            <div className="absolute top-1/4 left-1/4 w-80 h-80 border border-white dark:border-emerald-400/30 rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 border border-white dark:border-emerald-400/30 rounded-full" />
          </motion.div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-6 text-white dark:text-emerald-300"
            >
              Ready to Play?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl text-emerald-50 dark:text-emerald-200 mb-8 font-light"
            >
              Join thousands of players booking their matches with GoalTime
            </motion.p>

            <motion.a
              href="/stadiums"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-white text-emerald-600 dark:bg-emerald-700 dark:text-white px-10 py-4 rounded-full text-base font-bold shadow-2xl hover:shadow-emerald-400/30 transition-all"
            >
              Book Your Stadium Now
            </motion.a>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
};

export default Home;
