import { CheckCircle, AlertCircle, X } from "lucide-react";

export function Toast({ message, type = "success", onClose }) {
  const styles =
    type === "success"
      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
      : "bg-red-500/20 border-red-500/40 text-red-300";

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md ${styles} shadow-2xl animate-in`}
    >
      {type === "success" ? (
        <CheckCircle size={16} />
      ) : (
        <AlertCircle size={16} />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-60 hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}
