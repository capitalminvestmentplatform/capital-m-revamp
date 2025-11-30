"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export function useNotifications(email: string | null) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!email) return;
    try {
      const res = await fetch("/api/notifications");
      const result = await res.json();
      if (result.statusCode === 200) {
        const userNotifs = result.data.filter((n: any) => n.to === email);
        setNotifications(userNotifs);
        setUnreadCount(userNotifs.filter((n: any) => !n.read).length);
      }
    } catch (error) {
      console.error("Notification fetch error:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [email]);

  useEffect(() => {
    if (!email) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user-${email}`);
    const onNewNotification = (data: any) => {
      fetchNotifications();
      const audio = new Audio("/sounds/notification.mp3");
      audio.play().catch(() => {});
    };

    channel.bind("new-notification", onNewNotification);

    return () => {
      channel.unbind("new-notification", onNewNotification);
      pusher.unsubscribe(`user-${email}`);
      pusher.disconnect();
    };
  }, [email]);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    fetchNotifications();
  };

  const markOneRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    fetchNotifications();
  };

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAllRead,
    markOneRead,
  };
}
