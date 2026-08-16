"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera, Loader2, Mail, Save, Shield, User } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/lib/types";

import { CancellationSurveyModal } from "@/components/account/cancellation-survey-modal";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function PersonalSettingsPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyAction, setSurveyAction] = useState<"cancel_subscription" | "delete_account">("cancel_subscription");

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || "");
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile(data as Profile);
          setAvatarUrl((data as Profile).avatar_url);
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, [supabase]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    setProfileMsg("");
    setProfileError("");

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: profile.full_name })
      .eq("id", profile.id);

    if (error) {
      setProfileError("Erro ao salvar: " + error.message);
      setSavingProfile(false);
      return;
    }

    setProfileMsg("Perfil atualizado com sucesso!");
    setSavingProfile(false);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!profile) return;
    if (!file.type.startsWith("image/")) {
      setProfileError("Selecione um arquivo de imagem (PNG, JPG, etc).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("A imagem deve ter no máximo 2MB.");
      return;
    }

    setUploadingAvatar(true);
    setProfileMsg("");
    setProfileError("");

    const path = `${profile.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setProfileError("Erro ao enviar imagem: " + uploadError.message);
      setUploadingAvatar(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl.publicUrl })
      .eq("id", profile.id);

    if (updateError) {
      setProfileError("Erro ao salvar avatar: " + updateError.message);
      setUploadingAvatar(false);
      return;
    }

    setAvatarUrl(publicUrl.publicUrl);
    setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl.publicUrl } : prev));
    setProfileMsg("Avatar atualizado!");
    setUploadingAvatar(false);
  };

  const handleSaveEmail = async () => {
    setSavingEmail(true);
    setEmailMsg("");
    setEmailError("");

    if (!email || !email.includes("@")) {
      setEmailError("Informe um e-mail válido.");
      setSavingEmail(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ email });

    if (error) {
      setEmailError("Erro ao alterar e-mail: " + error.message);
      setSavingEmail(false);
      return;
    }

    setEmailMsg(
      "Enviamos um link de confirmação para o novo e-mail. Ele será atualizado após a confirmação."
    );
    setSavingEmail(false);
  };

  const handleSavePassword = async () => {
    setSavingPassword(true);
    setPasswordMsg("");
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres.");
      setSavingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      setSavingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordError("Erro ao alterar senha: " + error.message);
      setSavingPassword(false);
      return;
    }

    setPasswordMsg("Senha alterada com sucesso!");
    setNewPassword("");
    setConfirmPassword("");
    setSavingPassword(false);
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email[0]?.toUpperCase() || "U";

  const isPro = profile?.subscription_status === "pro";
  const trialActive =
    profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/personal/dashboard"
          className="rounded-lg p-1 hover:bg-[var(--accent)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Perfil e Ajustes</h1>
          <p className="text-base text-[var(--muted-foreground)]">
            Gerencie suas informações pessoais e de segurança
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ─── Perfil ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--primary)]" />
              Dados do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full border-2 border-[var(--primary)]/50 object-cover shadow-[0_0_10px_var(--primary)]"
                />
              ) : (
                <div className="avatar-ring flex h-16 w-16 items-center justify-center bg-[var(--primary)]/10 border border-[var(--primary)]/50 text-lg font-mono font-bold text-[var(--primary)] shadow-[0_0_10px_var(--primary)]">
                  {initials}
                </div>
              )}
              <div className="flex-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="gap-2"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  {avatarUrl ? "Trocar foto" : "Enviar foto"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            <Input
              label="Nome completo"
              value={profile?.full_name || ""}
              onChange={(e) =>
                setProfile((prev) => (prev ? { ...prev, full_name: e.target.value } : prev))
              }
            />

            {profileMsg && (
              <p className="text-sm text-[var(--success)]">{profileMsg}</p>
            )}
            {profileError && (
              <p className="text-sm text-[var(--destructive)]">{profileError}</p>
            )}

            <Button
              type="button"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="gap-2"
            >
              {savingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Perfil
            </Button>
          </CardContent>
        </Card>

        {/* ─── Segurança ─── */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[var(--primary)]" />
                E-mail de acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-sm text-[var(--muted-foreground)]">
                Ao alterar o e-mail, você receberá um link de confirmação no novo
                endereço para ativar a troca.
              </p>
              {emailMsg && <p className="text-sm text-[var(--success)]">{emailMsg}</p>}
              {emailError && (
                <p className="text-sm text-[var(--destructive)]">{emailError}</p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveEmail}
                disabled={savingEmail}
                className="gap-2"
              >
                {savingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Alterar e-mail
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--primary)]" />
                Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nova senha"
                type="password"
                showPasswordToggle
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                showPasswordToggle
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {passwordMsg && (
                <p className="text-sm text-[var(--success)]">{passwordMsg}</p>
              )}
              {passwordError && (
                <p className="text-sm text-[var(--destructive)]">{passwordError}</p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleSavePassword}
                disabled={savingPassword}
                className="gap-2"
              >
                {savingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Alterar senha
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Plano ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[var(--primary)]" />
            Plano e Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={
                isPro
                  ? "rounded-full bg-[var(--warning)]/20 px-3 py-1 text-xs font-bold text-[var(--warning)] border border-[var(--warning)]/40"
                  : trialActive
                    ? "rounded-full bg-[var(--success)]/20 px-3 py-1 text-xs font-bold text-[var(--success)] border border-[var(--success)]/40"
                    : "rounded-full bg-[var(--muted)]/20 px-3 py-1 text-xs font-bold text-[var(--muted-foreground)] border border-[var(--border)]"
              }
            >
              {isPro ? "PLANO PRO" : trialActive ? "TRIAL PRO ATIVO" : "PLANO GRÁTIS"}
            </span>
            {trialActive && profile?.trial_ends_at && (
              <span className="text-sm text-[var(--muted-foreground)]">
                Trial expira em{" "}
                {new Date(profile.trial_ends_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Membro desde{" "}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </p>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]">
            <Link href="/personal/planos">
              <Button size="sm" variant="outline" className="gap-2">
                Gerenciar plano
              </Button>
            </Link>
            {(isPro || trialActive) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSurveyAction("cancel_subscription");
                  setShowSurveyModal(true);
                }}
                className="gap-2 text-[var(--warning)] hover:bg-[var(--warning)]/10 border-[var(--warning)]/30"
              >
                Cancelar assinatura PRO
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── Zona de Perigo ─── */}
      <Card className="border-[var(--destructive)]/40 bg-[var(--destructive)]/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--destructive)]">
            <AlertTriangle className="h-4 w-4" />
            Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[var(--muted-foreground)]">
            Ao excluir sua conta, todos os seus dados (lançamentos, categorias, histórico e configurações) serão permanentemente removidos.
          </p>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSurveyAction("delete_account");
                setShowSurveyModal(true);
              }}
              className="gap-2 border-[var(--destructive)]/50 text-[var(--destructive)] hover:bg-[var(--destructive)]/20"
            >
              <Trash2 className="h-4 w-4" />
              Excluir minha conta permanentemente
            </Button>
          </div>
        </CardContent>
      </Card>

      <CancellationSurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        actionType={surveyAction}
        userEmail={email}
      />
    </div>
  );
}