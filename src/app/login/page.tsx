import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getAuthConfigStatus, isAdminAuthenticated } from "@/lib/auth";

export default async function LoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/");
  }

  return <LoginForm config={getAuthConfigStatus()} />;
}
