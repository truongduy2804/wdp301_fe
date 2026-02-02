import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  connectSocket,
  disconnectSocket,
  subscribeNotification,
} from "@/utils/socket";
import { applyRealtimeNotification } from "@/redux/api/enterprise/notifications/realtime";
import type { NotificationItem } from "@/redux/api/enterprise/notifications/types";

export default function NotificationsSocketBootstrap({
  userId,
}: {
  userId?: number | null;
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    console.log("🚀 Bootstrap socket with userId:", userId);
    connectSocket(userId);

    const unsub = subscribeNotification((data: NotificationItem) => {
      console.log("🧩 bootstrap got notification -> patch cache");
      applyRealtimeNotification(dispatch, data);
    });

    return () => {
      unsub();
      disconnectSocket();
    };
  }, [dispatch, userId]);

  return null;
}
