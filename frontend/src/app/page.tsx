"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Loader2, Printer, User, Store } from "lucide-react";
import { motion } from "framer-motion";

export default function RootLoginRedirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role;
      if (role === "admin") {
        router.replace("/admin/dashboard");
      } else if (role === "shopkeeper") {
        router.replace("/shop/dashboard");
      } else {
        router.replace("/student/dashboard");
      }
    }
  }, [session, status, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  const handleDemoLogin = async (type: "admin" | "shopkeeper") => {
    setDemoLoading(true);
    await signIn("credentials", {
      username: type === "admin" ? "admin@queueless.com" : "shopkeeper@queueless.com",
      password: type === "admin" ? "admin123" : "shop123",
      callbackUrl: "/"
    });
  };

  // If we are evaluating the session or if we are already authenticated (meaning redirect relies on useEffect), show a loader
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-400 font-medium animate-pulse">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl shadow-black/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg shadow-blue-500/20 relative">
              <Printer className="w-8 h-8 text-white absolute" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Queueless</h1>
            <p className="text-gray-400 text-sm">Smart Queue Management System</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading || demoLoading}
              className="w-full relative group overflow-hidden bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 disabled:opacity-50 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center gap-4"
            >
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Continue as Student</p>
                <p className="text-xs text-gray-400">Upload & track documents</p>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent group-hover:via-blue-400 transition-colors" />
            </button>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading || demoLoading}
              className="w-full relative group overflow-hidden bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 disabled:opacity-50 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center gap-4"
            >
              <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Continue as Shopkeeper</p>
                <p className="text-xs text-gray-400">Manage incoming print jobs</p>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent group-hover:via-purple-400 transition-colors" />
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-center text-gray-500 mb-4 uppercase tracking-wider font-semibold">Demo Credentials</p>
            <div className="flex gap-2 justify-center">
               <button 
                  onClick={() => handleDemoLogin("admin")}
                  disabled={demoLoading || loading}
                  className="text-xs text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Login as Admin
               </button>
               <button 
                  onClick={() => handleDemoLogin("shopkeeper")}
                  disabled={demoLoading || loading}
                  className="text-xs text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Login as Shopkeeper
               </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
