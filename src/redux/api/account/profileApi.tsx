// src/redux/api/account/profileApi.ts
import { baseApi } from "@/redux/api/baseApi";
import type { ApiResponse, AccountProfile, ChangePasswordBody } from "./types";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAccountProfile: build.query<AccountProfile, void>({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      transformResponse: (res: ApiResponse<AccountProfile>) => res.data,
      providesTags: ["AccountProfile"],
    }),

    updateAccountProfile: build.mutation<
      AccountProfile,
      { fullName: string; phone: string; avatarFile?: File | null }
    >({
      query: ({ fullName, phone, avatarFile }) => {
        const fd = new FormData();
        fd.append("fullName", fullName ?? "");
        fd.append("phone", phone ?? "");
        if (avatarFile) fd.append("avatar", avatarFile);

        return {
          url: "profile",
          method: "PATCH",
          body: fd, // fetchBaseQuery dùng body
        };
      },
      transformResponse: (res: ApiResponse<AccountProfile>) => res.data,
      invalidatesTags: ["AccountProfile"],
    }),

    changePassword: build.mutation<void, ChangePasswordBody>({
      query: (body) => ({
        url: "profile/change-password",
        method: "PUT",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAccountProfileQuery,
  useLazyGetAccountProfileQuery,
  useUpdateAccountProfileMutation,
  useChangePasswordMutation,
} = profileApi;
