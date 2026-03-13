import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/page/componentUI";

type Props = {
  onClick: () => void;
  isFetching?: boolean;
  className?: string;
  label?: string;
  loadingLabel?: string;
};

export default function RefreshButton({
  onClick,
  isFetching = false,
  className = "",
  label = "Tải lại",
  loadingLabel = "Đang tải...",
}: Props) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={isFetching}
      className={`
        !rounded-2xl !px-3 !py-2 !bg-white !border !border-slate-200 !text-slate-800 !font-medium
        hover:!border-emerald-300 hover:!bg-emerald-50/60 hover:!text-emerald-800
        active:!bg-emerald-100/60 disabled:!opacity-70 disabled:!cursor-not-allowed
        transition-all duration-200 ease-out shadow-sm hover:shadow
        ${className}
      `}
    >
      <span className="inline-flex items-center gap-2">
        <RefreshCw
          className={`h-4 w-4 ${
            isFetching ? "animate-spin text-emerald-700" : "text-slate-600"
          }`}
        />
        {isFetching ? loadingLabel : label}
      </span>
    </Button>
  );
}
