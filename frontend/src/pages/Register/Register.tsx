import React, { useState, useRef, useEffect } from "react";
import InputField from "../../components/InputField";
import api from "../../services/api";
import ArtisticCalendar from "../../components/ArtisticCalendar";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    birthDate: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const { showToast, ToastContainer } = useToast();

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Validation functions ---
  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) ? "" : "Invalid email format";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    if (!/[A-Z]/.test(value)) return "Password must include an uppercase letter";
    if (!/[a-z]/.test(value)) return "Password must include a lowercase letter";
    if (!/[0-9]/.test(value)) return "Password must include a number";
    if (!/[\W_]/.test(value))
      return "Password must include a special character";
    return "";
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return "Please confirm your password";
    if (value !== formData.password) return "Passwords do not match";
    return "";
  };

  const validateUsername = (value: string) => {
    if (!value) return "Username is required";
    if (value.length < 3) return "Username must be at least 3 characters";
    return "";
  };

  const validatePhone = (value: string) => {
    if (!value) return "Phone number is required";
    const pattern = /^\+[0-9]{8,15}$/;
    const pattern2 = /^[0-9]{8,15}$/;
    return pattern.test(value) || pattern2.test(value)
      ? ""
      : "Invalid phone number";
  };

  const validateBirthDate = (value: string) => {
    if (!value) return "Birth date is required";
    return "";
  };

  const handleBlur = (field: string, value: string) => {
    let errorMsg = "";
    switch (field) {
      case "email":
        errorMsg = validateEmail(value);
        break;
      case "password":
        errorMsg = validatePassword(value);
        break;
      case "confirmPassword":
        errorMsg = validateConfirmPassword(value);
        break;
      case "username":
        errorMsg = validateUsername(value);
        break;
      case "phoneNumber":
        errorMsg = validatePhone(value);
        break;
      case "birthDate":
        errorMsg = validateBirthDate(value);
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      username: validateUsername(formData.username),
      birthDate: validateBirthDate(formData.birthDate),
      email: validateEmail(formData.email),
      phoneNumber: validatePhone(formData.phoneNumber),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword),
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((msg) => msg)) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await api.post("/auth/register", formData);
      const token = res.data?.access_token;

      if (token) {
        localStorage.setItem("token", token);
        showToast("Account created successfully!", "success");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Registration failed" , "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen p-2 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/src/assets/test.jpg')" }}
    >
      <ToastContainer />
      <div className="absolute inset-0 bg-black/40 z-0" />
      <div className="relative z-10 flex h-[95vh] w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl bg-white">
        {/* LEFT PANEL */}
        <div
          className="hidden md:flex w-1/2 bg-cover bg-center relative"
          style={{ backgroundImage: "url('/src/assets/panel.png')" }}
        >
          <div className="absolute bottom-4 right-7 w-full text-center text-white text-sm opacity-80 z-10">
            Developed by <span className="font-semibold">Salah & Ines</span>!
          </div>
        </div>

        {/* RIGHT PANEL (Register Form) */}
        <div
          className="w-full md:w-3/5 flex flex-col justify-center items-center bg-cover bg-center relative"
          style={{
            backgroundImage: "url('/src/assets/maradona.png')",
          }}
        >
          <form
            onSubmit={handleRegister}
            className="bg-white p-6 rounded-xl shadow-xl w-11/12 sm:w-[480px] space-y-2 flex flex-col justify-center opacity-90"
            style={{
              maxHeight: "90vh",
              overflow: "hidden",
            }}
          >
            <h2 className="text-3xl font-semibold text-center text-gray-800 mb-4">
              Create your account
            </h2>

            {serverError && (
              <p className="text-red-500 text-center">{serverError}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={() => handleBlur("username", formData.username)}
                placeholder="Your username"
                error={errors.username}
              />

              {/* Birth date field with toggleable ArtisticCalendar */}
              <div className="flex flex-col w-full relative" ref={calendarRef}>
                <label
                  htmlFor="birthDate"
                  className="text-gray-700 text-sm font-medium mb-1"
                >
                  Birth Date
                </label>
                <div
                  onClick={() => setCalendarOpen((prev) => !prev)}
                  className={`relative border rounded-md px-3 py-2 pr-10 text-sm cursor-pointer focus:outline-none transition-all ${
                    errors.birthDate
                      ? "border-red-500 focus:ring-2 focus:ring-red-400"
                      : "border-gray-300 focus:ring-2 focus:ring-green-500"
                  }`}
                >
                  <input
                    readOnly
                    type="text"
                    value={formData.birthDate || ""}
                    placeholder="YYYY-MM-DD"
                    className="w-full bg-transparent outline-none cursor-pointer text-gray-800"
                  />
                  <Calendar
                    className="absolute right-3 top-2.5 text-green-600 opacity-70 pointer-events-none"
                    size={18}
                  />
                </div>

                {calendarOpen && (
                  <div className="absolute top-[100%] right-0 mt-2 w-64 z-50">
                    <ArtisticCalendar
                      valueISO={
                        formData.birthDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      onChange={(iso) => {
                        setFormData({ ...formData, birthDate: iso });
                        setCalendarOpen(false);
                        handleBlur("birthDate", iso);
                      }}
                      disablePastDates={false}
                    />
                  </div>
                )}

                {errors.birthDate && (
                  <span className="text-red-500 text-xs mt-0.5 animate-fade-in">
                    {errors.birthDate}
                  </span>
                )}
              </div>

              <InputField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email", formData.email)}
                placeholder="you@example.com"
                error={errors.email}
              />

              <InputField
                label="Phone Number"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={() => handleBlur("phoneNumber", formData.phoneNumber)}
                placeholder="+33xxxxxxxxx"
                error={errors.phoneNumber}
              />
            </div>

            {/* Password fields */}
            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur("password", formData.password)}
              placeholder="********"
              error={errors.password}
            />

            <InputField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() =>
                handleBlur("confirmPassword", formData.confirmPassword)
              }
              placeholder="********"
              error={errors.confirmPassword}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-all duration-200 shadow-md"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            <p className="text-sm text-gray-600 text-center">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-green-600 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
