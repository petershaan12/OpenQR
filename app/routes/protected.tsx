import { Outlet, redirect } from "react-router";
import { requireUser, mustChangePassword } from "~/.server/auth";

export async function loader({ request }: { request: Request }) {
    await requireUser(request);
    if (mustChangePassword(request) && new URL(request.url).pathname !== "/account") {
        throw redirect("/account");
    }
    return null;
}

export default function ProtectedLayout() {
    return <Outlet />;
}
