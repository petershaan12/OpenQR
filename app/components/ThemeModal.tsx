import { Form, useNavigation } from "react-router";
import { Palette, Type, Plus, X, Save, Edit2, Loader2 } from "lucide-react";
import { RefObject } from "react";

export default function ThemeModal({
    modalRef,
    editingTheme,
    enableWelcome,
    setEnableWelcome,
    welcomeImage,
    setWelcomeImage,
    handleImageUpload,
    primaryColor,
    setPrimaryColor
}: {
    modalRef: RefObject<HTMLDialogElement | null>;
    editingTheme: any;
    enableWelcome: boolean;
    setEnableWelcome: (val: boolean) => void;
    welcomeImage: string | null;
    setWelcomeImage: (val: string | null) => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => void;
    primaryColor: string;
    setPrimaryColor: (val: string) => void;
}) {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting" &&
        (navigation.formData?.get("_action") === "create" || navigation.formData?.get("_action") === "update");
    return (
        <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
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

                <Form method="post" onSubmit={() => modalRef.current?.close()} className="px-6 pb-6 space-y-4 overflow-y-auto max-h-[calc(100vh-14rem)]">
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
                            <span className="label-text font-bold text-base-content/70">Legal Information</span>
                        </label>
                        <textarea
                            name="legal_info"
                            className="textarea textarea-bordered font-medium min-h-[80px] w-full flex"
                            defaultValue={editingTheme?.legal_info || ""}
                            placeholder="Copyright © 2026. All rights reserved."
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
                            disabled={!enableWelcome}
                            className={`input input-bordered font-medium w-full ${!enableWelcome ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
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

                    <div className="modal-action pt-2">
                        <form method="dialog">
                            <button className="btn btn-ghost font-bold">Cancel</button>
                        </form>
                        <button
                            type="submit"
                            name="_action"
                            value={editingTheme ? "update" : "create"}
                            disabled={isSubmitting}
                            className="btn-army px-6 gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                editingTheme ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />
                            )}
                            {isSubmitting ? (editingTheme ? "Updating..." : "Creating...") : (editingTheme ? "Update Theme" : "Create Theme")}
                        </button>
                    </div>
                </Form>
            </div>
            <form method="dialog" className="modal-backdrop bg-base-content/20 backdrop-blur-[2px]">
                <button>close</button>
            </form>
        </dialog>
    );
}
