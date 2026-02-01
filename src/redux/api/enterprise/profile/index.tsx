import { baseApi } from "@/redux/api/baseApi";
import type {
  ApiResponse,
  EnterpriseProfile,
  UpdateEnterpriseProfileBody,
} from "./types";

export const enterpriseProfileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEnterpriseProfile: build.query<EnterpriseProfile, void>({
      query: () => ({
        url: "enterprise/profile",
        method: "GET",
      }),
      transformResponse: (res: ApiResponse<any>) => {
        const d = res.data ?? {};
        const fixed: EnterpriseProfile = {
          ...d,
          latitude: d.latitude ?? null,
          longitude: d.longitude ?? null,
          phone: d.phone ?? null,
          avatar: d.avatar ?? null,
          serviceAreas: d.serviceAreas ?? [],
          wasteTypes: d.wasteTypes ?? [],
        };
        return fixed;
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
        body, // nếu axiosBaseQuery cần "data", đổi thành data: body
      }),
      transformResponse: (res: ApiResponse<any>) => {
        const d = res.data ?? {};
        const fixed: EnterpriseProfile = {
          ...d,
          latitude: d.latitude ?? null,
          longitude: d.longitude ?? null,
          phone: d.phone ?? null,
          avatar: d.avatar ?? null,
          serviceAreas: d.serviceAreas ?? [],
          wasteTypes: d.wasteTypes ?? [],
        };
        return fixed;
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
