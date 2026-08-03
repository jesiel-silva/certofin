import { redirect } from "next/navigation";

export default function NewTransactionRedirect() {
  redirect("/personal/transactions/new");
}
