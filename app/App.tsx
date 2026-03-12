import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useUIStore } from "@/store/useStore";

// Pages
import Login from "./routes/login";
import Dashboard from "./routes/dashboard";
import CreateQRCode from "./routes/create-qrcode";
import EditQRCode from "./routes/edit-qrcode";
import Theme from "./routes/theme";
import Users from "./routes/users";
import Account from "./routes/account";
import PublicCard from "./routes/public-card";
import VCardDownload from "./routes/vcard-download";
import ProtectedLayout from "./routes/protected";

function AppWrapper({ children }: { children: React.ReactNode }) {
  const initDarkMode = useUIStore((state) => state.initDarkMode);

  useEffect(() => {
    initDarkMode();
  }, [initDarkMode]);

  return <>{children}</>;
}

export default function App() {
  return (
    <AppWrapper>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-qrcode" element={<CreateQRCode />} />
          <Route path="/edit-qrcode/:id" element={<EditQRCode />} />
          <Route path="/theme" element={<Theme />} />
          <Route path="/users" element={<Users />} />
          <Route path="/account" element={<Account />} />
        </Route>

        {/* Public QR card routes - must be last */}
        <Route path="/:id/vcard" element={<VCardDownload />} />
        <Route path="/:id" element={<PublicCard />} />
      </Routes>
    </AppWrapper>
  );
}
