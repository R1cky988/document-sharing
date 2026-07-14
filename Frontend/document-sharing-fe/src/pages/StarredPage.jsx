import { Star, Share2, Download, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { 
  FILE_ICONS, 
  PERMISSIONS, 
  getFileType, 
  getFileLabel 
} from "../constants/fileConstants";
import { getStarredDocuments, formatSize, toggleStar, deleteDocument, removeMyPermission, downloadDocument  } from "../services/documentService";
import { slugify } from "../utils/slug";
import { ShareModal } from "../components/modals/ShareModal";
import { DeleteModal } from "../components/modals/DeleteModal";

export function StarredPage({ showToast }) {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [shareDoc, setShareDoc] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    loadStarred();
  }, [page]);

  const loadStarred = async () => {
    try {
      setLoading(true);
      const res = await getStarredDocuments(page, PAGE_SIZE);
      setDocuments(res.content);
      setPageData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (e, doc) => {
      e.stopPropagation();
      setDeleteDoc(doc);
    };

  const handleShare = (doc) => {
    setShareDoc(doc);
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

  

  const handleRemoveAccess = async (e, doc) => {
    e.stopPropagation();

    try {
      await removeMyPermission(doc.id);

      setDocuments(prev => prev.filter(d => d.id !== doc.id));

      showToast?.("Removed from your list");
    } catch (err) {
      console.error(err);
      showToast?.("Failed to remove access", "error");
    }
  };

  const handleToggleStar = async (e, doc) => {
    e.stopPropagation();
    try {
      await toggleStar(doc.id);
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      if (showToast) showToast("Removed from starred");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocumentView = (doc) => {
    navigate(`/documents/${slugify(doc.originalName)}-${doc.id}`);
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

  return (
    <>
      <div className="flex-1 overflow-auto bg-slate-950 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Star size={20} className="text-amber-400 fill-amber-400" />
              Starred Documents
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Keep track of your most important files
            </p>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800/60 overflow-hidden">
            {/* Table Header block giống Dashboard */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
              <h2 className="text-sm font-semibold text-slate-200">
                Starred Items
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
                      <th className="text-left px-5 py-3 font-medium">Name</th>
                      <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Type</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Size</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Created</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Owner</th>
                      <th className="text-left px-4 py-3 font-medium">Access</th>
                      <th className="text-right px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/60">
                    {!docs || docs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-slate-600 text-sm">
                          No starred documents yet.
                        </td>
                      </tr>
                    ) : (
                      docs.map((doc) => {
                        // Sử dụng getFileType và getFileLabel đồng bộ giống Dashboard
                        const fi = FILE_ICONS[getFileType(doc.contentType)] || FILE_ICONS.OTHER;
                        const perm = PERMISSIONS[doc.currentUserPermission] || { label: "None", color: "text-slate-400 border-slate-700" };

                        return (
                          <tr
                            key={doc.id}
                            onClick={() => handleDocumentView(doc)}
                            className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                          >
                            {/* Name */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${fi.bg}`}>
                                  <fi.icon size={15} className={fi.color} />
                                </div>
                                <span className="text-sm text-slate-200 font-medium truncate max-w-[160px] group-hover:text-white transition-colors">
                                  {doc.originalName}
                                </span>
                                <Star size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                              </div>
                            </td>

                            {/* Type */}
                            <td className="px-4 py-3.5 hidden sm:table-cell">
                              <span className={`text-xs font-semibold ${fi.color}`}>
                                {getFileLabel(doc.contentType)}
                              </span>
                            </td>

                            {/* Size */}
                            <td className="px-4 py-3.5 text-sm text-slate-500 hidden md:table-cell">
                              {formatSize(doc.fileSize)}
                            </td>

                            {/* Created */}
                            <td className="px-4 py-3.5 text-sm text-slate-500 hidden lg:table-cell">
                              {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "---"}
                            </td>

                            {/* Owner */}
                            <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell truncate max-w-[140px]">
                              {doc.ownerName}
                            </td>

                            {/* Permission */}
                            <td className="px-4 py-3.5">
                              <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${perm.color}`}>
                                {perm.label}
                              </span>
                            </td>

                            {/* Actions (Đồng bộ nút bấm hover từ Dashboard) */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleToggleStar(e, doc)}
                                  className="p-1.5 rounded-lg transition-all text-yellow-400 hover:bg-yellow-400/10"
                                  title="Unstar"
                                >
                                  <Star size={15} fill="currentColor" />
                                </button>
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
                                  onClick={(e) => handleDownload(e, doc.id, doc.name)}
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

            {/* Pagination đồng bộ giao diện gọn gàng của Dashboard */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800/60">
              <span className="text-xs text-slate-500">
                Showing {meta.number * meta.size + 1}–
                {Math.min((meta.number + 1) * meta.size, meta.totalElements)} of {meta.totalElements}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={meta.number === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={13} /> Previous
                </button>
                <span className="text-xs text-slate-500 px-2">
                  {meta.number + 1} / {meta.totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages - 1, p + 1))}
                  disabled={meta.number >= meta.totalPages - 1 || meta.totalPages === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {shareDoc && (
        <ShareModal
          doc={shareDoc}
          onClose={() => setShareDoc(null)}
          showToast={showToast}
        />
      )}
      {deleteDoc && (
        <DeleteModal
          doc={deleteDoc}
          onClose={() => setDeleteDoc(null)}
          onRemove={handleRemoveFromList}
          onDelete={handleDeletePermanent}
        />
      )}
    </>
  );
}