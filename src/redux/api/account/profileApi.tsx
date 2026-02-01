// src/redux/api/account/profileApi.ts
import { baseApi } from "@/redux/api/baseApi";

export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export type AccountProfile = {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  status: string;
  createdAt: string;
};

export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

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
  useUpdateAccountProfileMutation,
  useChangePasswordMutation,
} = profileApi;
