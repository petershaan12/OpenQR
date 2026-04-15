import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, QrCode, AlertCircle, Loader2 } from "lucide-react";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If we have a user in localStorage, we can redirect or check session
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Point this to your PHP Backend URL
      const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";

      const response = await fetch(`${API_URL}?path=/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Invalid email or password");
      }

      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base-200 p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <QrCode className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-base-content">
              Army<span className="text-primary">QR</span>Code
            </h1>
            <p className="text-base-content/50 text-sm mt-1">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-primary rounded-xl text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-base-content/70 mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10"
                  strokeWidth={2}
                />
                <input
                  name="email"
                  type="email"
                  className="input input-bordered w-full pl-11"
                  placeholder="admin@armysecurity.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-base-content/70 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10"
                  strokeWidth={2}
                />
                <input
                  name="password"
                  type="password"
                  className="input input-bordered w-full pl-11"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-army w-full justify-center py-6 text-base disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
