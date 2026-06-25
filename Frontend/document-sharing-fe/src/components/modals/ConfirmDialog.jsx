export function ConfirmDialog({ config, onConfirm, onCancel }) {
  if (!config) return null;

  const {
    title,
    message,
    confirmLabel = "Yes, save",
    confirmStyle = "violet",
    icon: Icon,
    detail,
  } = config;

  const btnStyles = {
    violet:
      "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-500/20",
    red: "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/20",
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-slate-900 rounded-2xl border border-slate-700/60 w-full max-w-sm shadow-2xl shadow-slate-950/60">
        <div className="p-6">
          {/* Icon */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
              confirmStyle === "red" ? "bg-red-500/15" : "bg-violet-500/15"
            }`}
          >
            {Icon && (
              <Icon
                size={20}
                className={
                  confirmStyle === "red"
                    ? "text-red-400"
                    : "text-violet-400"
                }
              />
            )}
          </div>

          <h3 className="text-slate-100 font-semibold text-base mb-1">
            {title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">{message}</p>

          {detail && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <p className="text-xs text-slate-400">{detail}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-sm font-medium transition-all"
          >
            No, cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${btnStyles[confirmStyle]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
