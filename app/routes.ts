import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),
  route("login", "routes/login.tsx", { id: "login-page" }),

  // Protected Routes
  layout("routes/protected.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("create-qrcode", "routes/create-qrcode.tsx"),
    route("edit-qrcode/:id", "routes/edit-qrcode.tsx"),
    route("theme", "routes/theme.tsx"),
    route("users", "routes/users.tsx"),
    route("account", "routes/account.tsx"),
  ]),

  // Public Routes (at the end)
  route(":id/vcard", "routes/vcard-download.tsx"),
  route(":id", "routes/public-card.tsx"),
] satisfies RouteConfig;
