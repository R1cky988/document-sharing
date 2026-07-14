import { useState, useCallback, useEffect } from "react";
import { slugify } from "../utils/slug";
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
  StarOff,
  Trash2
} from "lucide-react";
import { UploadModal } from "../components/modals/UploadModal";
import { ShareModal } from "../components/modals/ShareModal";
import { DeleteModal } from "../components/modals/DeleteModal";
import {
  FILE_ICONS,
  PERMISSIONS,
  FILE_TYPES,
  getFileType,
  getFileLabel,
} from "../constants/fileConstants";
import { getMyDocuments, formatSize, toggleStar, deleteDocument, removeMyPermission, downloadDocument  } from "../services/documentService";

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
  const [deleteDoc, setDeleteDoc] = useState(null);
  const PAGE_SIZE = 8;

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

    const handleDeleteClick = (e, doc) => {
      e.stopPropagation();
      setDeleteDoc(doc);
    };
    
  const handleDownload = async (e, docId, fallbackFileName = "download") => {
    e.stopPropagation(); 
    
    try {
      const response = await downloadDocument(docId);
      
      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      let fileName = fallbackFileName;
      const disposition = response.headers["content-disposition"];
      if (disposition && disposition.includes("filename=")) {
        fileName = disposition
          .split("filename=")[1]
          .replace(/['"]/g, ""); 
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      console.error("Download failed:", error);
      alert("Không thể tải tập tin xuống.");
    }
  };

  const handleRemoveFromList = async (doc) => {
    try {
      await removeMyPermission(doc.id);

      setDocuments(prev => prev.filter(d => d.id !== doc.id));

      showToast("Removed from your list");
      setDeleteDoc(null);
    } catch (err) {
      console.error(err);
      showToast("Failed", "error");
    }
  };

  const handleDeletePermanent = async (doc) => {
    try {
      await deleteDocument(doc.id);

      setDocuments(prev => prev.filter(d => d.id !== doc.id));

      showToast("Deleted permanently");
      setDeleteDoc(null);
    } catch (err) {
      console.error(err);
      showToast("Failed", "error");
    }
  };

  const handleSearch = useCallback(() => {
    setLoading(true);
    setPage(0);
    setTimeout(() => setLoading(false), 400);
  }, []);

  const handleToggleStar = async (e, doc) => {
      e.stopPropagation();

      try {
          await toggleStar(doc.id);

          setDocuments(prev =>
              prev.map(d =>
                  d.id === doc.id
                      ? { ...d, starred: !d.starred }
                      : d
              )
          );
      } catch (err) {
          console.error(err);
      }
  };

  const handleDocumentView = (doc) => {
    console.log(doc);
    
    navigate(`/documents/${slugify(doc.originalName)}-${doc.id}`);
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
                        const fi = FILE_ICONS[getFileType(doc.contentType)];
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
                                {getFileLabel(doc.contentType)}
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
                              <div className="flex items-center justify-end gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => handleToggleStar(e, doc)}
                                    className={`p-1.5 rounded-lg transition-all
                                        ${
                                            doc.starred
                                                ? "text-yellow-400 hover:bg-yellow-400/10"
                                                : "text-slate-500 hover:text-yellow-400 hover:bg-yellow-400/10"
                                        }`}
                                    title={doc.starred ? "Unstar" : "Star"}
                                >
                                    <Star
                                        size={15}
                                        fill={doc.starred ? "currentColor" : "none"}
                                    />
                                </button>
                                  {doc.currentUserPermission && doc.currentUserPermission.toUpperCase() !== "VIEW" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShareDoc(doc);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-400/10 transition-all"
                                    title="Share"
                                  >
                                    <Share2 size={15} /> 
                                  </button>
                                )}
                                <button
                                  onClick={(e) =>
                                    handleDownload(e, doc.id, doc.name)
                                  }
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"
                                  title="Download"
                                >
                                  <Download size={15} />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteClick(e, doc)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                  title="Delete"
                                >
                                  <Trash2 size={15} />
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
      {deleteDoc && (
        <DeleteModal
          doc={deleteDoc}
          onClose={() => setDeleteDoc(null)}
          onRemove={handleRemoveFromList}
          onDelete={handleDeletePermanent}
        />
      )}
      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          showToast={showToast}
          onSuccess={() => loadDocuments()}
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
