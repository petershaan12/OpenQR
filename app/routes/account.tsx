import { useState } from "react";
import { useLoaderData, Form, useNavigate, useActionData } from "react-router";
import { User, Mail, Shield, Check, AlertCircle, Save, Lock, Camera, Plus, Trash2, Upload, X } from "lucide-react";
import { requireUser } from "~/.server/auth";
import DashboardLayout from "~/components/DashboardLayout";
import bcrypt from "bcryptjs";
import { getUserById, findUserByEmail, updateUser, createNotification, getUserNotifications } from "~/services";

export async function loader({ request }: { request: Request }) {
    const userId = await requireUser(request);
    const user = await getUserById(userId);
    const notifications = await getUserNotifications(userId);
    return { user, notifications };
}

export async function action({ request }: { request: Request }) {
    const userId = await requireUser(request);
    const formData = await request.formData();
    const _action = formData.get("_action");

    if (_action === "update_profile") {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const avatar = formData.get("avatar") as string;

        await updateUser(userId, { name, email, avatar: avatar || null });
        await createNotification({
            user_id: userId,
            title: "Profile Updated",
            message: "Your profile information has been updated successfully.",
            type: "success"
        });
        return { success: true, message: "Profile updated successfully" };
    }

    if (_action === "update_password") {
        const currentPassword = formData.get("current_password") as string;
        const current = await getUserById(userId);
        const account = current && (await findUserByEmail(current.email));
        if (!account || !bcrypt.compareSync(currentPassword || "", account.password)) {
            return { error: "Current password is incorrect" };
        }
        const newPassword = formData.get("new_password") as string;
        const confirmPassword = formData.get("confirm_password") as string;

        if (newPassword && newPassword === confirmPassword) {
            await updateUser(userId, { password: newPassword });
            await createNotification({
                user_id: userId,
                title: "Password Changed",
                message: "Your account password has been changed successfully.",
                type: "success"
            });
            return { success: true, message: "Password updated successfully" };
        }
        return { error: "Passwords do not match" };
    }

    return null;
}

export default function Account() {
    const { user, notifications } = useLoaderData<any>();
    const actionData = useActionData<any>();
    const [name, setName] = useState(user.name || "");
    const [email, setEmail] = useState(user.email || "");
    const [avatar, setAvatar] = useState<string | null>(user.avatar || null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setAvatar(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <DashboardLayout
            title="Account Settings"
            subtitle="Manage your profile"
            user={user}
            notifications={notifications}
        >
            <div className="max-w-2xl space-y-6 pb-10">
                {/* Status Messages */}
                {actionData?.success && (
                    <div className="alert alert-success rounded-lg shadow-sm font-bold text-white">
                        <Check className="w-5 h-5" />
                        <span>{actionData.message}</span>
                    </div>
                )}
                {actionData?.error && (
                    <div className="alert alert-error rounded-lg shadow-sm font-bold text-white">
                        <AlertCircle className="w-5 h-5" />
                        <span>{actionData.error}</span>
                    </div>
                )}

                {/* Profile Info */}
                <section className="bg-base-100 border border-base-300 rounded-lg overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-base-300 bg-base-200/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-base-content/40" />
                            <h3 className="font-bold">Profile Details</h3>
                        </div>
                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1 ${user.role === 'admin' ? 'bg-error/10 text-error border-error/20' : 'bg-base-200 text-base-content/50 border-base-300'}`}>
                            <Shield className="w-3 h-3" />
                            {user.role?.toUpperCase()}
                        </div>
                    </div>
                    <Form method="post" className="p-6 space-y-4">
                        <div className="flex flex-col items-center pb-4">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-base-200 border-2 border-base-300 overflow-hidden flex items-center justify-center relative shadow-sm transition-all group-hover:border-primary/50">
                                    {avatar ? (
                                        <img src={avatar} className="w-full h-full object-cover" alt="Avatar" />
                                    ) : (
                                        <User className="w-12 h-12 text-base-content/20" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                                {avatar && (
                                    <button
                                        type="button"
                                        onClick={() => setAvatar(null)}
                                        className="absolute -top-1 -right-1 btn btn-xs btn-circle btn-error shadow"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                            <input type="hidden" name="avatar" value={avatar || ""} />
                            <p className="text-[11px] font-bold text-base-content/40 mt-3 uppercase tracking-wider">Profile Picture</p>
                        </div>
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-bold text-base-content/70">Full Name</span>
                            </label>
                            <div className="input input-bordered w-full flex items-center gap-3">
                                <User className="w-4 h-4 text-base-content/30" />
                                <input
                                    name="name"
                                    type="text"
                                    className="grow font-medium"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-bold text-base-content/70">Email Address</span>
                            </label>
                            <div className="input input-bordered w-full flex items-center gap-3">
                                <Mail className="w-4 h-4 text-base-content/30" />
                                <input
                                    name="email"
                                    type="email"
                                    className="grow font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="submit" name="_action" value="update_profile" className="btn-brand px-6 gap-2">
                                <Save className="w-4 h-4" />
                                Update Profile
                            </button>
                        </div>
                    </Form>
                </section>

                {/* Change Password */}
                <section className="bg-base-100 border border-base-300 rounded-lg overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-base-300 bg-base-200/50 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-base-content/40" />
                        <h3 className="font-bold">Security</h3>
                    </div>
                    <Form method="post" className="p-6 space-y-4">
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-bold text-base-content/70">Current Password</span>
                            </label>
                            <div className="input input-bordered w-full flex items-center gap-3">
                                <Lock className="w-4 h-4 text-base-content/30" />
                                <input type="password" name="current_password" placeholder="••••••••" className="grow font-medium" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control md:col-span-2">
                                <label className="label py-1">
                                    <span className="label-text font-bold text-base-content/70">Current Password</span>
                                </label>
                                <div className="input input-bordered w-full flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-base-content/30" />
                                    <input type="password" name="current_password" placeholder="••••••••" className="grow font-medium" />
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text font-bold text-base-content/70">New Password</span>
                                </label>
                                <div className="input input-bordered w-full flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-base-content/30" />
                                    <input type="password" name="new_password" placeholder="••••••••" className="grow font-medium" />
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text font-bold text-base-content/70">Confirm Password</span>
                                </label>
                                <div className="input input-bordered w-full flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-base-content/30" />
                                    <input type="password" name="confirm_password" placeholder="••••••••" className="grow font-medium" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="submit" name="_action" value="update_password" className="btn btn-ghost border border-black dark:border-white font-bold px-4 rounded-lg hover:bg-base-200">
                                <Shield className="w-4 h-4 mr-1" />
                                Update Password
                            </button>
                        </div>
                    </Form>
                </section>

                <div className="alert alert-info rounded-lg text-sm bg-info/5 border-info/20 text-info shadow-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Your account information is private and secure. Changes take effect immediately.</span>
                </div>
            </div>
        </DashboardLayout>
    );
}
