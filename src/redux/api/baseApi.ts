import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for API requests
const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Create base API with RTK Query
export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers) => {
            // Add auth token if exists
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Profile', 'Notifications', 'Reports', 'OrderAcceptance'],
    endpoints: () => ({}),
});

export default baseApi;
