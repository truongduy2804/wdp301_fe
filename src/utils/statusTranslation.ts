// src/utils/statusTranslation.ts
export const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        "ACTIVE": "Hoạt động",
        "OFFLINE": "Ngoại tuyến",
        "BANNED": "Đã bị khoá",
        "EXPIRED": "Hết hạn",
        "PENDING": "Đang chờ duyệt"
    };

    return statusMap[status] || status;
};
