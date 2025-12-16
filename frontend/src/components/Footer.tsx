import React from "react";
import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="relative overflow-hidden text-white border-t bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 border-emerald-800/50">
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
      
      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute rounded-full pointer-events-none -top-20 -left-20 w-96 h-96 bg-emerald-500 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute rounded-full pointer-events-none -bottom-20 -right-20 w-80 h-80 bg-emerald-600 blur-3xl"
      />
      
      <div className="relative z-10 px-6 pt-16 pb-8 mx-auto max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-12 mb-12 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-3xl font-black text-transparent bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text">
              GoalTime
            </h3>
            <p className="text-sm leading-relaxed text-emerald-100/80">
              The ultimate football reservation platform — bringing players and stadiums together.
            </p>
            <div className="flex gap-3 pt-2">
              {[
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Twitter, href: "#", label: "Twitter" },
              ].map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-10 h-10 transition-all border rounded-full bg-emerald-800/50 border-emerald-700/50 hover:border-emerald-500 hover:bg-emerald-700/50 group"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4 transition-colors text-emerald-300 group-hover:text-emerald-400" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="mb-6 text-lg font-bold text-emerald-300">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: "Find Stadiums", to: "/stadiums" },
                { label: "My Reservations", to: "/reservations" },
                { label: "About Us", to: "/about" },
                { label: "Contact", to: "/contact" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="flex items-center gap-2 text-sm transition-colors text-emerald-100/70 hover:text-emerald-400 group"
                  >
                    <span className="w-0 h-px transition-all duration-300 bg-emerald-400 group-hover:w-4" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h4 className="mb-6 text-lg font-bold text-emerald-300">Contact</h4>
            <ul className="space-y-4">

              {/* Mail contact */}
              <li className="flex items-start gap-3 text-sm text-emerald-100/70">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 border rounded-lg bg-emerald-800/50 border-emerald-700/50">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                <a
                  href="mailto:support@goaltime.com"
                  className="mt-1 transition-colors text-emerald-100/70 hover:text-emerald-400"
                >
                  support@goaltime.com
                </a>
              </li>

              {/* Phone contact */}
              <li className="flex items-start gap-3 text-sm text-emerald-100/70">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 border rounded-lg bg-emerald-800/50 border-emerald-700/50">
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="mt-1">+33 7 53 82 18 98</span>
              </li>

              {/* Location */}
              <li className="flex items-start gap-3 text-sm text-emerald-100/70">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 border rounded-lg bg-emerald-800/50 border-emerald-700/50">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <a
                  href="https://www.google.com/maps/place/Faculty+of+Science+and+Technology/@48.6651253,6.1585498,483m/data=!3m3!1e3!4b1!5s0x4794a2779d8b709b:0x1a2cb139e2eb0c2f!4m6!3m5!1s0x4794a2777ca326cd:0x6a1a9d235b3c7d72!8m2!3d48.6651218!4d6.1611247!16s%2Fg%2F1tdbvpgn?entry=ttu&g_ep=EgoyMDI1MTAyOS4yIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 transition-colors text-emerald-100/70 hover:text-emerald-400"
                >
                  FST Lorraine, Nancy, France
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants}>
            <h4 className="mb-6 text-lg font-bold text-emerald-300">Stay Updated</h4>
            <p className="mb-4 text-sm text-emerald-100/70">
              Get the latest updates on new stadiums and features.
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-emerald-300/50 focus:outline-none focus:border-emerald-500 focus:bg-emerald-900/50 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl text-sm font-semibold text-white hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-900/50"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="h-px mb-8 bg-gradient-to-r from-transparent via-emerald-700/50 to-transparent" />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center justify-between gap-4 text-sm md:flex-row text-emerald-100/60"
        >
          <p>© {new Date().getFullYear()} GoalTime. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-emerald-400">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-emerald-400">
              Terms of Service
            </a>
          </div>

          <p className="text-emerald-200/50">
            Developed by <span className="font-semibold text-emerald-400">Salaheddin</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;