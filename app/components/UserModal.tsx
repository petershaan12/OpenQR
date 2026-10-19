import { User, Mail, Key, Check, Save, X, Edit, Plus, Loader2 } from "lucide-react";
import { RefObject, useState } from "react";

export default function UserModal({
    modalRef,
    editingUser,
    onSave
}: {
    modalRef: RefObject<HTMLDialogElement | null>;
    editingUser?: any;
    onSave?: () => void;
}) {
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            id: editingUser?.id,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            role: formData.get('role') as string,
        };

        try {
            const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}?path=/users${editingUser ? `/${editingUser.id}` : ''}`, {
                method: editingUser ? "PUT" : "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to save user");
            }

            modalRef.current?.close();
            onSave?.();
        } catch (error) {
            console.error("Error saving user:", error);
            alert("Failed to save user");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
            <div className="modal-box p-0 overflow-hidden border border-base-300 shadow-2xl rounded-lg bg-base-100">
                <div className="px-6 py-4 border-b border-base-200 flex items-center justify-between bg-base-200/50">
                    <div className="flex items-center gap-2">
                        {editingUser ? <Edit className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                        <h3 className="font-bold text-lg">{editingUser ? "Edit User" : "Add New User"}</h3>
                    </div>
                    <form method="dialog">
                        <button className="btn btn-ghost btn-sm btn-circle"><X className="w-4 h-4" /></button>
                    </form>
                </div>

                <form key={editingUser?.id || "new"} onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                    {editingUser && <input type="hidden" name="id" value={editingUser.id} />}

                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-base-content/70">Full Name</span>
                        </label>
                        <div className="input input-bordered w-full flex items-center gap-3">
                            <User className="w-4 h-4 text-base-content/30" />
                            <input name="name" type="text" className="grow font-medium" defaultValue={editingUser?.name || ""} placeholder="E.g. John Doe" required />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-base-content/70">Email Address</span>
                        </label>
                        <div className="input input-bordered w-full flex items-center gap-3">
                            <Mail className="w-4 h-4 text-base-content/30" />
                            <input name="email" type="email" className="grow font-medium" defaultValue={editingUser?.email || ""} placeholder="john@example.com" required />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-base-content/70">{editingUser ? "New Password (Optional)" : "Password"}</span>
                        </label>
                        <div className="input input-bordered w-full flex items-center gap-3">
                            <Key className="w-4 h-4 text-base-content/30" />
                            <input name="password" type="password" className="grow font-medium" placeholder={editingUser ? "Leave blank to keep current" : "••••••••"} required={!editingUser} />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-base-content/70">Role</span>
                        </label>
                        <select name="role" className="select select-bordered font-medium w-full flex" defaultValue={editingUser?.role || "user"}>
                            <option value="user">Standard User</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    <div className="modal-action pt-2">
                        <form method="dialog">
                            <button className="btn btn-ghost font-bold">Cancel</button>
                        </form>
                        <button type="submit" disabled={submitting} className="btn-brand px-6 gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                editingUser ? <Save className="w-4 h-4" /> : <Check className="w-4 h-4" />
                            )}
                            {submitting ? "Saving..." : (editingUser ? "Save Changes" : "Create User")}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop bg-base-content/20 backdrop-blur-[2px]">
                <button>close</button>
            </form>
        </dialog>
    );
}
