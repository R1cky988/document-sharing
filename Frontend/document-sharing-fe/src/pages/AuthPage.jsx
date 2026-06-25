import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  X,
  FolderOpen,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import {
  loginApi,
  registerApi,
} from "../services/authService";

export function AuthPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [mode, setMode] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    repeat: "",
    name: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (mode === "register") {
      if (!form.name.trim()) e.name = "Full name is required.";
      if (!form.email.trim()) e.email = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Enter a valid email.";
      if (!form.password) e.password = "Password is required.";
      else if (form.password.length < 8)
        e.password = "Password must be at least 8 characters.";
      if (!form.repeat) e.repeat = "Please confirm your password.";
      else if (form.password !== form.repeat)
        e.repeat = "Passwords do not match.";
    } else {
      if (!form.email.trim()) e.email = "Email is required.";
      if (!form.password) e.password = "Password is required.";
    }
    return e;
  };

  const switchToLogin = () => {
    setMode("login");
    setForm({ email: "", password: "", repeat: "", name: "" });
    setErrors({});
    setShowPass(false);
    setShowRepeat(false);
    setRegisterSuccess(false);
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setLoading(true);
    if (mode === "register") {
        try {
            await registerApi({
            email: form.email,
            password: form.password,
            name: form.name,
            });

            setRegisterSuccess(true);

            setTimeout(() => {
            switchToLogin();
            }, 1800);
        } catch (error) {
            setErrors({
            submit:
                error.response?.data ||
                "Registration failed",
            });
        } finally {
            setLoading(false);
        }
    } else {
      try {
        const result = await loginApi({
            email: form.email,
            password: form.password,
        });

        localStorage.setItem(
            "accessToken",
            result.access_token
        );

        localStorage.setItem(
            "refreshToken",
            result.refresh_token
        );

        await login();

        navigate("/dashboard");
        } catch (error) {
            setErrors({
                submit:
                error.response?.data ||
                "Invalid email or password",
            });
        } finally {
            setLoading(false);
        }
    }
  };

  const passwordsMatch =
    mode === "register" &&
    form.repeat.length > 0 &&
    form.password === form.repeat;
  const passwordsMismatch =
    mode === "register" &&
    form.repeat.length > 0 &&
    form.password !== form.repeat;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-slate-900 via-violet-950/40 to-slate-900 p-12 border-r border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center">
            <FolderOpen size={18} className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            FileArchive
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-4">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your documents,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">
              always in control.
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-md">
            Share files with fine-grained permissions, generate secure links, and track who
            accesses what — all in one workspace.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
              <FolderOpen size={15} className="text-white" />
            </div>
            <span className="text-white font-semibold">FileArchive</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-slate-400 text-sm">
              {mode === "login"
                ? "Sign in to your workspace."
                : "Get started with FileArchive today."}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex p-1 bg-slate-800/60 rounded-xl border border-slate-700/60 mb-6">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setErrors({});
                  setForm({
                    email: "",
                    password: "",
                    repeat: "",
                    name: "",
                  });
                  setRegisterSuccess(false);
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === m
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Registration success banner */}
          {registerSuccess && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm mb-5">
              <CheckCircle size={16} className="flex-shrink-0" />
              <span>Account created! Redirecting to sign in…</span>
            </div>
          )}

          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Full Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handle}
                  placeholder="Alex Monroe"
                  className={`w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:bg-slate-800 transition-all ${
                    errors.name
                      ? "border-red-500/60 focus:border-red-500/60"
                      : "border-slate-700/60 focus:border-violet-500/60"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={11} />
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handle}
                placeholder="you@company.com"
                className={`w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:bg-slate-800 transition-all ${
                  errors.email
                    ? "border-red-500/60 focus:border-red-500/60"
                    : "border-slate-700/60 focus:border-violet-500/60"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handle}
                  placeholder="••••••••"
                  className={`w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 pr-10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:bg-slate-800 transition-all ${
                    errors.password
                      ? "border-red-500/60 focus:border-red-500/60"
                      : "border-slate-700/60 focus:border-violet-500/60"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errors.password}
                </p>
              )}
              {mode === "register" &&
                !errors.password &&
                form.password.length > 0 &&
                form.password.length < 8 && (
                  <p className="mt-1.5 text-xs text-amber-400 flex items-center gap-1">
                    <AlertCircle size={11} />
                    At least 8 characters required.
                  </p>
                )}
            </div>

            {mode === "register" && (
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Repeat Password
                </label>
                <div className="relative">
                  <input
                    name="repeat"
                    type={showRepeat ? "text" : "password"}
                    value={form.repeat}
                    onChange={handle}
                    placeholder="••••••••"
                    className={`w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 pr-10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:bg-slate-800 transition-all ${
                      passwordsMismatch || errors.repeat
                        ? "border-red-500/60 focus:border-red-500/60"
                        : passwordsMatch
                        ? "border-emerald-500/50 focus:border-emerald-500/60"
                        : "border-slate-700/60 focus:border-violet-500/60"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {form.repeat.length > 0 &&
                      (passwordsMatch ? (
                        <X size={14} className="text-emerald-400" />
                      ) : (
                        <X size={14} className="text-red-400" />
                      ))}
                    <button
                      type="button"
                      onClick={() => setShowRepeat(!showRepeat)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showRepeat ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {errors.repeat && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={11} />
                    {errors.repeat}
                  </p>
                )}
              </div>
            )}
          </div>

          {mode === "login" && (
            <div className="text-right mt-2">
              <button
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {errors.submit && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {errors.submit}
            </div>
            )}

          <button
            onClick={submit}
            disabled={loading || registerSuccess}
            className="w-full mt-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-60 shadow-lg shadow-violet-500/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === "login" ? "Signing in…" : "Creating account…"}
              </span>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
