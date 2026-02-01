import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  connectSocket,
  disconnectSocket,
  subscribeNotification,
} from "@/utils/socket";
import { applyRealtimeNotification } from "@/redux/api/enterprise/notifications/realTime";
import type { NotificationItem } from "@/redux/api/enterprise/notifications/types";

export default function NotificationsSocketBootstrap({
  userId,
}: {
  userId?: number | null;
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    connectSocket(userId);

    const unsub = subscribeNotification((data: NotificationItem) => {
      applyRealtimeNotification(dispatch, data);
    });

    return () => {
      unsub();
      disconnectSocket();
    };
  }, [dispatch, userId]);

  return null;
}
