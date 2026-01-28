import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";

export const metadata = {
  title: "Admin Login",
  description: "Sign in to access the admin dashboard",
};

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/admin/dashboard");
  }

  return <LoginForm />;
}
