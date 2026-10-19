import { useState, useMemo, useRef } from "react";
import { useLoaderData, Form, Link, redirect } from "react-router";
import { Search, Plus, Trash2, Edit, Edit2, User, Shield, ChevronDown, X, Mail, Key, Check, Save } from "lucide-react";
import { requireUser } from "~/.server/auth";
import DashboardLayout from "~/components/DashboardLayout";
import UserModal from "~/components/UserModal";
import SearchFilter from "~/components/SearchFilter";
import { getAllUsers, getUserById, deleteUser, createUser, updateUser, getUserNotifications, createNotification } from "~/services";

export async function loader({ request }: { request: Request }) {
    const userId = await requireUser(request);
    const currentUser = await getUserById(userId);

    if (currentUser?.role !== "admin") {
        return redirect("/dashboard");
    }

    const users = await getAllUsers();
    const notifications = await getUserNotifications(userId);
    return { user: currentUser, users, notifications };
}

export async function action({ request }: { request: Request }) {
    const userId = await requireUser(request);
    const currentUser = await getUserById(userId);

    if (currentUser?.role !== "admin") {
        return redirect("/dashboard");
    }

    const formData = await request.formData();
    const _action = formData.get("_action");

    if (_action === "delete") {
        const id = formData.get("id") as string;
        await deleteUser(parseInt(id));
        return { success: true };
    }

    if (_action === "create") {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const role = formData.get("role") as string;
        const password = formData.get("password") as string;

        await createUser({ name, email, role, password });
        await createNotification({
            user_id: userId,
            title: "User Created",
            message: `New user "${name}" has been added to the system.`,
            type: "success"
        });
        return { success: true };
    }

    if (_action === "update") {
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const role = formData.get("role") as string;
        const password = formData.get("password") as string;

        const updateData: any = { name, email, role };
        if (password) updateData.password = password;

        await updateUser(parseInt(id), updateData);
        await createNotification({
            user_id: userId,
            title: "User Updated",
            message: `User information for "${name}" has been modified.`,
            type: "info"
        });
        return { success: true };
    }

    return null;
}

export default function Users() {
    const { user, users, notifications } = useLoaderData<any>();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const modalRef = useRef<HTMLDialogElement>(null);
    const [editingUser, setEditingUser] = useState<any>(null);

    const filteredUsers = useMemo(() => users.filter((u: any) => {
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const search = searchTerm.toLowerCase();

        const matchesSearch = name.includes(search) || email.includes(search);
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    }), [users, searchTerm, roleFilter]);

    const handleEdit = (user: any) => {
        setEditingUser(user);
        modalRef.current?.showModal();
    };

    return (
        <DashboardLayout
            title="User Management"
            subtitle="Manage system administrators"
            user={user}
            notifications={notifications}
        >
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
                    <button onClick={() => { setEditingUser(null); modalRef.current?.showModal(); }} className="btn-brand">
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
                                                    <span className="font-bold text-base-content/40 uppercase">{u.name.charAt(0)}</span>
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
                                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                        </div>
                                    </td>
                                    <td className="hidden lg:table-cell text-sm text-base-content/50" suppressHydrationWarning>
                                        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="overflow-visible">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleEdit(u)} className="btn btn-ghost btn-sm btn-square hover:bg-base-200" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>

                                            {u.id !== user.id && (
                                                <Form
                                                    method="post"
                                                    onSubmit={(e) => !confirm("Delete this user?") && e.preventDefault()}
                                                    className="inline"
                                                >
                                                    <input type="hidden" name="id" value={u.id} />
                                                    <button
                                                        type="submit"
                                                        name="_action"
                                                        value="delete"
                                                        className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </Form>
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

            <UserModal
                modalRef={modalRef}
                editingUser={editingUser}
            />
        </DashboardLayout>
    );
}
