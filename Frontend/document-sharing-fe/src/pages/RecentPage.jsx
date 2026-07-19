import { useEffect, useState } from "react";
import { Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
// Import đầy đủ các hàm cần thiết từ fileConstants của bạn
import { FILE_ICONS, getFileType, getFileLabel } from "../constants/fileConstants"; 
import { useNavigate } from "react-router-dom";
import { getRecentViewedDocuments } from "../services/userService";

export function RecentPage() {
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const pageSize = 15;

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getRecentViewedDocuments(page, pageSize);
        setDocuments(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || "Đã xảy ra lỗi hệ thống.";
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentDocuments();
  }, [page]);

  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Clock size={20} className="text-blue-400" />
            Recent Documents
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Recently accessed documents từ hệ thống
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800/60 overflow-hidden">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <span className="text-sm">Đang tải tài liệu...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400 text-sm px-4">{error}</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">
              Bạn chưa xem tài liệu nào gần đây.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800/60">
                      <th className="text-left px-5 py-3 font-medium">Name</th>
                      <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Type</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Viewed At</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Owner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {documents.map((doc) => {
                      const fileTypeKey = getFileType(doc.contentType || "");
                      
                      const fi = FILE_ICONS[fileTypeKey] || FILE_ICONS.OTHER;

                      return (
                        <tr
                          key={doc.documentId}
                          onClick={() =>
                            navigate(`/documents/${doc.documentId}`, {
                              state: { doc },
                            })
                          }
                          className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${fi.bg}`}>
                                <fi.icon size={15} className={fi.color} />
                              </div>
                              <span className="text-sm text-slate-200 font-medium truncate group-hover:text-white transition-colors max-w-xs sm:max-w-md">
                                {doc.originalName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden sm:table-cell">
                            <span className={`text-xs font-semibold ${fi.color}`}>
                              {getFileLabel(doc.contentType || "")}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-slate-500 hidden md:table-cell">
                            {new Date(doc.viewedAt).toLocaleString("vi-VN")}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell truncate max-w-[140px]">
                            {doc.ownerName || "Hệ thống"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-5 py-4 border-t border-slate-800/60 flex items-center justify-between bg-slate-900/50">
                  <span className="text-xs text-slate-500">
                    Trang <strong className="text-slate-300">{page + 1}</strong> trên <strong className="text-slate-300">{totalPages}</strong>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                      disabled={page === 0}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                      disabled={page === totalPages - 1}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}