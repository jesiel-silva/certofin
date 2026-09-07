import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { name, email, subject, message } = (body ?? {}) as Record<string, unknown>;

  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim() : "";
  const cleanSubject = typeof subject === "string" ? subject.trim() : "";
  const cleanMessage = typeof message === "string" ? message.trim() : "";

  if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
    return NextResponse.json(
      { error: "Preencha todos os campos (nome, e-mail, assunto e mensagem)." },
      { status: 400 }
    );
  }

  if (cleanName.length > 120) {
    return NextResponse.json({ error: "O nome deve ter no máximo 120 caracteres." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }

  if (cleanSubject.length > 200) {
    return NextResponse.json({ error: "O assunto deve ter no máximo 200 caracteres." }, { status: 400 });
  }

  if (cleanMessage.length > 2000) {
    return NextResponse.json({ error: "A mensagem deve ter no máximo 2000 caracteres." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("contact_messages").insert({
    name: cleanName,
    email: cleanEmail,
    subject: cleanSubject,
    message: cleanMessage,
    status: "pending",
  });

  if (error) {
    console.error("Erro ao salvar mensagem de contato:", error.message);
    return NextResponse.json(
      { error: "Não foi possível enviar sua mensagem. Tente novamente em instantes." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}