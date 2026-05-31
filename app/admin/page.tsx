import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();

  if (cookieStore.get(ADMIN_COOKIE_NAME)?.value !== "true") {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}