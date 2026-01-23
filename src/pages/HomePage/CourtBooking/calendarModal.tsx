import React, { useState } from "react";
import { Modal, DatePicker, ConfigProvider } from "antd";
import dayjs, { Dayjs } from "dayjs";

interface CalendarModalProps {
  open: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void; // format YYYY-MM-DD
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  open,
  onClose,
  onSelectDate,
}) => {
  const [selected, setSelected] = useState<Dayjs | null>(dayjs());

  const handleOk = () => {
    if (selected) {
      onSelectDate(selected.format("YYYY-MM-DD"));
    }
    onClose();
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1e9ea1"
        },
      }}
    >
      <Modal
        title="Chọn ngày"
        open={open}
        onCancel={onClose}
        onOk={handleOk}
        okText="Xác nhận"
        cancelText="Hủy"
        centered={false}
        style={{ top: 180 }}
        width={500}
      >
        <DatePicker
          size="large"
          value={selected}
          onChange={(date: Dayjs | null) => setSelected(date)}
          format="DD/MM/YYYY"
          style={{ width: "100%", height: "40px", fontSize: "20px" }}
        />
      </Modal>
    </ConfigProvider>
  );
};

export default CalendarModal;
