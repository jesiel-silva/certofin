"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2, AlertTriangle, Clock, TrendingUp, TrendingDown, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, type Notification } from "@/lib/hooks/use-notifications";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useRouter } from "next/navigation";

const typeIcons: Record<string, typeof Bell> = {
  overdue: AlertTriangle,
  due_soon: Clock,
  comparison: TrendingUp,
  system: Info,
};

const typeColors: Record<string, string> = {
  overdue: "text-[var(--destructive)] bg-[var(--destructive)]/10",
  due_soon: "text-[var(--warning)] bg-[var(--warning)]/10",
  comparison: "text-[var(--primary)] bg-[var(--primary)]/10",
  system: "text-[var(--muted-foreground)] bg-[var(--accent)]",
};

const typeLabels: Record<string, string> = {
  overdue: "Vencida",
  due_soon: "Vencendo",
  comparison: "Comparativo",
  system: "Sistema",
};

const scopeColors: Record<string, string> = {
  personal: "text-[var(--success)]",
  business: "text-[var(--primary)]",
};

function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || typeColors.system;

  const transactionId = notification.metadata?.transaction_id;
  const hasTransactionLink =
    (notification.type === "overdue" || notification.type === "due_soon") &&
    Boolean(transactionId);

  const handleCardClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (hasTransactionLink) {
      const targetScope = notification.scope === "business" ? "business" : "personal";
      router.push(`/${targetScope}/transactions?highlight=${transactionId}`);
    }
  };

  const getTrendIcon = () => {
    if (notification.type !== "comparison") return null;
    const trend = notification.metadata?.trend;
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-[var(--success)]" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-[var(--destructive)]" />;
    return null;
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group flex items-start gap-4 rounded-lg border p-4 transition-all hover:bg-[var(--accent)]/50",
        hasTransactionLink && "cursor-pointer hover:border-[var(--primary)]/50",
        !notification.is_read
          ? "border-[var(--primary)]/30 bg-[var(--primary)]/5"
          : "border-[var(--border)]"
      )}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn("text-base font-semibold", !notification.is_read ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}>
            {notification.title}
          </p>
          {getTrendIcon()}
          <span className={cn("text-xs font-mono uppercase px-1.5 py-0.5 rounded", typeColors[notification.type])}>
            {typeLabels[notification.type]}
          </span>
          {notification.scope && (
            <span className={cn("text-xs font-mono uppercase", scopeColors[notification.scope])}>
              {notification.scope === "business" ? "Negócio" : "Pessoal"}
            </span>
          )}
        </div>
        <p className="mt-1 text-base text-[var(--muted-foreground)]">
          {notification.message}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-sm text-[var(--muted-foreground)]/60">
            {new Date(notification.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!notification.is_read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="rounded p-1.5 text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
            title="Marcar como lida"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        {notification.is_read && (
          <div className="rounded p-1.5 text-[var(--success)]/50">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="rounded p-1.5 text-[var(--muted-foreground)]/40 hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 opacity-0 group-hover:opacity-100 transition-all"
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll, refresh } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = filter === "unread"
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/personal/dashboard"
            className="rounded-lg p-1 hover:bg-[var(--accent)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Notificações</h1>
            <p className="text-base text-[var(--muted-foreground)]">
              {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}` : "Todas lidas"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refresh}
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            Atualizar
          </Button>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearAll}
              className="gap-2 text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
            >
              <Trash2 className="h-4 w-4" />
              Limpar todas
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-lg px-4 py-2 text-base font-medium transition-colors",
            filter === "all"
              ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30"
              : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] border border-transparent"
          )}
        >
          Todas ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={cn(
            "rounded-lg px-4 py-2 text-base font-medium transition-colors",
            filter === "unread"
              ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30"
              : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] border border-transparent"
          )}
        >
          Não lidas ({unreadCount})
        </button>
      </div>

      {/* Lista */}
      <Card>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="mx-auto h-12 w-12 text-[var(--muted-foreground)]/30" />
              <p className="mt-4 text-xl font-medium text-[var(--foreground)]">
                {filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
              </p>
              <p className="mt-1 text-base text-[var(--muted-foreground)]">
                {filter === "unread"
                  ? "Todas as notificações foram lidas"
                  : "Quando houver novidades, elas aparecerão aqui"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {filteredNotifications.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
