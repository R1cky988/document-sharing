import { useState, useEffect } from "react";
import {
  X,
  Mail,
  Link2,
  Lock,
  Unlock,
  ChevronDown,
  Plus,
  Copy,
  Check,
} from "lucide-react";
import { FILE_ICONS, PERMISSIONS } from "../../constants/fileConstants";
import { shareDocument, getDocumentPermissions, generateShareLink, revokeDocumentPermission } from "../../services/documentService";

export function ShareModal({ doc, onClose, showToast }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEW");
  const [shareType, setShareType] = useState("RESTRICTED");
  const [generatedLink, setGeneratedLink] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [invitees, setInvitees] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  
  if (!doc) return null;

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoadingPermissions(true);
        const data = await getDocumentPermissions(doc.id);
        
        if (data && data.content) {
          const viewersOnly = data.content
            .filter((item) => item.permission === "VIEW")
            .map((item) => ({
              email: item.email,
              role: "VIEW" 
            }));
          
          setInvitees(viewersOnly);
        }
      } catch (error) {
        showToast("Failed to load active viewers.", "error");
        console.error("Error fetching permissions:", error);
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [doc.id]);

  const generateLink = async () => {
    try {
      setGenerating(true);
      
      const token = await generateShareLink(doc.id, shareType);

      const frontendShareUrl = `${window.location.origin}/shared/view/${token}`;

      setGeneratedLink(frontendShareUrl);
      showToast("Secure link generated successfully!", "success");
    } catch (error) {
      console.error("Lỗi tạo link chia sẻ:", error);
      showToast(error.response?.data || "Failed to generate link", "error");
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("Link copied to clipboard!");
  };

  const addInvitee = async () => {
    if (!email) return;

    try {
      setInviting(true);

      const result = await shareDocument(doc.id, email);

      setInvitees((prev) => [
        ...prev,
        {
          email: email,
          role: "VIEW", 
        },
      ]);

      setEmail("");

      const successMsg = typeof result === "string" ? result : "Document shared successfully!";
      showToast(successMsg);

    } catch (error) {
      const errorMsg = error.response?.data || "Failed to share document";
      showToast(errorMsg, "error");
    } finally {
      setInviting(false);
    }
  };

  const removeInvitee = async (targetEmail) => {
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa quyền truy cập của ${targetEmail} không?`
    );

    if (!isConfirmed) return;

    try {
      await revokeDocumentPermission(doc.id, targetEmail);
      
      setInvitees((prev) => prev.filter((i) => i.email !== targetEmail));
      
      showToast("Đã thu hồi quyền truy cập thành công!");
    } catch (error) {
      console.error("Error revoking permission:", error);
      showToast(error.response?.data || "Không thể thu hồi quyền truy cập", "error");
    }
  };
  const fi = FILE_ICONS[doc.contentType] || FILE_ICONS.OTHER;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-slate-900 rounded-2xl border border-slate-700/60 w-full max-w-lg shadow-2xl shadow-slate-950/60">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${fi.bg}`}>
            <fi.icon size={15} className={fi.color} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-slate-100 font-semibold text-sm">Share Document</h3>
            <p className="text-slate-500 text-xs truncate">{doc.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Section A: Direct Invite */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center">
                <Mail size={11} className="text-violet-400" />
              </div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Invite People
              </h4>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addInvitee()}
                placeholder="Enter email or username…"
                className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
              />
             
              <button
                onClick={addInvitee}
                disabled={!email || inviting}
                className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex-shrink-0"
              >
                {inviting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
              </button>
            </div>

            {/* Invitee List */}
            {invitees.length > 0 && (
              <div className="space-y-1.5">
                {invitees.map((inv) => {
                  const p = PERMISSIONS[inv.role];
                  return (
                    <div
                      key={inv.email}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/40"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold">
                        {inv.email[0].toUpperCase()}
                      </div>
                      <span className="flex-1 text-xs text-slate-300 truncate">
                        {inv.email}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${p.color}`}>
                        {p.label}
                      </span>
                      <button
                        onClick={() => removeInvitee(inv.email)}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-px bg-slate-800/60" />

          {/* Section B: Link Generation */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-sky-500/20 flex items-center justify-center">
                <Link2 size={11} className="text-sky-400" />
              </div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Share Link
              </h4>
            </div>

            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <select
                  value={shareType}
                  onChange={(e) => setShareType(e.target.value)}
                  className="w-full appearance-none bg-slate-800/60 border border-slate-700/50 rounded-xl pl-3 pr-8 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50 transition-all"
                >
                  <option value="PUBLIC">🔓 Public — Anyone with link</option>
                  <option value="RESTRICTED">
                    🔒 Restricted — Added users only
                  </option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>
              <button
                onClick={generateLink}
                disabled={generating}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex-shrink-0 flex items-center gap-1.5"
              >
                {generating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Link2 size={13} /> Generate
                  </>
                )}
              </button>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                shareType === "PUBLIC"
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-slate-800/40 border-slate-700/40"
              }`}
            >
              {shareType === "PUBLIC" ? (
                <Unlock size={13} className="text-amber-400 flex-shrink-0" />
              ) : (
                <Lock size={13} className="text-slate-500 flex-shrink-0" />
              )}
              <p
                className={`text-xs ${
                  shareType === "PUBLIC"
                    ? "text-amber-300/80"
                    : "text-slate-500"
                }`}
              >
                {shareType === "PUBLIC"
                  ? "Anyone with this link can view the document."
                  : "Only people you've added can access with this link."}
              </p>
            </div>

            {generatedLink && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-violet-500/30">
                <code className="flex-1 text-xs text-violet-300 truncate font-mono">
                  {generatedLink}
                </code>
                <button
                  onClick={copyLink}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex-shrink-0"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-800/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700/60 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
