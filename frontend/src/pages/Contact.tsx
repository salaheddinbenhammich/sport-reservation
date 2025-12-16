import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <>
      <Navbar />
      <div className="relative bg-gradient-to-br from-emerald-950 via-black to-emerald-900 text-white min-h-screen overflow-hidden">
        {/* Animated orbs in background */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 right-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-10 left-10 w-64 h-64 bg-emerald-400 rounded-full blur-3xl"
        />

        {/* Main container */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-28">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
              We’d love to hear from you — whether it’s feedback, questions, or
              collaboration ideas.
            </p>
          </motion.div>

          {/* Info cards - smaller and centered */}
          <div className="flex justify-center mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
              {[
                {
                  icon: Mail,
                  title: "Email",
                  info: "support@goaltime.com",
                  gradient: "from-emerald-600 to-teal-600",
                },
                {
                  icon: Phone,
                  title: "Phone",
                  info: "+33 7 53 82 18 98",
                  gradient: "from-teal-600 to-cyan-600",
                },
                {
                  icon: MapPin,
                  title: "Address",
                  info: "FST Lorraine, Nancy, France",
                  gradient: "from-cyan-600 to-emerald-600",
                },
              ].map(({ icon: Icon, title, info, gradient }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="group relative bg-black/40 border border-gray-800 rounded-2xl p-4 overflow-hidden backdrop-blur-sm text-center w-56 mx-auto"
                >
                  {/* Subtle gradient hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />
                  <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
                    <div
                      className={`w-8 h-8 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-base font-semibold">{title}</h3>
                    <p className="text-gray-400 text-xs">{info}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-black mb-10 text-center bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent"
              >
                Send Us a Message
              </motion.h2>

              <form
                onSubmit={handleSubmit}
                className="bg-black/40 border border-gray-800 rounded-2xl p-8 shadow-xl space-y-5 backdrop-blur-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    className="p-3 bg-transparent border border-gray-700 rounded-lg focus:border-emerald-500 outline-none text-white text-sm text-center"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    required
                    className="p-3 bg-transparent border border-gray-700 rounded-lg focus:border-emerald-500 outline-none text-white text-sm text-center"
                  />
                </div>

                {/* Subject field */}
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  required
                  className="w-full p-3 bg-transparent border border-gray-700 rounded-lg focus:border-emerald-500 outline-none text-white text-sm text-center"
                />

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message..."
                  rows={4}
                  required
                  className="w-full h-52 p-3 bg-transparent border border-gray-700 rounded-lg focus:border-emerald-500 outline-none text-white text-sm resize-none text-center"
                />

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 text-base font-medium rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all"
                >
                  <Send className="w-4 h-4" /> Send Message
                </motion.button>

                {submitted && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-emerald-400 font-medium text-sm mt-3 text-center"
                  >
                    ✅ Your message has been sent! We’ll get back to you soon.
                  </motion.p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
