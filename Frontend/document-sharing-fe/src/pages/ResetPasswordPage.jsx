import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  X,
  CheckCircle,
  FolderOpen,
  ArrowLeft,
} from "lucide-react";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.password) {
      e.password = "New password is required.";
    } else if (form.password.length < 8) {
      e.password = "Password must be at least 8 characters.";
    }
    if (!form.confirmPassword) {
      e.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    return e;
  };

  const handleReset = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResetSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }, 900);
  };

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword;
  const passwordsMismatch =
    form.confirmPassword.length > 0 &&
    form.password !== form.confirmPassword;

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
            Create a new password
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">
              secure your account.
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-md">
            Choose a strong password to protect your documents and data. Make sure it's at least 8 characters long.
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
              Set New Password
            </h2>
            <p className="text-slate-400 text-sm">
              Enter your new password below.
            </p>
          </div>

          {!resetSuccess ? (
            <>
              <div className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 pr-10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:bg-slate-800 transition-all ${
                        errors.password
                          ? "border-red-500/60 focus:border-red-500/60"
                          : "border-slate-700/60 focus:border-violet-500/60"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle size={11} />
                      {errors.password}
                    </p>
                  )}
                  {!errors.password &&
                    form.password.length > 0 &&
                    form.password.length < 8 && (
                      <p className="mt-1.5 text-xs text-amber-400 flex items-center gap-1">
                        <AlertCircle size={11} />
                        At least 8 characters required.
                      </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 pr-10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:bg-slate-800 transition-all ${
                        passwordsMismatch || errors.confirmPassword
                          ? "border-red-500/60 focus:border-red-500/60"
                          : passwordsMatch
                          ? "border-emerald-500/50 focus:border-emerald-500/60"
                          : "border-slate-700/60 focus:border-violet-500/60"
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {form.confirmPassword.length > 0 &&
                        (passwordsMatch ? (
                          <Check
                            size={14}
                            className="text-emerald-400"
                          />
                        ) : (
                          <X
                            size={14}
                            className="text-red-400"
                          />
                        ))}
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirm(!showConfirm)
                        }
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showConfirm ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle size={11} />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full mt-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-60 shadow-lg shadow-violet-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting password…
                  </span>
                ) : (
                  "Reset Password"
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
                  Password reset successfully!
                </h3>
                <p className="text-slate-400 text-sm">
                  Your password has been updated. You can now sign in with your new password.
                </p>
              </div>
              <div className="mt-6 w-full pt-6 border-t border-slate-800">
                <p className="text-xs text-slate-600 text-center mb-3">
                  Redirecting to login…
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
