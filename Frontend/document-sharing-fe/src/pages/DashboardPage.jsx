import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
  ChevronDown,
  Share2,
  Download,
  Star,
} from "lucide-react";
import { UploadModal } from "../components/modals/UploadModal";
import { ShareModal } from "../components/modals/ShareModal";
import { FILE_ICONS, PERMISSIONS, FILE_TYPES} from "../constants/fileConstants";
import { getMyDocuments } from "../services/documentService";

export function DashboardPage({ showToast }) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [contentType, setContentType] = useState("ALL");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [pageData, setPageData] = useState(null); 
  const PAGE_SIZE = 6;

    useEffect(() => {
    loadDocuments();
    }, [page]);

    const loadDocuments = async () => {
    try {
        setLoading(true);

        const response = await getMyDocuments(
        page,
        PAGE_SIZE
        );

        setDocuments(response.content);
        setPageData(response);

    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
    };
    const docs = documents;
    const meta = pageData || {
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: PAGE_SIZE,
        first: true,
        last: true,
    };

  const handleSearch = useCallback(() => {
    setLoading(true);
    setPage(0);
    setTimeout(() => setLoading(false), 400);
  }, []);

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";

    if (bytes < 1024)
        return `${bytes} B`;

    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;

        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

  const handleDocumentView = (doc) => {
    navigate(`/documents/${doc.id}`, { state: { doc } });
  };

  const handleShare = (doc) => {
    setShareDoc(doc);
  };

  return (
    <>
      <div className="flex-1 flex flex-col min-h-0">
        {/* Topbar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800/70 flex items-center gap-4 px-6 flex-shrink-0">
          <div className="flex-1 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSearch()
                }
                placeholder="Search documents…"
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={contentType}
                onChange={(e) => {
                  setContentType(e.target.value);
                  setPage(0);
                }}
                className="appearance-none bg-slate-800/60 border border-slate-700/50 rounded-xl pl-3 pr-8 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50 transition-all cursor-pointer"
              >
                {FILE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === "ALL" ? "All Types" : t}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
            </div>
          </div>
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all shadow-md shadow-violet-500/20"
          >
            <Upload size={14} /> Upload
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-950">
          {/* Stats */}
          {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Total Files",
                value: meta?.totalElements || 0,
                color: "text-violet-400",
                bg: "bg-violet-500/10 border-violet-500/20",
              },
              {
                label: "Owned by Me",
                value: 0,
                color: "text-sky-400",
                bg: "bg-sky-500/10 border-sky-500/20",
              },
              {
                label: "Shared With Me",
                value: 0,
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/20",
              },
              {
                label: "Starred",
                value: 0,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
              },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`rounded-xl border p-4 ${bg}`}>
                <div className={`text-2xl font-bold ${color} mb-0.5`}>
                  {value}
                </div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div> */}

          {/* Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
              <h2 className="text-sm font-semibold text-slate-200">
                All Documents
              </h2>
              <span className="text-xs text-slate-500">
                {meta.totalElements} files
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider">
                      <th className="text-left px-5 py-3 font-medium">
                        Name
                      </th>
                      <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                        Size
                      </th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                        Created
                      </th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                        Owner
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Access
                      </th>
                      <th className="text-right px-5 py-3 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {!docs || docs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-16 text-slate-600 text-sm"
                        >
                          No documents match your search.
                        </td>
                      </tr>
                    ) : (
                      docs.map((doc) => {
                        const fi =
                          FILE_ICONS[doc.contentType] ||
                          FILE_ICONS.OTHER;
                        const perm = PERMISSIONS[doc.currentUserPermission];
                        return (
                          <tr
                            key={doc.id}
                            onClick={() => handleDocumentView(doc)}
                            className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${fi.bg}`}
                                >
                                  <fi.icon
                                    size={15}
                                    className={fi.color}
                                  />
                                </div>
                                <span className="text-sm text-slate-200 font-medium truncate max-w-[160px] group-hover:text-white transition-colors">
                                  {doc.originalName}
                                </span>
                                {doc.starred && (
                                  <Star
                                    size={11}
                                    className="text-amber-400 fill-amber-400 flex-shrink-0"
                                  />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 hidden sm:table-cell">
                              <span
                                className={`text-xs font-semibold ${fi.color}`}
                              >
                                {doc.contentType}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-slate-500 hidden md:table-cell">
                              {formatSize(doc.fileSize)}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-slate-500 hidden lg:table-cell">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell truncate max-w-[140px]">
                              {doc.ownerName}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-md border font-medium ${perm.color}`}
                              >
                                {perm.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(doc);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-400/10 transition-all"
                                  title="Share"
                                >
                                  <Share2 size={15} />
                                </button>
                                <button
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"
                                  title="Download"
                                >
                                  <Download size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800/60">
              <span className="text-xs text-slate-500">
                Showing{" "}
                {meta.number * meta.size + 1}–
                {Math.min(
                  (meta.number + 1) * meta.size,
                  meta.totalElements
                )}{" "}
                of {meta.totalElements}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPage((p) => Math.max(0, p - 1))
                  }
                  disabled={meta.number === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={13} /> Previous
                </button>
                <span className="text-xs text-slate-500 px-2">
                  {meta.number + 1} / {meta.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(
                        meta.totalPages - 1,
                        p + 1
                      )
                    )
                  }
                  disabled={
                    meta.number >= meta.totalPages - 1
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          showToast={showToast}
        />
      )}
      {shareDoc && (
        <ShareModal
          doc={shareDoc}
          onClose={() => setShareDoc(null)}
          showToast={showToast}
        />
      )}
    </>
  );
}
