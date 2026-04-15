import { useState, useRef, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Plus, Trash2, Edit2, AlertCircle, Loader2 } from "lucide-react";
import DashboardLayout from "~/components/DashboardLayout";
import ThemeModal from "~/components/ThemeModal";

export default function Theme() {
  const [user] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('user') || 'null');
    }
    return null;
  });

  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get("error");
  const modalRef = useRef<HTMLDialogElement>(null);
  const [editingTheme, setEditingTheme] = useState<any>(null);
  const [welcomeImage, setWelcomeImage] = useState<string | null>(null);
  const [welcomeVideo, setWelcomeVideo] = useState<string | null>(null);
  const [enableWelcome, setEnableWelcome] = useState<boolean>(true);
  const [primaryColor, setPrimaryColor] = useState<string>("#dc2626");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";

      try {
        const themesResponse = await fetch(`${API_URL}?path=/themes`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (themesResponse.ok) {
          setThemes(await themesResponse.json());
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading themes:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency - run once on mount

  const refreshThemes = async () => {
    const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";
    try {
      const res = await fetch(`${API_URL}?path=/themes`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        setThemes(await res.json());
      }
    } catch (error) {
      console.error("Error refreshing themes:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this theme?")) return;

    setDeletingId(id);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";
      const response = await fetch(`${API_URL}?path=/themes/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setThemes(prev => prev.filter(t => t.id !== id));
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting theme:", error);
      alert("Failed to delete theme");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (theme: any) => {
    setEditingTheme(theme);
    setWelcomeImage(theme.welcome_image || null);
    setWelcomeVideo(theme.welcome_video || null);
    setPrimaryColor(theme.primary_color || "#dc2626");
    // Handle string "0", number 0, false, "false"
    const isEnabled = theme.enable_welcome == 1 || theme.enable_welcome === true || theme.enable_welcome === "true";
    setEnableWelcome(isEnabled);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setWelcomeImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setWelcomeVideo(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout title="Theme Management" subtitle="Customize your profile appearance" user={user} notifications={[]}>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <>
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
                      <h3 className="font-bold text-base-content">{t.name}</h3>
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
                          <button
                            onClick={() => handleDelete(t.id)}
                            disabled={deletingId === t.id}
                            className="btn btn-ghost btn-sm btn-square hover:bg-error/10 hover:text-error disabled:opacity-50"
                          >
                            {deletingId === t.id ? <Loader2 className="w-4 h-4 animate-spin text-error" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </>
                      )}
                      {!t.user_id && <span className="text-[10px] font-bold text-base-content/20 italic">Global Theme</span>}
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={handleCreateNew} className="bg-base-200/50 border-2 border-dashed border-base-300 rounded-lg p-10 flex flex-col items-center justify-center text-base-content/30 hover:bg-base-200 hover:text-base-content/50 transition-all gap-3 cursor-pointer active:scale-95">
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
            onSave={refreshThemes}
          />
        </>
      )}
    </DashboardLayout>
  );
}
