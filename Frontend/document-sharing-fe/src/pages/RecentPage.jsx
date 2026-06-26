import { Clock } from "lucide-react";
import { ALL_DOCS } from "../data/mockData";
import { FILE_ICONS, PERMISSIONS } from "../constants/fileConstants";
import { useNavigate } from "react-router-dom";

export function RecentPage() {
  const navigate = useNavigate();
  const recentDocs = ALL_DOCS.slice(0, 10);

  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Clock size={20} className="text-blue-400" />
            Recent Documents
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Recently accessed documents
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                    Created
                  </th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                    Owner
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentDocs.map((doc) => {
                  const fi = FILE_ICONS[doc.contentType] || FILE_ICONS.OTHER;
                  const perm = PERMISSIONS[doc.permission];
                  return (
                    <tr
                      key={doc.id}
                      onClick={() =>
                        navigate(`/documents/${doc.id}`, {
                          state: { doc },
                        })
                      }
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${fi.bg}`}
                          >
                            <fi.icon size={15} className={fi.color} />
                          </div>
                          <span className="text-sm text-slate-200 font-medium truncate group-hover:text-white transition-colors">
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className={`text-xs font-semibold ${fi.color}`}>
                          {doc.contentType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 hidden md:table-cell">
                        {doc.createdAt}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell truncate max-w-[140px]">
                        {doc.owner}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md border font-medium ${perm.color}`}
                        >
                          {perm.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
