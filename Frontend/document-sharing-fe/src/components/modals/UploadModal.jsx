import { useState, useRef } from "react";
import { uploadDocument } from "../../services/documentService";
import {
  Upload,
  X,
  FileText,
  FileImage,
  File,
  Sheet,
  Check,
} from "lucide-react";

export function UploadModal({ onClose, showToast, onSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const addFiles = (incoming) => {
    const arr = Array.from(incoming).map((f) => ({
      file: f,
      id: Math.random().toString(36).slice(2),
      progress: 0,
      done: false,
    }));
    setFiles((prev) => [...prev, ...arr]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);

  const removeFile = (id) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const getIcon = (name) => {
    const ext = name.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext))
      return { icon: FileText, color: "text-red-400", bg: "bg-red-400/10" };
    if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext))
      return { icon: FileImage, color: "text-sky-400", bg: "bg-sky-400/10" };
    if (["doc", "docx"].includes(ext))
      return { icon: File, color: "text-blue-400", bg: "bg-blue-400/10" };
    if (["xls", "xlsx", "csv"].includes(ext))
      return { icon: Sheet, color: "text-emerald-400", bg: "bg-emerald-400/10" };
    return { icon: File, color: "text-slate-400", bg: "bg-slate-400/10" };
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const startUpload = async () => {
    if (!files.length) return;

    setUploading(true);

    try {
      for (const f of files) {
        await uploadDocument(f.file);

        setFiles((prev) =>
          prev.map((p) =>
            p.id === f.id
              ? { ...p, progress: 100, done: true }
              : p
          )
        );
      }

      showToast(`${files.length} file(s) uploaded!`);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Upload failed!", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={!uploading ? onClose : undefined}
      />
      <div className="relative bg-slate-900 rounded-2xl border border-slate-700/60 w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
          <div>
            <h3 className="text-slate-100 font-semibold text-sm">Upload Files</h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Drag & drop or browse to select files
            </p>
          </div>
          {!uploading && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Drop Zone */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 h-36 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
              dragging
                ? "border-violet-500 bg-violet-500/10"
                : "border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/40"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                dragging ? "bg-violet-500/20" : "bg-slate-800"
              }`}
            >
              <Upload
                size={18}
                className={dragging ? "text-violet-400" : "text-slate-500"}
              />
            </div>
            <div className="text-center">
              <p
                className={`text-sm font-medium ${
                  dragging ? "text-violet-300" : "text-slate-400"
                }`}
              >
                {dragging ? "Drop files here" : "Click to browse or drag & drop"}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                PDF, Word, Excel, Images — any file type
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {files.map((f) => {
                const fi = getIcon(f.file.name);
                return (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${fi.bg}`}
                    >
                      <fi.icon size={15} className={fi.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-200 font-medium truncate">
                        {f.file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-150 ${
                              f.done ? "bg-emerald-500" : "bg-violet-500"
                            }`}
                            style={{ width: `${f.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {f.done ? (
                            <Check size={11} className="text-emerald-400" />
                          ) : uploading ? (
                            `${f.progress}%`
                          ) : (
                            formatSize(f.file.size)
                          )}
                        </span>
                      </div>
                    </div>
                    {!uploading && (
                      <button
                        onClick={() => removeFile(f.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          {!uploading && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
            >
              Cancel
            </button>
          )}
          <button
            onClick={startUpload}
            disabled={!files.length || uploading}
            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload size={14} />
                Upload{" "}
                {files.length > 0
                  ? `${files.length} file${files.length > 1 ? "s" : ""}`
                  : "Files"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
