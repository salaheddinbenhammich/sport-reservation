import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "../../hooks/useToast";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

// load stripe public key from env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

// base style configuration for stripe input elements
const stripeElementOptions: any = {
  style: {
    base: {
      color: "#fff",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "16px",
      letterSpacing: "0.03em",
      "::placeholder": { color: "rgba(255,255,255,0.7)" },
    },
    invalid: { color: "#ff6b6b" },
  },
};

// defines the color theme and logo for each card brand
function getBrandTheme(brand: string) {
  switch (brand) {
    case "visa":
      return {
        front: "linear-gradient(160deg, #0a2a88, #1f4ed2, #4d82ff)",
        back: "linear-gradient(160deg, #0b256f, #1b45b9, #3b6deb)",
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg",
      };
    case "mastercard":
      return {
        front: "linear-gradient(160deg, #1d1d1d, #2a2a2a, #3a3a3a)",
        back: "linear-gradient(160deg, #111111, #232323, #363636)",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
      };
    case "amex":
      return {
        front: "linear-gradient(160deg, #007a87, #119da4, #1ecfd5)",
        back: "linear-gradient(160deg, #066a75, #108b93, #18b7bd)",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg",
      };
    default:
      return {
        front: "linear-gradient(160deg, #0f2027, #203a43, #2c5364)",
        back: "linear-gradient(160deg, #1c1c1c, #2c5364)",
        logo: "",
      };
  }
}

// expected structure of backend intent response
type IntentResponse =
  | { clientSecret?: string; amount?: number }
  | {
      type: "split";
      intents: Record<string, { clientSecret: string; amount: number }>;
      totalAmount?: number;
    };

