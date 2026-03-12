import { useState, useRef } from "react";
import { useLoaderData, Form, useSearchParams, useNavigation } from "react-router";
import { Plus, Trash2, Edit2, X, Check, Palette, Type, Save, AlertCircle, Loader2 } from "lucide-react";
import { requireUser } from "~/.server/auth";
import DashboardLayout from "~/components/DashboardLayout";
import ThemeModal from "~/components/ThemeModal";
import { getUserThemes, getUserById, createTheme, deleteTheme, updateTheme, getUserNotifications, createNotification } from "~/services";

export async function loader({ request }: { request: Request }) {
  const userId = await requireUser(request);
  const user = await getUserById(userId);
  const themes = await getUserThemes(userId);
  const notifications = await getUserNotifications(userId);
  return { user, themes, notifications };
}

export async function action({ request }: { request: Request }) {
  const userId = await requireUser(request);
  const formData = await request.formData();
  const _action = formData.get("_action");

  if (_action === "create") {
    const name = formData.get("name") as string;
    const primary_color = formData.get("primary_color") as string;
    const legal_info = formData.get("legal_info") as string;
    const welcome_screen_time = parseInt(formData.get("welcome_screen_time") as string || "5");
    const welcome_image = formData.get("welcome_image") as string;
    const welcome_video = formData.get("welcome_video") as string;
    const enable_welcome = formData.get("enable_welcome") === "on";

    await createTheme({ name, primary_color, legal_info, welcome_screen_time, welcome_image, welcome_video, enable_welcome, user_id: userId });
    await createNotification({
      user_id: userId,
      title: "Theme Created",
      message: `New theme "${name}" has been created.`,
      type: "success"
    });
    return { success: true };
  }

  if (_action === "update") {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const primary_color = formData.get("primary_color") as string;
    const legal_info = formData.get("legal_info") as string;
    const welcome_screen_time = parseInt(formData.get("welcome_screen_time") as string || "5");
    const welcome_image = formData.get("welcome_image") as string;
    const welcome_video = formData.get("welcome_video") as string;
    const enable_welcome = formData.get("enable_welcome") === "on";

    await updateTheme(parseInt(id), userId, { name, primary_color, legal_info, welcome_screen_time, welcome_image, welcome_video, enable_welcome });
    await createNotification({
      user_id: userId,
      title: "Theme Updated",
      message: `Theme "${name}" has been updated.`,
      type: "info"
    });
    return { success: true };
  }

  if (_action === "delete") {
    const id = formData.get("id") as string;
    await deleteTheme(parseInt(id), userId);
    return { success: true };
  }

  return null;
}

export default function Theme() {
  const { user, themes, notifications } = useLoaderData<any>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get("error");
  const modalRef = useRef<HTMLDialogElement>(null);
  const [editingTheme, setEditingTheme] = useState<any>(null);
  const [welcomeImage, setWelcomeImage] = useState<string | null>(null);
  const [welcomeVideo, setWelcomeVideo] = useState<string | null>(null);
  const [enableWelcome, setEnableWelcome] = useState<boolean>(true);
  const [primaryColor, setPrimaryColor] = useState<string>("#dc2626");

  const handleEdit = (theme: any) => {
    setEditingTheme(theme);
    setWelcomeImage(theme.welcome_image || null);
    setWelcomeVideo(theme.welcome_video || null);
    setPrimaryColor(theme.primary_color || "#dc2626");
    setEnableWelcome(theme.enable_welcome !== 0 && theme.enable_welcome !== false && theme.enable_welcome !== "false");
    modalRef.current?.showModal();
  };

  const handleCreateNew = () => {
    setEditingTheme(null);
    setWelcomeImage(null);
    setWelcomeVideo(null);
    setPrimaryColor("#dc2626");
    setEnableWelcome(true);
    modalRef.current?.showModal();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setWelcomeImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 10MB for base64 storage if necessary, 
      // but let's assume it's fine for now or handled.
      const reader = new FileReader();
      reader.onload = (event) => setWelcomeVideo(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout
      title="Theme Management"
      subtitle="Customize your profile appearance"
      user={user}
      notifications={notifications}
    >
      {errorParam === "no_themes" && (
        <div className="alert alert-warning shadow-sm font-bold rounded-lg border-warning/20 mb-2">
          <AlertCircle className="w-5 h-5 animate-pulse" />
          <div>
            <p>You need to create at least one theme before creating a QR Code.</p>
            <p className="text-xs font-medium opacity-50">Themes define the primary color and welcome screen of your profile.</p>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((t: any) => (
            <div key={t.id} className="bg-base-100 border border-base-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="h-2 w-full" style={{ backgroundColor: t.primary_color }} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base-content">
                    {t.name}
                  </h3>
                  <div className="w-6 h-6 rounded-full border border-base-300 shadow-inner" style={{ backgroundColor: t.primary_color }} />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/50 font-medium">Primary Color</span>
                    <span className="font-bold font-mono text-[11px] uppercase">{t.primary_color}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/50 font-medium">Author</span>
                    <span className="font-bold text-[11px] opacity-40">{t.user_id ? 'Custom' : 'System'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-base-300 pt-4">
                  {t.user_id && (
                    <>
                      <button onClick={() => handleEdit(t)} className="btn btn-ghost btn-sm btn-square hover:bg-base-200">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <Form method="post" onSubmit={(e) => !confirm("Delete this theme?") && e.preventDefault()}>
                        <input type="hidden" name="id" value={t.id} />
                        <button
                          type="submit"
                          name="_action"
                          value="delete"
                          disabled={navigation.state !== "idle"}
                          className="btn btn-ghost btn-sm btn-square hover:bg-error/10 hover:text-error disabled:opacity-50"
                        >
                          {navigation.state !== "idle" && navigation.formData?.get("id") === String(t.id) && navigation.formData?.get("_action") === "delete" ? (
                            <Loader2 className="w-4 h-4 animate-spin text-error" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </Form>
                    </>
                  )}
                  {!t.user_id && (
                    <span className="text-[10px] font-bold text-base-content/20 italic">Global Theme</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button onClick={handleCreateNew} className="bg-base-200/50 border-2 border-dashed border-base-300 rounded-lg p-10 flex flex-col items-center justify-center text-base-content/30 hover:bg-base-200 hover:text-base-content/50 transition-all gap-3 overflow-hidden cursor-pointer active:scale-95">
            <div className="w-12 h-12 bg-base-100 rounded-lg flex items-center justify-center shadow-sm">
              <Plus className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm">Add New Theme</p>
          </button>
        </div>
      </div>

      <ThemeModal
        modalRef={modalRef}
        editingTheme={editingTheme}
        enableWelcome={enableWelcome}
        setEnableWelcome={setEnableWelcome}
        welcomeImage={welcomeImage}
        setWelcomeImage={setWelcomeImage}
        welcomeVideo={welcomeVideo}
        setWelcomeVideo={setWelcomeVideo}
        handleImageUpload={handleImageUpload}
        handleVideoUpload={handleVideoUpload}
        primaryColor={primaryColor}
        setPrimaryColor={setPrimaryColor}
      />
    </DashboardLayout>
  );
}
