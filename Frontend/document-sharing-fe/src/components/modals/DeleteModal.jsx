export function DeleteModal({ doc, onClose, onRemove, onDelete }) {
  const isOwner = doc.currentUserPermission === "OWNER";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="relative bg-slate-900 rounded-xl p-6 w-full max-w-sm border border-slate-700">
        <h2 className="text-white font-semibold mb-3">
          Delete Document
        </h2>

        <p className="text-slate-400 text-sm mb-4">
          {doc.originalName}
        </p>

        {/* USER / VIEWER */}
        {!isOwner && (
          <button
            onClick={onRemove}
            className="w-full py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600"
          >
            Remove from my list
          </button>
        )}

        {/* OWNER OPTIONS */}
        {isOwner && (
          <div className="flex flex-col gap-2">
            <button
              onClick={onRemove}
              className="w-full py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600"
            >
              Remove from list
            </button>

            <button
              onClick={onDelete}
              className="w-full py-2 rounded-lg bg-red-600 text-white hover:bg-red-500"
            >
              Delete permanently
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-3 text-slate-400 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}