// component that handles the interactive payment card and stripe payment logic
const InteractiveCardForm: React.FC<{ reservationId: string }> = ({
  reservationId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  // user authentication context
  const { user, loading } = useAuth();

  // ui and stripe state variables
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast, ToastContainer } = useToast();

  // visual state for the animated card
  const [isFlipped, setIsFlipped] = useState(false);
  const [brand, setBrand] = useState<string>("unknown");
  const [cardHolder, setCardHolder] = useState<string>("");
  const [expiryComplete, setExpiryComplete] = useState(false);
  const [cvcComplete, setCvcComplete] = useState(false);
  const [autoFlipped, setAutoFlipped] = useState(false);

  // fetch payment intent when component loads
  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const res = (await api.post(
          `/payments/create-intent/${reservationId}`
        )) as { data: IntentResponse };

        const data = res.data;
        if ("clientSecret" in data && data.clientSecret) {
          setClientSecret(data.clientSecret);
          setAmount(data.amount ?? null);
        } else if ((data as any).type === "split") {
          const current = Object.values((data as any).intents || {})[0];
          if (current) {
            setClientSecret(current.clientSecret);
            setAmount(current.amount);
          }
        }
      } catch (err) {
        console.error(err);
        setStatus("error initializing payment.");
      }
    };
    fetchIntent();
  }, [reservationId]);

  // detect card brand in real time
  const onCardNumberChange = (ev: any) => setBrand(ev.brand || "unknown");
  const onExpiryChange = (ev: any) => setExpiryComplete(!!ev.complete);
  const onCvcChange = (ev: any) => {
    setCvcComplete(!!ev.complete);
    if (ev.complete) setTimeout(() => setIsFlipped(false), 300);
  };

  // automatically flip card animation when input is complete
  useEffect(() => {
    if (!autoFlipped && expiryComplete && cardHolder.trim().length > 0) {
      setTimeout(() => {
        setIsFlipped(true);
        setAutoFlipped(true);
      }, 400);
    }
  }, [expiryComplete, cardHolder, autoFlipped]);

  // handle payment submission
  const handlePay = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setIsProcessing(true);
    setStatus("");

    const cardNumberElement = elements.getElement(CardNumberElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardNumberElement!,
            billing_details: { name: cardHolder || undefined },
          },
        }
      );

      if (error) {
        showToast("payment failed: " + error.message, "error");
      } else if (paymentIntent?.status === "succeeded") {
        await api.post(`/payments/confirm/${reservationId}`);
        showToast("payment successful!", "success");
        setTimeout(() => navigate("/reservations"), 1800);
      }
    } catch (err: any) {
      console.error(err);
      showToast("unexpected error.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const theme = getBrandTheme(brand);
  const cvcOptions = {
    ...stripeElementOptions,
    style: {
      ...stripeElementOptions.style,
      base: { color: "#000", "::placeholder": { color: "rgba(0,0,0,0.6)" } },
    },
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-24 mb-8">
      {/* toast notifications */}
      <ToastContainer />

      {/* page header */}
      <h2 className="text-3xl font-bold text-center text-emerald-700 dark:text-emerald-300 mb-4">
        secure payment
      </h2>

      <div className="flex flex-col items-center gap-6">
        {/* animated credit card */}
        <div className="relative [perspective:1400px]">
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-[420px] h-[260px] relative"
            onClick={(e) => {
              const tag = (e.target as HTMLElement).tagName.toLowerCase();
              if (!["input", "iframe"].includes(tag)) setIsFlipped(!isFlipped);
            }}
          >
            {/* card front side */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
              style={{
                backfaceVisibility: "hidden",
                background: theme.front,
              }}
            >
              <div className="w-full h-full p-6 flex flex-col justify-between text-white relative">
                {/* header row: logos */}
                <div className="flex justify-between items-start">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Logo_GIE_CB_%282024%29.svg/1200px-Logo_GIE_CB_%282024%29.svg.png"
                    alt="CB Logo"
                    className="w-14 drop-shadow-lg opacity-95"
                  />
                  {theme.logo && (
                    <motion.img
                      key={theme.logo}
                      src={theme.logo}
                      alt="brand"
                      className="w-14 drop-shadow-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </div>

                {/* card chip */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="relative w-16 h-11 rounded-md overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-600" />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent opacity-30" />
                  </div>
                </div>

                {/* card number input */}
                <div className="text-2xl tracking-widest font-mono mt-4">
                  <CardNumberElement
                    options={{
                      ...stripeElementOptions,
                      placeholder: "•••• •••• •••• ••••",
                    }}
                    onChange={onCardNumberChange}
                  />
                </div>

                {/* footer of card front */}
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <div className="text-[11px] uppercase opacity-70">
                      card holder
                    </div>
                    <input
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="full name"
                      className="bg-transparent border-none outline-none text-sm font-semibold placeholder-white/70"
                      style={{ color: "white", letterSpacing: "0.5px" }}
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-[11px] uppercase opacity-70 text-center">
                      expires
                    </div>
                    <div className="font-semibold w-20 text-center">
                      <CardExpiryElement
                        options={{
                          ...stripeElementOptions,
                          placeholder: "MM / YY",
                        }}
                        onChange={onExpiryChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* card back side */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                background: theme.back,
              }}
            >
              <div className="w-full h-full p-6 flex flex-col text-white">
                <div className="h-10 bg-black rounded-sm mt-4" />
                <div className="mt-8 bg-gray-200 rounded-md p-2 flex justify-end items-center">
                  <div className="w-24 bg-white rounded-md px-2 py-1 text-black text-right">
                    <CardCvcElement options={cvcOptions} onChange={onCvcChange} />
                  </div>
                </div>
                <div className="text-right text-[10px] opacity-70 mt-auto">
                  goaltime secure • emv certified
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* payment form section */}
        <form
          onSubmit={handlePay}
          className="w-96 max-w-md bg-white dark:bg-emerald-900/40 rounded-3xl shadow-lg border border-emerald-200 dark:border-emerald-800 p-6 mt-2 transition-colors duration-500"
        >
          {/* display total amount */}
          {amount !== null && (
            <div className="text-center text-gray-600 dark:text-emerald-100 mb-4">
              <span className="text-lg">amount to pay: </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xl">
                {amount} €
              </span>
            </div>
          )}

          {/* pay now button */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-3 rounded-2xl font-semibold text-lg transition"
            disabled={isProcessing || !clientSecret}
          >
            {isProcessing ? "processing..." : "pay now"}
          </button>
        </form>
      </div>
    </div>
  );
};

// main payment page wrapper
const PaymentPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate(`/login?redirect=/payment/${reservationId}`);
    }
  }, [user, loading, navigate, reservationId]);

  // optionally show nothing while auth context is loading
  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-950 transition-colors duration-500">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        {reservationId ? (
          <Elements stripe={stripePromise}>
            <InteractiveCardForm reservationId={reservationId} />
          </Elements>
        ) : (
          <p className="text-center text-gray-600 dark:text-emerald-200">
            no reservation selected.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PaymentPage;
