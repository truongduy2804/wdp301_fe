import { baseApi } from "@/redux/api/baseApi";
import type {
  ApiResponse,
  EnterpriseProfile,
  UpdateEnterpriseProfileBody,
} from "./types";

function normalizeEnterpriseProfile(d: any): EnterpriseProfile {
  const serviceAreas = (d?.serviceAreas ?? []).map((x: any) => ({
    ...x,
    // normalize về string để SearchSelect match đúng
    provinceCode: String(x?.provinceCode ?? ""),
    districtCode: String(x?.districtCode ?? ""),
    wardCode: x?.wardCode == null ? null : String(x?.wardCode),
  }));

  const wasteTypes = (d?.wasteTypes ?? []).map((x: any) => ({
    ...x,
    wasteType: String(x?.wasteType ?? "OTHER"),
  }));

  return {
    ...d,
    latitude: d?.latitude ?? null,
    longitude: d?.longitude ?? null,
    phone: d?.phone ?? null,
    avatar: d?.avatar ?? null,
    serviceAreas,
    wasteTypes,
  } as EnterpriseProfile;
}

export const enterpriseProfileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEnterpriseProfile: build.query<EnterpriseProfile, void>({
      query: () => ({
        url: "enterprise/profile",
        method: "GET",
      }),
      transformResponse: (res: ApiResponse<any>) => {
        return normalizeEnterpriseProfile(res?.data ?? {});
      },
      providesTags: ["EnterpriseProfile"],
    }),

    updateEnterpriseProfile: build.mutation<
      EnterpriseProfile,
      UpdateEnterpriseProfileBody
    >({
      query: (body) => ({
        url: "enterprise/profile",
        method: "PUT",
        body,
      }),
      transformResponse: (res: ApiResponse<any>) => {
        return normalizeEnterpriseProfile(res?.data ?? {});
      },
      invalidatesTags: ["EnterpriseProfile"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEnterpriseProfileQuery,
  useUpdateEnterpriseProfileMutation,
} = enterpriseProfileApi;
