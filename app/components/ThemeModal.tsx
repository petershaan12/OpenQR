import { Palette, Type, Plus, X, Save, Edit2, Loader2 } from "lucide-react";
import { RefObject, useEffect, useState } from "react";
import { uploadMedia } from "../utils/api";

export default function ThemeModal({
    modalRef,
    editingTheme,
    enableWelcome,
    setEnableWelcome,
    welcomeImage,
    setWelcomeImage,
    welcomeVideo,
    setWelcomeVideo,
    handleImageUpload,
    handleVideoUpload,
    primaryColor,
    setPrimaryColor,
    onSave
}: {
    modalRef: RefObject<HTMLDialogElement | null>;
    editingTheme: any;
    enableWelcome: boolean;
    setEnableWelcome: (val: boolean) => void;
    welcomeImage: string | null;
    setWelcomeImage: (val: string | null) => void;
    welcomeVideo: string | null;
    setWelcomeVideo: (val: string | null) => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => void;
    handleVideoUpload: (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => void;
    primaryColor: string;
    setPrimaryColor: (val: string) => void;
    onSave?: () => void;
}) {
    const [submitting, setSubmitting] = useState(false);

    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!errorMessage) return;
        const timer = setTimeout(() => setErrorMessage(null), 3000);
        return () => clearTimeout(timer);
    }, [errorMessage]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage(null);

        // Get form data BEFORE any await calls (e.currentTarget becomes invalid after await)
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const primary_color = formData.get('primary_color') as string;
        const legal_info = formData.get('legal_info') as string;
        const welcome_screen_time = parseInt(formData.get('welcome_screen_time') as string) || 5;

        try {
            // Upload media files first if they are base64
            let imageUrl = welcomeImage;
            let videoUrl = welcomeVideo;

            if (welcomeImage?.startsWith('data:')) {
                setUploadProgress('Uploading image...');
                imageUrl = await uploadMedia(welcomeImage);
            }

            if (welcomeVideo?.startsWith('data:')) {
                setUploadProgress('Uploading video...');
                videoUrl = await uploadMedia(welcomeVideo);
            }

            setUploadProgress(null);

            const data = {
                id: editingTheme?.id,
                name,
                primary_color,
                legal_info,
                welcome_screen_time,
                enable_welcome: enableWelcome,
                welcome_image: imageUrl || null,
                welcome_video: videoUrl || null,
            };

            const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}?path=/themes${editingTheme ? `/${editingTheme.id}` : ''}`, {
                method: editingTheme ? "PUT" : "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json().catch(() => null);
            if (!response.ok) throw new Error(result?.error || "Failed to save theme");

            modalRef.current?.close();
            onSave?.();
        } catch (error) {
            console.error("Error saving theme:", error);
            setErrorMessage(error instanceof Error ? error.message : "Failed to save theme");
        } finally {
            setSubmitting(false);
            setUploadProgress(null);
        }
    };

    return (
        <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
            {errorMessage && (
                <div className="toast toast-top toast-center z-[100]">
                    <div className="alert alert-error text-white font-bold shadow-lg">
                        <span>{errorMessage}</span>
                    </div>
                </div>
            )}
            <div className="modal-box p-0 overflow-hidden border border-base-300 shadow-2xl rounded-lg bg-base-100">
                <div className="px-6 py-4 flex items-center justify-between bg-base-200/50">
                    <div className="flex items-center gap-2">
                        {editingTheme ? <Edit2 className="w-5 h-5 text-primary" /> : <Palette className="w-5 h-5 text-primary" />}
                        <h3 className="font-bold text-lg">{editingTheme ? "Edit Theme" : "Create New Theme"}</h3>
                    </div>
                    <form method="dialog">
                        <button className="btn btn-ghost btn-sm btn-circle"><X className="w-4 h-4" /></button>
                    </form>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 overflow-y-auto max-h-[calc(100vh-14rem)]">
                    {editingTheme && <input type="hidden" name="id" value={editingTheme.id} />}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-base-content/70">Theme Name</span>
                        </label>
                        <div className="input input-bordered w-full flex items-center gap-3">
                            <Type className="w-4 h-4 text-base-content/30" />
                            <input name="name" type="text" className="grow font-medium" defaultValue={editingTheme?.name || ""} placeholder="E.g. Modern Red" required />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-base-content/70">Primary Color</span>
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="color"
                                name="primary_color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-base-300 p-1 bg-white"
                            />
                            <input
                                type="text"
                                placeholder="#dc2626"
                                className="input input-bordered grow font-mono font-bold"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-base-content/70">Legal Information <span className="text-error font-extrabold ml-1">*</span></span>
                        </label>
                        <textarea
                            name="legal_info"
                            className="textarea textarea-bordered font-medium min-h-[80px] w-full flex"
                            defaultValue={editingTheme?.legal_info || ""}
                            placeholder="Copyright © 2026. All rights reserved."
                            required
                        ></textarea>
                    </div>
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-base-content/70">Welcome Duration (sec)</span>
                        </label>
                        <input
                            name="welcome_screen_time"
                            type="number"
                            min="0"
                            max="30"
                            defaultValue={editingTheme?.welcome_screen_time || "5"}
                            disabled={!enableWelcome || !!welcomeVideo}
                            className={`input input-bordered font-medium w-full ${(!enableWelcome || !!welcomeVideo) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        {welcomeVideo && <p className="text-[10px] text-primary font-bold mt-1">* Video welcome screen has no timeout</p>}
                    </div>

                    <div className="form-control flex flex-row items-center justify-between py-2">
                        <span className="label-text font-bold text-base-content/70">Enable Welcome Screen</span>
                        <input
                            type="checkbox"
                            name="enable_welcome"
                            className="toggle toggle-primary"
                            checked={enableWelcome}
                            onChange={(e) => setEnableWelcome(e.target.checked)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-bold text-base-content/70">Welcome Splash Image</span>
                            </label>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, !!editingTheme)}
                                    disabled={!enableWelcome}
                                    className={`file-input file-input-bordered h-10 file-input-sm w-full font-medium ${!enableWelcome ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                                {welcomeImage && (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-base-300 shadow-sm bg-base-200">
                                        <img src={welcomeImage} alt="Welcome Splash Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setWelcomeImage(null)}
                                            className="absolute top-2 right-2 btn btn-xs btn-circle btn-error shadow"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                                <input type="hidden" name="welcome_image" value={welcomeImage || ""} />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-bold text-base-content/70">Welcome Splash Video</span>
                            </label>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => handleVideoUpload(e, !!editingTheme)}
                                    disabled={!enableWelcome}
                                    className={`file-input file-input-bordered h-10 file-input-sm w-full font-medium ${!enableWelcome ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                                {welcomeVideo && (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-base-300 shadow-sm bg-base-200">
                                        <video src={welcomeVideo} className="w-full h-full object-cover" controls />
                                        <button
                                            type="button"
                                            onClick={() => setWelcomeVideo(null)}
                                            className="absolute top-2 right-2 btn btn-xs btn-circle btn-error shadow"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                                <input type="hidden" name="welcome_video" value={welcomeVideo || ""} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-action pt-2">
                        <form method="dialog">
                            <button className="btn btn-ghost font-bold">Cancel</button>
                        </form>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-brand px-6 gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                editingTheme ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />
                            )}
                            {submitting ? (uploadProgress || (editingTheme ? "Updating..." : "Creating...")) : (editingTheme ? "Update Theme" : "Create Theme")}
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
