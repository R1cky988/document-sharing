import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getDocument,
  getDocumentContent,
  formatSize,
  downloadDocument,
  getSharedDocumentContent // Import hàm mới
} from "../services/documentService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Download } from "lucide-react";
import { FILE_ICONS, PERMISSIONS, getFileType } from "../constants/fileConstants";

export function DocumentViewerPage({ isPublicShare = false }) { // Nhận prop để biết là link public
  const navigate = useNavigate();
  const { slug, token } = useParams(); // Lấy token từ URL mới
  const id = slug ? slug.split("-").pop() : null;

  const [doc, setDoc] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);

        if (isPublicShare && token) {
          const { blob, contentType, fileName } = await getSharedDocumentContent(token);
          
          const mockMetadata = {
            id: token,
            originalName: fileName,
            contentType: contentType,
            fileSize: blob.size,
            createdAt: new Date().toISOString(), 
            currentUserPermission: "VIEW" 
          };
          
          setDoc(mockMetadata);

          if (contentType === "text/markdown") {
            const text = await blob.text();
            setMarkdown(text);
          } else {
            setFileUrl(URL.createObjectURL(blob));
          }

        } else if (id) {
          const metadata = await getDocument(id);
          setDoc(metadata);

          const { blob } = await getDocumentContent(id);
          if (metadata.contentType === "text/markdown") {
            const text = await blob.text();
            setMarkdown(text);
          } else {
            setFileUrl(URL.createObjectURL(blob));
          }
        }
      } catch (err) {
        console.error("Lỗi tải tài liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id, token, isPublicShare]);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const handleDownload = async (e, docId, fallbackFileName = "download") => {
    e.stopPropagation();
    try {
      let downloadUrl = fileUrl;
      let fileName = fallbackFileName;

      if (fileUrl) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await downloadDocument(docId);
        const blob = new Blob([response.data], { type: response.headers["content-type"] });
        downloadUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error("Download failed:", error);
      alert("Không thể tải tập tin xuống.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950 text-slate-400">
        Loading...
      </div>
    );
  }

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

  const fi = FILE_ICONS[getFileType(doc.contentType)] || FILE_ICONS.OTHER;
  const perm = PERMISSIONS[doc.currentUserPermission] || { label: "Guest", color: "text-slate-400 border-slate-700" };

  const renderContent = () => {
    if (doc.contentType === "text/markdown") {
      return (
        <article className="text-white whitespace-pre-wrap prose prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </article>
      );
    }
    if (!fileUrl) {
      return (
        <div className="flex text-white justify-center items-center h-96">
          Loading preview...
        </div>
      );
    }

    if (doc.contentType.startsWith("image/")) {
      return (
        <img
          src={fileUrl}
          alt={doc.originalName}
          className="max-h-[700px] mx-auto rounded-xl"
        />
      );
    }

    if (doc.contentType === "application/pdf") {
      return (
        <iframe
          src={fileUrl}
          title={doc.originalName}
          className="w-full h-[800px] rounded-xl"
        />
      );
    }

    if (doc.contentType === "text/plain") {
      return (
        <iframe
          src={fileUrl}
          title={doc.originalName}
          className="w-full h-[700px] bg-white"
        />
      );
    }

    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Preview is not supported.</p>
        <button
          onClick={(e) => handleDownload(e, doc.id, doc.originalName)}
          className="mt-4 inline-flex px-4 py-2 bg-violet-600 rounded-xl text-white"
        >
          Download
        </button>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
      <header className="h-16 bg-slate-900 border-b border-slate-800/70 flex items-center gap-4 px-6 flex-shrink-0">
        {/* Chỉ hiện nút Back khi không phải là khách truy cập qua link public */}
        {!isPublicShare && (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div className="h-5 w-px bg-slate-700/60" />
          </>
        )}
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${fi.bg}`}>
          <fi.icon size={14} className={fi.color} />
        </div>
        <span className="text-slate-200 font-medium text-sm truncate">
          {doc.originalName}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${perm.color}`}>
            {perm.label}
          </span>
          <button
            onClick={(e) => handleDownload(e, doc.id, doc.originalName)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 text-xs font-medium transition-all"
          >
            <Download size={13} /> Download
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "File Name", value: doc.originalName },
              { label: "Type", value: doc.contentType },
              { label: "Size", value: formatSize(doc.fileSize) },
              { label: "Created", value: new Date(doc.createdAt).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-900 rounded-xl border border-slate-800/60 px-4 py-3">
                <div className="text-xs text-slate-500 mb-0.5">{label}</div>
                <div className="text-sm text-slate-200 font-medium truncate">{value}</div>
              </div>
            ))}
          </div>

          {/* Viewer */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800/60 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-200">Document Preview</h3>
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