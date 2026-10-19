import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    QrCode,
    Plus,
    Palette,
    Users,
    Sun,
    Moon,
    PanelLeftClose,
    X,
    LogOut,
} from "lucide-react";
import { useUIStore } from "@/store/useStore";

interface SidebarProps {
    user?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const darkMode = useUIStore((state) => state.darkMode);
    const toggleDarkMode = useUIStore((state) => state.toggleDarkMode);
    const sidebarOpen = useUIStore((state) => state.sidebarOpen);
    const toggleSidebar = useUIStore((state) => state.toggleSidebar);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const menuItems = [
        { path: "/dashboard", label: "QR Codes", icon: QrCode },
        { path: "/create-qrcode", label: "Create QR Code", icon: Plus },
        { path: "/theme", label: "Themes", icon: Palette },
    ];

    if (user?.role === "admin") {
        menuItems.push({ path: "/users", label: "Users", icon: Users });
    }

    return (
        <>
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar} />
            )}

            <aside
                className={`sidebar-container fixed lg:relative z-50 lg:z-auto h-full bg-base-100 border-r border-base-300 flex flex-col shrink-0 transition-all duration-300 ${sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-0 lg:-translate-x-full"
                    }`}
                style={{ overflow: sidebarOpen ? "visible" : "hidden" }}
            >
                <div className="px-5 py-4 border-b border-base-300 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                            <QrCode className="w-5 h-5 text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-base-content">
                                Open<span className="text-primary">QR</span>
                            </h1>
                            <p className="text-[11px] text-base-content/40 -mt-0.5 whitespace-nowrap">
                                Management System
                            </p>
                        </div>
                    </Link>
                    <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-base-200 lg:hidden">
                        <X className="w-5 h-5 text-base-content/50" />
                    </button>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    <p className="text-[11px] font-semibold text-base-content/40 uppercase tracking-wider px-3 mb-3">
                        Menu
                    </p>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                                    ? "bg-red-600/10 text-primary border-l-4 border-red-600 rounded-l-none"
                                    : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
                                    }`}
                            >
                                <Icon className={`w-4 h-4 shrink-0 ${isActive(item.path) ? "text-primary" : "text-base-content/40"}`} />
                                <span className="whitespace-nowrap">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-base-300 space-y-1">
                    <button onClick={toggleDarkMode} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-base-content/60 hover:bg-base-200 w-full transition-all">
                        {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
                        <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                    </button>

                    <button onClick={toggleSidebar} className="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-base-content/60 hover:bg-base-200 w-full transition-all">
                        <PanelLeftClose className="w-4 h-4" />
                        <span>Hide Sidebar</span>
                    </button>

                    <button type="button" onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-base-content/60 hover:bg-red-600/10 hover:text-primary w-full transition-all">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
