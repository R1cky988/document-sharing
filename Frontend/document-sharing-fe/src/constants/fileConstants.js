import {
  FileText, FileImage, File, Sheet,
} from "lucide-react";

export const FILE_ICONS = {
  PDF: { icon: FileText, color: "text-red-400", bg: "bg-red-400/10" },
  IMAGE: { icon: FileImage, color: "text-sky-400", bg: "bg-sky-400/10" },
  WORD: { icon: File, color: "text-blue-400", bg: "bg-blue-400/10" },
  EXCEL: { icon: Sheet, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  OTHER: { icon: File, color: "text-slate-400", bg: "bg-slate-400/10" },
};

export const PERMISSIONS = {
  OWNER: { label: "Owner", color: "text-violet-300 bg-violet-500/15 border-violet-500/30" },
  VIEW: { label: "View Only", color: "text-slate-300 bg-slate-500/15 border-slate-500/30" },
};

export const FILE_TYPES = ["ALL", "PDF", "IMAGE", "WORD", "EXCEL"];

export const MOCK_USER = {
  id: 1,
  name: "Alex Monroe",
  email: "alex.monroe@acme.io",
  avatar: "AM",
};
