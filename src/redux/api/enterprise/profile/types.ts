export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export type EnterpriseServiceArea = {
  id?: number;
  enterpriseId?: number;

  // swagger thường trả string
  provinceCode: string;
  districtCode: string;
  wardCode?: string | null;
};

export type EnterpriseWasteTypeCode =
  | "ORGANIC"
  | "RECYCLABLE"
  | "INORGANIC"
  | "HAZARDOUS"
  | "OTHER";

export type EnterpriseWasteType = {
  id?: number;
  enterpriseId?: number;
  wasteType: EnterpriseWasteTypeCode;
};

export type EnterpriseProfile = {
  id: number;

  // người đại diện/owner account
  fullName: string;
  email: string;
  phone: string | null;

  avatar: string | null;

  // doanh nghiệp
  name: string;
  address: string;

  latitude: number | null;
  longitude: number | null;

  capacityKg: number;

  status: string; // ACTIVE/...
  serviceAreas: EnterpriseServiceArea[];
  wasteTypes: EnterpriseWasteType[];

  createdAt: string;
};

export type UpdateEnterpriseProfileBody = {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  capacityKg: number;

  // có thể cập nhật phone của DN (tuỳ swagger bạn)
  phone?: string | null;

  serviceAreas: Array<{
    provinceCode: string;
    districtCode: string;
    wardCode?: string | null;
  }>;

  wasteTypes: Array<{
    wasteType: EnterpriseWasteTypeCode;
  }>;
};
