import { useLoaderData, Form, Link, redirect } from "react-router";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Share2,
  QrCode as QrCodeIcon,
  Copy,
  Download,
  MoreVertical,
  ChevronDown,
  ExternalLink,
  Check,
} from "lucide-react";
import DashboardLayout from "~/components/DashboardLayout";
import type { Route } from "./+types/dashboard";
import { useState, useMemo, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import SearchFilter from "~/components/SearchFilter";

export async function loader({ request }: Route.LoaderArgs) {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    return redirect("/login");
  }

  try {
    // Get user data from PHP backend
    const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";
    
    const userResponse = await fetch(`${API_URL}?path=/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!userResponse.ok) {
      localStorage.removeItem('token');
      return redirect("/login");
    }
    
    const user = await userResponse.json();

    // Get QR codes from PHP backend
    const qrcodesResponse = await fetch(`${API_URL}?path=/qrcodes`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!qrcodesResponse.ok) {
      throw new Error("Failed to load QR codes");
    }
    
    const qrcodes = await qrcodesResponse.json();

    // Get notifications from PHP backend (if available)
    // Note: You may need to implement this in your PHP backend
    const notifications = []; // Placeholder - implement as needed

    const url = new URL(request.url);
    const origin = url.origin;
    const host = url.host;

    return { user, qrcodes, notifications, origin, host };
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    return redirect("/login");
  }
}

export async function action({ request }: Route.ActionArgs) {
  const token = localStorage.getItem('token');
  if (!token) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const id = formData.get("id");
  const _action = formData.get("_action");

  if (_action === "delete" && id) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";
      
      const response = await fetch(`${API_URL}?path=/qrcodes/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete QR code");
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting QR code:", error);
      return { success: false, error: "Failed to delete QR code" };
    }
  }

  if (_action === "mark_read") {
    // Implement mark notifications as read if needed
    return { success: true };
  }

  return null;
}

