"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { Store, MapPin, Clock, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import toast from "react-hot-toast";

export default function ShopRegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const [name, setName] = useState("");
  const [location, setLocation] = useState("Campus Main Building");
  const [workingHours, setWorkingHours] = useState("9:00 AM - 6:00 PM");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // If user is already a shopkeeper, redirect them
  if (status === "authenticated" && (session?.user as any)?.role === "shopkeeper") {
    router.replace("/shop/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/shops/register", {
        name,
        location,
        working_hours: workingHours,
      });
      toast.success("Registration submitted successfully!");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to register shop.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600 mb-4 shadow-lg">
              <Store className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Partner with Us</h1>
            <p className="text-slate-500">
              Open a print shop on Queueless and start receiving automated print jobs directly from campus students.
            </p>
          </div>

          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Under Review</h2>
              <p className="text-slate-500 mb-6">
                Thank you, {session?.user?.name || "Student"}. Your application to open "{name}" has been received and is currently marked as <span className="font-semibold text-amber-600">Pending</span>. An admin will review it shortly.
              </p>
              <button
                onClick={() => router.push("/")}
                className="mx-auto flex items-center justify-center gap-2 text-primary font-medium hover:underline"
              >
                Return to Dashboard <ArrowRight size={16} />
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Shop Name
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                    placeholder="e.g. Library Print Center"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                    placeholder="e.g. Block A, Ground Floor"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Working Hours
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                    placeholder="e.g. 9:00 AM - 6:00 PM"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                disabled={loading || !name.trim()}
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-md shadow-purple-500/20"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                ) : (
                  "Submit Registration"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}
