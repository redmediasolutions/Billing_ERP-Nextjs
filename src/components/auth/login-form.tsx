"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";
import { apiRequest } from "@/lib/api";

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

      console.log("Firebase login successful:", credential.user.uid);

      // Calls your Express API.
      // Express validates the Firebase token and checks users.firebase_uid in MariaDB.
      await apiRequest("/auth/login", {
        method: "POST",
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);

      await auth.signOut();

      setError(
        getFriendlyError(
          err.code,
          err.message || "Unable to sign in. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <div className="login-mark">
            <Zap fill="currentColor" strokeWidth={1} />
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue to your dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="login-form">

          {/* Email Field */}
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              Email Address
            </label>
            <div className="login-input-wrap">
              <Mail className="login-input-icon" />
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="login-field">
            <div className="login-field-row">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <a href="#" className="login-link">
                Forgot?
              </a>
            </div>
            <div className="login-input-wrap">
              <Lock className="login-input-icon" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="login-submit"
          >
            {loading ? "Signing In..." : "Login"}
          </button>

          {/* Create Account Link */}
          <div>
            <p className="login-signup">
              Don't have an account?{" "}
              <a href="#" className="login-link">
                Create one
              </a>
            </p>
          </div>
        </form>

        {/* Footer Security Badge */}
        <div className="login-security">
          <ShieldCheck size={14} />
          Enterprise Encrypted Environment
        </div>
      </div>

      {/* Page Footer (Outside Card) */}
      <div className="login-footer">
        <div>
          <strong>BILLING ERP</strong> © {new Date().getFullYear()} Enterprise Billing ERP. All rights reserved.
        </div>
        <div className="login-footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Help Center</a>
        </div>
      </div>
    </div>
  );
}