export default function Dashboard() {
  const { user, qrcodes, notifications, origin, host } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const filteredQRCodes = useMemo(() =>
    qrcodes.filter((qr: any) => {
      const name = `${qr.name || ""} ${qr.surname || ""}`.toLowerCase();
      const uniqueId = (qr.unique_id || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = name.includes(search) || uniqueId.includes(search);
      const matchesStatus = activeFilter === "all" || qr.status === activeFilter;
      return matchesSearch && matchesStatus;
    }),
    [qrcodes, searchTerm, activeFilter]
  );

  const allSelected = selectedIds.length === filteredQRCodes.length && filteredQRCodes.length > 0;
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : filteredQRCodes.map((qr: any) => qr.id));
  const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const copyLink = (uniqueId: string) => {
    const text = `${origin}/${uniqueId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setShowToast(true);
      }).catch(() => {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setShowToast(true);
      });
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShowToast(true);
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const downloadQRCode = (uniqueId: string, name: string) => {
    const svg = document.getElementById(`qr-${uniqueId}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 4;
      canvas.height = img.height * 4;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngFile = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.download = `QR-${name.replace(/\s+/g, "-")}.png`;
        a.href = pngFile;
        a.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <DashboardLayout
      title="My QR Codes"
      subtitle="Manage and track your digital assets"
      user={user as any}
      notifications={notifications}
    >
      {/* Toast Notification */}
      {showToast && (
        <div className="toast toast-top toast-center z-[100] animate-in slide-in-from-top duration-300">
          <div className="alert alert-success shadow-lg border-none bg-success text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>Link copied to clipboard!</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="flex-1 w-full max-w-2xl">
          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Search by name, title or identifier..."
            filterValue={activeFilter}
            setFilterValue={setActiveFilter}
            filterLabel="Status"
            filterOptions={[
              { value: "all", label: "All Assets" },
              { value: "published", label: "Published" },
              { value: "draft", label: "Drafts" }
            ]}
          />
        </div>
      </div>

      {/* Batch action bar */}
      {selectedIds.length > 0 && (
        <div className="bg-neutral text-neutral-content px-4 py-2 rounded-lg mb-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-neutral-content/20 flex items-center justify-center text-xs font-bold">{selectedIds.length}</span>
            <p className="font-bold">Items Selected</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-xs btn-ghost text-neutral-content border border-neutral-content/20 hover:bg-neutral-content/10 rounded-md font-bold px-3">Archive</button>
            <button className="btn btn-xs btn-ghost text-error border border-error/20 hover:bg-error/10 rounded-md font-bold px-3">Delete</button>
            <button onClick={() => setSelectedIds([])} className="btn btn-xs btn-circle btn-ghost text-neutral-content ml-1">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm overflow-visible">
        <div className="overflow-x-auto overflow-visible">
          <table className="table w-full overflow-visible">
            <thead>
              <tr className="border-b border-base-300">
                <th className="w-10">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="text-base-content/50 font-bold">QR Code</th>
                <th className="text-base-content/50 font-bold">Profile</th>
                <th className="text-base-content/50 font-bold text-center">Scans</th>
                <th className="text-base-content/50 font-bold hidden lg:table-cell">Modified</th>
                <th className="text-base-content/50 font-bold">Status</th>
                <th className="text-base-content/50 font-bold text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="overflow-visible">
              {filteredQRCodes.map((qr: any) => (
                <tr
                  key={qr.id}
                  className={`hover:bg-base-200/50 group border-b border-base-300/50 transition-colors overflow-visible ${selectedIds.includes(qr.id) ? "bg-primary/5" : ""}`}
                >
                  {/* Checkbox */}
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedIds.includes(qr.id)}
                      onChange={() => toggleSelect(qr.id)}
                    />
                  </td>

                  {/* QR Thumb */}
                  <td>
                    <div className="bg-white border border-base-300 p-2 rounded-lg inline-flex shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <QRCodeSVG
                        id={`qr-${qr.unique_id}`}
                        value={`${origin}/${qr.unique_id}`}
                        size={72}
                        level="H"
                        includeMargin={false}
                        fgColor="#000000"
                      />
                    </div>
                  </td>

                  {/* Profile info */}
                  <td>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="font-bold">
                          {qr.name || "Unnamed"} {qr.surname}
                        </p>
                      </div>
                      <Link
                        to={`/${qr.unique_id}`}
                        target="_blank"
                        className="text-sm font-bold text-red-600 hover:underline flex items-center gap-1.5"
                      >
                        {host}/{qr.unique_id}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <p className="text-sm text-base-content/50 mt-0.5">
                        {qr.title || "vCard Profile"}
                      </p>
                    </div>
                  </td>

                  {/* Scans */}
                  <td className="text-center">
                    <span className="font-bold text-lg">{qr.scans || 0}</span>
                    <p className="text-xs text-base-content/30 font-bold">Scans</p>
                  </td>

                  {/* Modified date */}
                  <td className="hidden lg:table-cell">
                    <p className="font-bold" suppressHydrationWarning>
                      {new Date(qr.updated_at || qr.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-xs text-base-content/30" suppressHydrationWarning>
                      Created {new Date(qr.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </td>

                  {/* Status */}
                  <td>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${qr.status === "published"
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-base-300/30 text-base-content/40 border-base-300"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${qr.status === "published" ? "bg-success" : "bg-base-content/20"}`} />
                      {qr.status === "published" ? "Published" : "Draft"}
                    </div>
                  </td>

                  {/* Actions - INLINE BUTTONS */}
                  <td className="overflow-visible">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => copyLink(qr.unique_id)}
                        className="btn btn-ghost btn-sm btn-square hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Copy Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadQRCode(qr.unique_id, qr.name)}
                        className="btn btn-ghost btn-sm btn-square hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Download PNG"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/edit-qrcode/${qr.id}`}
                        className="btn btn-ghost btn-sm btn-square hover:bg-base-300"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <Form
                        method="post"
                        onSubmit={(e) => !confirm("Delete this QR code?") && e.preventDefault()}
                        className="inline"
                      >
                        <input type="hidden" name="id" value={qr.id} />
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQRCodes.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-base-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <QrCodeIcon className="w-8 h-8 text-base-content/10" />
            </div>
            <h3 className="font-bold">No QR Codes Found</h3>
            <p className="text-sm text-base-content/40 mt-1 max-w-xs mx-auto">
              Ready to create your first QR code? Click "New QR" to start.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
