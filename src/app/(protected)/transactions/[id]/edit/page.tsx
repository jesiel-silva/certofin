import { redirect } from "next/navigation";

export default function EditTransactionRedirect() {
  redirect("/personal/transactions");
}
