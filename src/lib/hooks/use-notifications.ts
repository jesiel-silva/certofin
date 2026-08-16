"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Notification {
  id: string;
  type: "overdue" | "due_soon" | "comparison" | "system";
  scope: "personal" | "business" | null;
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar notificações (sem regenerar automaticamente)
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        // Se a tabela não existe, simplesmente retorna vazio
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          setNotifications([]);
          return;
        }
        console.error("Erro ao buscar notificações:", error);
        return;
      }

      setNotifications(data || []);
    } catch {
      // Erro geral — ignora silenciosamente
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchNotifications();
    });

    // Refresh a cada 5 minutos
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch {
      // Tabela não existe ainda
    }
  };

  const markAllAsRead = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
      }
    } catch {
      // Tabela não existe ainda
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (!error) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch {
      // Tabela não existe ainda
    }
  };

  const clearAll = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);

      if (!error) {
        setNotifications([]);
      }
    } catch {
      // Tabela não existe ainda
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
