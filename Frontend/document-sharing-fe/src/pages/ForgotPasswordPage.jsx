import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  FolderOpen,
  ArrowLeft,
} from "lucide-react";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email.");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    setError("");
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      // In a real app, this would send an email with a reset link
      // For now, we'll show the success message
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-slate-900 via-violet-950/40 to-slate-900 p-12 border-r border-slate-800/60">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Back to Login</span>
        </button>
        <div className="flex-1 flex flex-col justify-center gap-4">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Forgot your password?
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">
              No worries, we'll help.
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-md">
            Enter your email address and we'll send you a link to reset your password. Check your inbox within the next few minutes.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
              <FolderOpen size={15} className="text-white" />
            </div>
            <span className="text-white font-semibold">FileArchive</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">
              Reset Password
            </h2>
            <p className="text-slate-400 text-sm">
              Enter your email address to receive a reset link.
            </p>
          </div>

          {!submitted ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="you@company.com"
                    className={`w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:bg-slate-800 transition-all ${
                      error
                        ? "border-red-500/60 focus:border-red-500/60"
                        : "border-slate-700/60 focus:border-violet-500/60"
                    }`}
                  />
                  {error && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle size={11} />
                      {error}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-60 shadow-lg shadow-violet-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending reset link…
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  onClick={() => navigate("/login")}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Back to login
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle size={24} className="text-emerald-400" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-100 font-semibold text-base mb-2">
                  Email sent!
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We've sent a password reset link to{" "}
                  <span className="font-medium text-slate-300">{email}</span>.
                </p>
                <p className="text-slate-500 text-xs mt-3">
                  Check your inbox within the next few minutes. If you don't see it, check your spam folder.
                </p>
              </div>
              <div className="mt-6 w-full pt-6 border-t border-slate-800">
                <p className="text-xs text-slate-600 text-center mb-3">
                  Returning to login in a few seconds...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
