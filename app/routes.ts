import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),
  route("login", "routes/login.tsx", { id: "login-page" }),
  route("dashboard", "routes/dashboard.tsx"),
  route("create-qrcode", "routes/create-qrcode.tsx"),
  route("edit-qrcode/:id", "routes/edit-qrcode.tsx"),
  route("theme", "routes/theme.tsx"),
  route("users", "routes/users.tsx"),
  route("account", "routes/account.tsx"),
  route(":id", "routes/public-card.tsx"),
] satisfies RouteConfig;
