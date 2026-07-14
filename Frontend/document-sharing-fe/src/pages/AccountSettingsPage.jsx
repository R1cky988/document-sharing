import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Plus,
  Trash2,
  User,
  Shield,
  X,
} from "lucide-react";
import { ConfirmDialog } from "../components/modals/ConfirmDialog";
import { AvatarCropModal } from "../components/modals/AvatarCropModal";


export function AccountSettingsPage({ user, showToast }) {
  const { avatarUrl } = useContext(AuthContext);
  const [avatarImage, setAvatarImage] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
  });
  const [passForm, setPassForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passErrors, setPassErrors] = useState({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePass = (e) => {
    const { name, value } = e.target;
    setPassForm((f) => ({ ...f, [name]: value }));
    setPassErrors((err) => ({ ...err, [name]: "" }));
  };

  const validatePassword = () => {
    const e = {};
    if (!passForm.current) e.current = "Current password is required.";
    if (!passForm.next) e.next = "New password is required.";
    else if (passForm.next.length < 8)
      e.next = "Password must be at least 8 characters.";
    if (!passForm.confirm) e.confirm = "Please confirm your new password.";
    else if (passForm.next !== passForm.confirm)
      e.confirm = "Passwords do not match.";
    return e;
  };

  // Profile save flow
  const requestSaveProfile = () => {
    setConfirmDialog({
      key: "profile",
      title: "Save profile changes?",
      message: "Your name, email, and bio will be updated.",
      detail: `Name: ${form.name} · Email: ${form.email}`,
      confirmLabel: "Yes, save changes",
      confirmStyle: "violet",
      icon: User,
    });
  };

  const confirmSaveProfile = () => {
    setConfirmDialog(null);
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Profile updated!");
    }, 700);
  };

  // Password update flow
  const requestUpdatePassword = () => {
    const e = validatePassword();
    if (Object.keys(e).length > 0) {
      setPassErrors(e);
      return;
    }
    setConfirmDialog({
      key: "password",
      title: "Change your password?",
      message:
        "Your current password will be replaced. You'll need the new password next time you sign in.",
      confirmLabel: "Yes, change password",
      confirmStyle: "violet",
      icon: Shield,
    });
  };

  const confirmUpdatePassword = () => {
    setConfirmDialog(null);
    setSavingPass(true);
    setTimeout(() => {
      setSavingPass(false);
      setPassForm({ current: "", next: "", confirm: "" });
      setPassErrors({});
      showToast("Password changed successfully!");
    }, 700);
  };

  // Delete account flow
  const requestDeleteAccount = () => {
    setConfirmDialog({
      key: "delete",
      title: "Delete your account?",
      message:
        "This will permanently erase your account and all documents. This action cannot be undone.",
      confirmLabel: "Yes, delete account",
      confirmStyle: "red",
      icon: Trash2,
    });
  };

  const confirmDeleteAccount = () => {
    setConfirmDialog(null);
    showToast("Account deleted.", "error");
  };

  const handleConfirm = () => {
    if (confirmDialog?.key === "profile") confirmSaveProfile();
    else if (confirmDialog?.key === "password")
      confirmUpdatePassword();
    else if (confirmDialog?.key === "delete")
      confirmDeleteAccount();
  };

  const handleAvatarSave = (croppedImage) => {
    setAvatarImage(croppedImage);
    setShowAvatarModal(false);
    showToast("Avatar updated successfully!");
  };

  const passwordsMatch =
    passForm.confirm.length > 0 && passForm.next === passForm.confirm;
  const passwordsMismatch =
    passForm.confirm.length > 0 && passForm.next !== passForm.confirm;

  return (
    <>
      <div className="flex-1 overflow-auto bg-slate-950 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-lg font-bold text-slate-100">
              Account Settings
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Manage your profile and security preferences.
            </p>
          </div>

          {/* Profile */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800/60 p-6">
            <h2 className="text-sm font-semibold text-slate-200 mb-5">
              Profile
            </h2>

            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                {avatarImage ? (
                    <img
                        src={avatarImage}
                        alt="avatar"
                        className="w-16 h-16 rounded-2xl object-cover"
                    />
                    ) : avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-16 h-16 rounded-2xl object-cover"
                    />
                    ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center text-white text-xl font-bold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {form.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {form.email}
                </p>
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Change avatar
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: "Full Name",
                  name: "name",
                  placeholder: "Your full name",
                },
                {
                  label: "Email",
                  name: "email",
                  placeholder: "you@company.com",
                  type: "email",
                },
              ].map(({
                label,
                name,
                placeholder,
                type = "text",
              }) => (
                <div key={name}>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                    {label}
                  </label>
                  <input
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handle}
                    placeholder={placeholder}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={requestSaveProfile}
              disabled={saving}
              className="mt-6 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all disabled:opacity-60 shadow-md shadow-violet-500/20"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>

          {/* Password */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800/60 p-6">
            <h2 className="text-sm font-semibold text-slate-200 mb-5">
              Change Password
            </h2>
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    name="current"
                    type={showCurrent ? "text" : "password"}
                    value={passForm.current}
                    onChange={handlePass}
                    placeholder="••••••••"
                    className={`w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:bg-slate-800 transition-all ${
                      passErrors.current
                        ? "border-red-500/60 focus:border-red-500/60"
                        : "border-slate-700/50 focus:border-violet-500/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrent(!showCurrent)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showCurrent ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
                {passErrors.current && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={11} />
                    {passErrors.current}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    name="next"
                    type={showNext ? "text" : "password"}
                    value={passForm.next}
                    onChange={handlePass}
                    placeholder="••••••••"
                    className={`w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:bg-slate-800 transition-all ${
                      passErrors.next
                        ? "border-red-500/60 focus:border-red-500/60"
                        : "border-slate-700/50 focus:border-violet-500/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNext(!showNext)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showNext ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
                {passErrors.next && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={11} />
                    {passErrors.next}
                  </p>
                )}
                {!passErrors.next &&
                  passForm.next.length > 0 &&
                  passForm.next.length < 8 && (
                    <p className="mt-1.5 text-xs text-amber-400 flex items-center gap-1">
                      <AlertCircle size={11} />
                      At least 8 characters required.
                    </p>
                  )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    value={passForm.confirm}
                    onChange={handlePass}
                    placeholder="••••••••"
                    className={`w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:bg-slate-800 transition-all ${
                      passwordsMismatch || passErrors.confirm
                        ? "border-red-500/60 focus:border-red-500/60"
                        : passwordsMatch
                        ? "border-emerald-500/50 focus:border-emerald-500/60"
                        : "border-slate-700/50 focus:border-violet-500/50"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {passForm.confirm.length > 0 &&
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
                {passErrors.confirm && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={11} />
                    {passErrors.confirm}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={requestUpdatePassword}
              disabled={savingPass}
              className="mt-6 px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 text-sm font-semibold transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {savingPass ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-300 rounded-full animate-spin" />
                  Updating…
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>

          {/* Delete Account */}
          <div className="bg-slate-900 rounded-2xl border border-red-500/20 p-6">
            <h2 className="text-sm font-semibold text-red-400 mb-1">
              Delete Account
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Permanently delete your account and all associated data.
            </p>
            <button
              onClick={requestDeleteAccount}
              className="px-4 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all flex items-center gap-2"
            >
              <Trash2 size={14} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        config={confirmDialog}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDialog(null)}
      />

      {showAvatarModal && (
        <AvatarCropModal
          onClose={() => setShowAvatarModal(false)}
          onSave={handleAvatarSave}
        />
      )}
    </>
  );
}
