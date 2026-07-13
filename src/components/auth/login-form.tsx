"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

// Icons for the UI
import { Zap, Mail, Lock, ShieldCheck } from "lucide-react";

function getFriendlyError(code: string, fallback: string) {
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-not-found":
      return "No account found with that email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a bit and try again.";
    default:
      return fallback;
  }
}

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const userRef = doc(db, "users", credential.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().isAdmin !== true) {
        await auth.signOut();
        setError("You are not authorized to access this application.");
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(getFriendlyError(err.code, err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle top-left yellow glow matching the image background */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#FFD700]/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] bg-[#1a1a1c] border border-zinc-800/80 rounded-[20px] shadow-2xl p-8 md:p-10 z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#FFCC00] p-3.5 rounded-2xl mb-5 shadow-lg shadow-yellow-500/10">
            <Zap className="w-7 h-7 text-black" fill="currentColor" strokeWidth={1} />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-1.5">
            Welcome Back
          </h1>
          <p className="text-[14px] text-zinc-400">
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-[13px] font-medium text-zinc-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-500" />
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-[13px] font-medium text-zinc-300">
                Password
              </label>
              <a href="#" className="text-[13px] font-medium text-[#FFCC00] hover:text-yellow-400 transition-colors">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-500" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-[14px] text-white placeholder:text-zinc-600 tracking-widest focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition-all"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-900/20 p-3 text-[13px] text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#FFCC00] hover:bg-[#e6b800] text-black font-semibold text-[15px] rounded-xl py-3 mt-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Login"}
          </button>

          {/* Create Account Link */}
          <div className="pt-3 flex justify-center">
            <div className="border border-zinc-800/80 rounded-full px-5 py-2.5 text-[13px] text-zinc-400 bg-[#141415]">
              Don't have an account?{" "}
              <a href="#" className="text-[#FFCC00] font-medium ml-1 hover:text-yellow-400 transition-colors">
                Create one
              </a>
            </div>
          </div>
        </form>

        {/* Footer Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-[0.15em] text-zinc-600/80 uppercase">
          <ShieldCheck className="w-[14px] h-[14px]" />
          Enterprise Encrypted Environment
        </div>
      </div>

      {/* Page Footer (Outside Card) */}
      <div className="absolute bottom-6 left-0 right-0 px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-zinc-500 z-10 w-full max-w-[1400px] mx-auto">
        <div>
          <span className="font-bold text-[#FFCC00]">BILLING ERP</span> © {new Date().getFullYear()} Enterprise Billing ERP. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Help Center</a>
        </div>
      </div>
    </div>
  );
}