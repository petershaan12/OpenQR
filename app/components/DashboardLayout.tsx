import { Link, Form } from "react-router";
import { Bell, Menu, PanelLeftOpen } from "lucide-react";
import Sidebar from "./Sidebar";
import { useUIStore } from "@/store/useStore";

import { type UserData, type NotificationData } from "~/types";

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    user?: UserData;
    notifications?: NotificationData[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle, user, notifications = [] }) => {
    const sidebarOpen = useUIStore((state) => state.sidebarOpen);
    const toggleSidebar = useUIStore((state) => state.toggleSidebar);

    return (
        <div className="flex h-screen bg-base-200">
            <Sidebar user={user} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-base-100 border-b border-base-300 px-4 md:px-8 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        {!sidebarOpen && (
                            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-base-200" title="Open Sidebar">
                                <PanelLeftOpen className="w-5 h-5 text-base-content/60 hidden lg:block" />
                                <Menu className="w-5 h-5 text-base-content/60 lg:hidden" />
                            </button>
                        )}
                        {sidebarOpen && (
                            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-base-200 lg:hidden" title="Open Menu">
                                <Menu className="w-5 h-5 text-base-content/60" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-lg font-bold text-base-content">{title}</h1>
                            {subtitle && <p className="text-sm text-base-content/50 mt-0.5">{subtitle}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notification Dropdown */}
                        <div className="dropdown dropdown-end">
                            <button tabIndex={0} className="relative p-2 rounded-lg hover:bg-base-200 transition-colors" title="Notifications">
                                <Bell className="w-5 h-5 text-base-content/50" />
                                {notifications.some(n => !n.is_read) && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>
                            <div tabIndex={0} className="dropdown-content z-50 card card-compact bg-base-100 w-80 shadow-xl border border-base-300 mt-2">
                                <div className="card-body p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-black text-xs uppercase tracking-widest text-base-content">Notifications</h3>
                                        <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">New</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto space-y-2 -mx-2 px-2">
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div key={n.id} className={`p-3 rounded-xl border transition-colors cursor-pointer group ${n.is_read ? 'bg-base-100 border-base-200 grayscale-[0.5]' : 'bg-base-200/50 border-base-300 hover:bg-base-200'}`}>
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.is_read ? 'bg-base-300' : n.type === 'success' ? 'bg-success' : n.type === 'warning' ? 'bg-warning' : 'bg-info'}`}></div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-[11px] font-black text-base-content uppercase tracking-tight">{n.title}</p>
                                                                {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                                                            </div>
                                                            <p className="text-[10px] text-base-content/60 leading-tight mt-0.5 line-clamp-2">{n.message}</p>
                                                            <p className="text-[9px] text-base-content/30 font-bold mt-1.5 uppercase" suppressHydrationWarning>
                                                                {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center">
                                                <p className="text-[10px] font-bold text-base-content/30 uppercase tracking-widest">No notifications</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-actions justify-center mt-3 pt-3 border-t border-base-300">
                                        <Form method="post" action="/dashboard" className="w-full text-center">
                                            <button type="submit" name="_action" value="mark_read" className="text-[10px] font-black uppercase text-base-content/40 hover:text-base-content transition-colors">Mark all as read</button>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link to="/account" className="flex items-center gap-2 group cursor-pointer">
                            {user?.avatar ? (
                                <img src={user.avatar} className="w-8 h-8 rounded-full object-cover shadow-sm group-hover:ring-2 ring-primary/50 transition-all border border-base-300" alt="Avatar" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors border border-red-200">
                                    <span className="text-red-600 font-semibold text-sm uppercase">
                                        {user?.name?.charAt(0) || "A"}
                                    </span>
                                </div>
                            )}
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-bold text-base-content/90 leading-tight">{user?.name || "Admin"}</p>
                                <p className="text-xs text-base-content/60 font-medium">{user?.email || "admin@example.com"}</p>
                            </div>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
