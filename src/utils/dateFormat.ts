import dayjs from "dayjs";
import "dayjs/locale/vi"; // hỗ trợ tiếng Việt

dayjs.locale("vi");

/**
 * Chuyển đổi ngày sang định dạng "DD/MM/YYYY"
 */
export const formatDateShort = (date: string | Date) => {
  return dayjs(date).format("DD/MM/YYYY");
};

/**
 * Chuyển đổi ngày sang định dạng "DD MMMM YYYY"
 * Ví dụ: 15 Tháng Chín 2025
 */
export const formatDateLong = (date: string | Date) => {
  return dayjs(date).format("DD-MMMM-YYYY");
};

/**
 * Chuyển đổi ngày sang định dạng đầy đủ, có thứ
 * Ví dụ: Thứ Hai, 15 Tháng Chín 2025
 */
export const formatDateFull = (date: string | Date) => {
  return dayjs(date).format("dddd, DD MMMM YYYY");
};
