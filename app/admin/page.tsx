import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  const cookieStore = cookies();

  if (cookieStore.get(ADMIN_COOKIE_NAME)?.value !== "true") {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}