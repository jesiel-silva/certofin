"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2, AlertTriangle, Clock, TrendingUp, TrendingDown, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, type Notification } from "@/lib/hooks/use-notifications";

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

const scopeColors: Record<string, string> = {
  personal: "text-[var(--success)]",
  business: "text-[var(--primary)]",
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || typeColors.system;

  const getTrendIcon = () => {
    if (notification.type !== "comparison") return null;
    const trend = notification.metadata?.trend;
    if (trend === "up") return <TrendingUp className="h-3 w-3 text-[var(--success)]" />;
    if (trend === "down") return <TrendingDown className="h-3 w-3 text-[var(--destructive)]" />;
    return null;
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 border-b border-[var(--border)] p-3 transition-colors hover:bg-[var(--accent)]/50",
        !notification.is_read && "bg-[var(--primary)]/5"
      )}
    >
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("text-xs font-semibold truncate", !notification.is_read ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}>
            {notification.title}
          </p>
          {getTrendIcon()}
          {notification.scope && (
            <span className={cn("text-[9px] font-mono uppercase", scopeColors[notification.scope] || "")}>
              {notification.scope === "business" ? "NEG" : "PESS"}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)] line-clamp-2">
          {notification.message}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[9px] text-[var(--muted-foreground)]/60">
            {new Date(notification.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {!notification.is_read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="text-[9px] text-[var(--primary)] hover:underline flex items-center gap-0.5"
            >
              <Check className="h-2.5 w-2.5" /> lida
            </button>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(notification.id)}
        className="shrink-0 p-1 text-[var(--muted-foreground)]/40 hover:text-[var(--destructive)] opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 border transition-all z-50",
          isOpen
            ? "border-[var(--primary)]/50 bg-[var(--primary)]/10 shadow-[0_0_10px_var(--primary)]"
            : "border-[var(--primary)]/20 hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5"
        )}
      >
        <Bell className="h-4 w-4 text-[var(--primary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--destructive)] text-[8px] font-bold text-white shadow-[0_0_8px_var(--destructive)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Notificações</h3>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="rounded p-1 text-[10px] text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
                  title="Marcar todas como lidas"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 120px)" }}>
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="mx-auto h-8 w-8 text-[var(--muted-foreground)]/30" />
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-[var(--border)] px-4 py-2">
              <button
                onClick={clearAll}
                className="w-full text-center text-[10px] text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
              >
                Limpar todas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
