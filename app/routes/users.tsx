import { useState, useMemo, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Plus, Trash2, Edit2, User, Shield } from "lucide-react";
import DashboardLayout from "~/components/DashboardLayout";
import UserModal from "~/components/UserModal";
import SearchFilter from "~/components/SearchFilter";

export default function Users() {
    const cachedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

    const [user] = useState<any>(cachedUser);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(!!cachedUser);
    const [isAdmin, setIsAdmin] = useState(cachedUser?.role === 'admin');
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const modalRef = useRef<HTMLDialogElement>(null);
    const [editingUser, setEditingUser] = useState<any>(null);

    useEffect(() => {
        if (!cachedUser) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        if (cachedUser.role !== 'admin') {
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";

            try {
                const res = await fetch(`${API_URL}?path=/users`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (res.ok) {
                    setUsers(await res.json());
                }

                setLoading(false);
            } catch (error) {
                console.error("Error loading users:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [cachedUser]);

    const refreshUsers = async () => {
        const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";
        try {
            const res = await fetch(`${API_URL}?path=/users`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch (error) {
            console.error("Error refreshing users:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this user?")) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";
            const res = await fetch(`${API_URL}?path=/users/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
            } else {
                throw new Error("Failed to delete");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        }
    };

    const filteredUsers = useMemo(() =>
        users.filter((u: any) => {
            const name = (u.name || "").toLowerCase();
            const email = (u.email || "").toLowerCase();
            const search = searchTerm.toLowerCase();
            const matchesSearch = name.includes(search) || email.includes(search);
            const matchesRole = roleFilter === "all" || u.role === roleFilter;
            return matchesSearch && matchesRole;
        }),
        [users, searchTerm, roleFilter]
    );

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <DashboardLayout title="User Management" subtitle="Manage system administrators" user={user} notifications={[]}>
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <span className="loading loading-spinner loading-lg text-red-600"></span>
                </div>
            ) : (
            <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                <div className="flex-1 w-full max-w-2xl">
                    <SearchFilter
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        searchPlaceholder="Search users by name or email..."
                        filterValue={roleFilter}
                        setFilterValue={setRoleFilter}
                        filterLabel="Role"
                        filterOptions={[
                            { value: "all", label: "All Users" },
                            { value: "admin", label: "Admin" },
                            { value: "user", label: "User" }
                        ]}
                    />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { setEditingUser(null); modalRef.current?.showModal(); }} className="btn-army">
                        <Plus className="w-4 h-4" />
                        Add User
                    </button>
                </div>
            </div>

            <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm overflow-visible">
                <div className="overflow-x-auto overflow-visible">
                    <table className="table w-full overflow-visible">
                        <thead>
                            <tr className="border-b border-base-300">
                                <th className="text-base-content/50 font-bold">User</th>
                                <th className="text-base-content/50 font-bold">Role</th>
                                <th className="text-base-content/50 font-bold hidden lg:table-cell">Joined</th>
                                <th className="text-base-content/50 font-bold text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="overflow-visible">
                            {filteredUsers.map((u: any) => (
                                <tr key={u.id} className="hover:bg-base-200/50 group border-b border-base-300/50 overflow-visible">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            {u.avatar ? (
                                                <img src={u.avatar} className="w-10 h-10 object-cover rounded-full border border-base-300" alt="Avatar" />
                                            ) : (
                                                <div className="w-10 h-10 bg-base-200 rounded-full flex items-center justify-center border border-base-300">
                                                    <span className="font-bold text-base-content/40 uppercase">{u.name?.charAt(0) || 'U'}</span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold">{u.name}</p>
                                                <p className="text-sm text-base-content/50">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${u.role === 'admin' ? 'bg-error/10 text-error border-error/20' : 'bg-base-200 text-base-content/50 border-base-300'}`}>
                                            <Shield className="w-3 h-3" />
                                            {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                                        </div>
                                    </td>
                                    <td className="hidden lg:table-cell text-sm text-base-content/50">
                                        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="overflow-visible">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => { setEditingUser(u); modalRef.current?.showModal(); }} className="btn btn-ghost btn-sm btn-square hover:bg-base-200" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            {u.id !== user?.id && (
                                                <button onClick={() => handleDelete(u.id)} className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-14 h-14 bg-base-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <User className="w-7 h-7 text-base-content/10" />
                        </div>
                        <h3 className="font-bold">No users found</h3>
                        <p className="text-sm text-base-content/40 mt-1">Try adjusting your search or role filter.</p>
                    </div>
                )}
            </div>

            <UserModal modalRef={modalRef} editingUser={editingUser} onSave={refreshUsers} />
            </>
            )}
        </DashboardLayout>
    );
}
