import { useCallback, useState } from "react";
import type { ConfirmTone } from "@/pages/Enterprise/components/confirmModal";

export type ConfirmConfig = {
  title: React.ReactNode;
  content: React.ReactNode;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  tone?: ConfirmTone;
  onOk?: () => Promise<void> | void;
};

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cfg, setCfg] = useState<ConfirmConfig | null>(null);

  const ask = useCallback((next: ConfirmConfig) => {
    setCfg(next);
    setLoading(false);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    if (loading) return;
    setOpen(false);
  }, [loading]);

  const ok = useCallback(async () => {
    if (!cfg?.onOk || loading) return;

    try {
      setLoading(true);
      await cfg.onOk();
      setOpen(false);
    } catch {
      // giữ modal mở nếu lỗi
    } finally {
      setLoading(false);
    }
  }, [cfg, loading]);

  return { open, loading, cfg, ask, close, ok };
}
