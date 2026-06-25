import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  LayoutDashboard,
  User,
  Star,
  Clock,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from "lucide-react";

export function Sidebar({ activePath, onLogout, collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const navItems = [
    { id: "dashboard", path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "starred", path: "/starred", icon: Star, label: "Starred" },
    { id: "recent", path: "/recent", icon: Clock, label: "Recent" },
    { id: "account", path: "/account", icon: User, label: "Account" },
  ];

  const { user, avatarUrl} = useContext(AuthContext);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <aside
      className={`flex flex-col bg-slate-900 border-r border-slate-800/70 transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      } h-screen sticky top-0`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-16 border-b border-slate-800/70 px-4 flex-shrink-0 ${
          collapsed ? "justify-center" : "gap-3"
        }`}
      >
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
          <FolderOpen size={15} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-white font-semibold text-sm tracking-tight">
            FileArchive
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, path, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activePath === path
                ? "bg-violet-600/20 text-violet-300"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <Icon size={17} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* User + Collapse */}
      <div className="border-t border-slate-800/70 p-3 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2 rounded-lg">
            <div className="w-8 h-8 rounded-full overflow-hidden">
            {avatarUrl ? (
                <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-violet-500 flex items-center justify-center text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
                </div>
            )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-slate-200 text-xs font-semibold truncate">
                    {user?.name}
                </div>
                <div className="text-slate-500 text-xs truncate">
                    {user?.email}
                </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 text-sm transition-all ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={15} />
          {!collapsed && <span>Sign out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-400 text-sm transition-all mt-0.5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? (
            <ChevronRight size={15} />
          ) : (
            <>
              <ChevronLeft size={15} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
