import { Outlet } from "react-router";
import { requireUser } from "~/.server/auth";

export async function loader({ request }: { request: Request }) {
    await requireUser(request);
    return null;
}

export default function ProtectedLayout() {
    return <Outlet />;
}
