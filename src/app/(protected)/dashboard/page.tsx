import { redirect } from "next/navigation";

export default function DashboardRedirect() {
  redirect("/personal/dashboard");
}
