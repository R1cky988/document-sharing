import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileImage,
} from "lucide-react";
import { FILE_ICONS, PERMISSIONS } from "../constants/fileConstants";
import { ALL_DOCS } from "../data/mockData";

export function DocumentViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get doc from location state first, then from ALL_DOCS
  const doc = location.state?.doc || ALL_DOCS.find((d) => d.id === parseInt(id));

  if (!doc) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-slate-950">
        <p className="text-slate-400">Document not found</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 text-violet-400 hover:text-violet-300"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const fi = ICONS[doc.contentType] || ICONS.OTHER;
  const perm = PERMISSIONS[doc.permission];

  const renderContent = () => {
    if (doc.contentType === "IMAGE") {
      return (
        <div className="flex items-center justify-center h-96 rounded-xl bg-slate-800/40 border border-slate-700/40">
          <div className="text-center">
            <FileImage size={48} className="text-sky-400/40 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              Image preview would render here
            </p>
            <p className="text-slate-600 text-xs mt-1">{doc.name}</p>
          </div>
        </div>
      );
    }
    if (doc.contentType === "EXCEL") {
      return (
        <div className="rounded-xl border border-slate-700/40 overflow-hidden">
          <div className="bg-slate-800/40 px-4 py-2 border-b border-slate-700/40 flex gap-4">
            {["Sheet1", "Sheet2", "Sheet3"].map((s, i) => (
              <button
                key={s}
                className={`text-xs px-2 py-1 rounded ${
                  i === 0
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-slate-500 hover:text-slate-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-800/60">
                {["A", "B", "C", "D", "E"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-slate-500 font-medium text-center border-r border-slate-700/40 last:border-r-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(6)].map((_, r) => (
                <tr key={r} className="border-t border-slate-700/40 hover:bg-slate-800/20">
                  {[...Array(5)].map((_, c) => (
                    <td
                      key={c}
                      className="px-4 py-2 text-slate-400 border-r border-slate-700/40 last:border-r-0"
                    >
                      {r === 0
                        ? ["Revenue", "Q1", "Q2", "Q3", "Q4"][c]
                        : r === 1
                        ? [
                            "Total",
                            "$42k",
                            "$55k",
                            "$61k",
                            "$78k",
                          ][c]
                        : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <div className="bg-slate-800/20 rounded-xl border border-slate-700/40 p-8 space-y-4">
        <div className="h-3 bg-slate-700/50 rounded-full w-3/4" />
        <div className="h-3 bg-slate-700/50 rounded-full" />
        <div className="h-3 bg-slate-700/50 rounded-full w-5/6" />
        <div className="h-3 bg-slate-700/30 rounded-full w-2/3" />
        <div className="mt-6 h-3 bg-slate-700/50 rounded-full w-4/5" />
        <div className="h-3 bg-slate-700/50 rounded-full w-full" />
        <div className="h-3 bg-slate-700/50 rounded-full w-3/4" />
        <p className="text-slate-500 text-sm mt-6 pt-4 border-t border-slate-700/40 italic">
          {doc.content}
        </p>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
      <header className="h-16 bg-slate-900 border-b border-slate-800/70 flex items-center gap-4 px-6 flex-shrink-0">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="h-5 w-px bg-slate-700/60" />
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${fi.bg}`}>
          <fi.icon size={14} className={fi.color} />
        </div>
        <span className="text-slate-200 font-medium text-sm truncate">
          {doc.name}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-md border font-medium ${perm.color}`}
          >
            {perm.label}
          </span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 text-xs font-medium transition-all">
            <Download size={13} /> Download
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "File Name", value: doc.name },
              { label: "Type", value: doc.contentType },
              { label: "Size", value: doc.size },
              { label: "Created", value: doc.createdAt },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-slate-900 rounded-xl border border-slate-800/60 px-4 py-3"
              >
                <div className="text-xs text-slate-500 mb-0.5">
                  {label}
                </div>
                <div className="text-sm text-slate-200 font-medium truncate">
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Viewer */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800/60 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-200">
                Document Preview
              </h3>
              <span className="text-xs text-slate-600 bg-slate-800 px-2 py-1 rounded-md">
                Read-only
              </span>
            </div>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
