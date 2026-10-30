type AuthErrorLike = {
  message?: string | null;
  code?: string | null;
} | null | undefined;

const DEFAULT_MESSAGE = "Ocorreu um erro inesperado. Tente novamente.";

/**
 * Traduz erros do Supabase Auth para português brasileiro.
 * Verifica primeiro o `code` e depois o texto da mensagem.
 */
export function translateAuthError(error: AuthErrorLike): string {
  if (!error) return DEFAULT_MESSAGE;

  const code = error.code?.toLowerCase() ?? "";
  const msg = error.message?.toLowerCase() ?? "";

  const has = (...terms: string[]) =>
    terms.some((t) => code.includes(t) || msg.includes(t));

  if (has("invalid_credentials", "invalid login credentials", "invalid credentials")) {
    return "E-mail ou senha inválidos";
  }
  if (has("email_not_confirmed", "email not confirmed", "unconfirmed")) {
    return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada (e spam) e clique no link que enviamos.";
  }
  if (has("user_already_exists", "email_exists", "already registered", "already been registered")) {
    return "Este e-mail já está cadastrado";
  }
  if (has("same_password", "should be different from the old password")) {
    return "A nova senha deve ser diferente da senha atual";
  }
  if (has("weak_password", "password should be at least", "password is too weak")) {
    return "A senha é muito fraca. Use pelo menos 6 caracteres, combinando letras e números.";
  }
  if (has("over_email_send_rate_limit", "over_request_rate_limit", "rate limit", "too many requests")) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }
  if (has("for security purposes")) {
    return "Por segurança, aguarde alguns segundos antes de tentar novamente.";
  }
  if (has("email_address_invalid", "invalid email", "unable to validate email address", "invalid format")) {
    return "E-mail inválido";
  }
  if (has("otp_expired", "expired", "invalid_grant", "flow_state_not_found")) {
    return "O link expirou ou é inválido. Solicite um novo.";
  }
  if (has("session_not_found", "auth session missing", "session missing")) {
    return "Sua sessão expirou. Solicite um novo link e tente novamente.";
  }
  if (has("user_not_found", "user not found")) {
    return "Usuário não encontrado";
  }
  if (has("signup_disabled", "signups not allowed")) {
    return "Novos cadastros estão temporariamente desativados";
  }
  if (has("failed to fetch", "network", "fetch failed")) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }

  return DEFAULT_MESSAGE;
}
