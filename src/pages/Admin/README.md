// filepath: src/pages/admin/README.md

# Admin Overview Dashboard

## 📄 Overview

This is the main admin dashboard page showing system-wide statistics and metrics.

## 🗂️ Files Structure

```
src/
├── api/
│   ├── types/
│   │   └── admin.types.ts           # TypeScript interfaces
│   └── mock/
│       └── admin.mock.ts            # Mock API functions
│
├── components/Admin/Overview/
│   ├── AlertBox.tsx                 # System alerts based on KPIs
│   ├── KPICard.tsx                  # Individual KPI card component
│   ├── KPIGrid.tsx                  # Grid of KPI cards
│   ├── ReportTrendChart.tsx         # 7-day trend chart
│   ├── TopEnterpriseTable.tsx       # Top enterprises table
│   └── index.ts                     # Barrel export
│
└── pages/admin/
    └── AdminOverviewPage.tsx        # Main dashboard page
```

## 🎯 Features

- **KPI Metrics**: Total users, reports, complaints, waste collected
- **Alert System**: Automatic alerts based on thresholds
- **Trend Visualization**: 7-day line chart showing created vs completed reports
- **Top Performers**: Ranking table of top 5 enterprises
- **Manual Refresh**: Button to reload data
- **Loading States**: Spinner during data fetch
- **Error Handling**: Error messages with retry functionality

## 🔌 Current State: Mock API

The dashboard currently uses **mock data** from `src/api/mock/admin.mock.ts`.

### Mock Features:
- Simulates 800ms network delay
- 5% random error rate (for testing error handling)
- Generates realistic Vietnamese enterprise names
- Randomizes data slightly on each call for realism

## 🚀 Migration to Real API

When backend API is ready, follow these steps:

### 1. Create RTK Query Service

Create `src/api/services/admin.service.ts`:

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINT } from '../config';
import type { OverviewResponse } from '../types/admin.types';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_ENDPOINT,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getOverview: builder.query<OverviewResponse, void>({
      query: () => '/admin/overview',
    }),
  }),
});

export const { useGetOverviewQuery } = adminApi;
```

### 2. Update Redux Store

In `src/redux/store/store.ts`, add the API reducer:

```typescript
import { adminApi } from '@/api/services/admin.service';

export const store = configureStore({
  reducer: {
    // ... existing reducers
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminApi.middleware),
});
```

### 3. Update AdminOverviewPage

Replace the mock API call with RTK Query hook:

**BEFORE (Mock):**
```typescript
const [data, setData] = useState<OverviewResponse | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  mockGetOverview()
    .then(setData)
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
}, []);
```

**AFTER (Real API):**
```typescript
const { data, isLoading: loading, error, refetch } = useGetOverviewQuery();
```

That's it! Only **3 lines changed** in the component.

## 📊 API Contract

### Endpoint
```
GET /api/v1/admin/overview
```

### Response Type
```typescript
interface OverviewResponse {
  kpi: {
    totalUsers: number;
    totalReports: number;
    inProgressReports: number;
    completedReports: number;
    openComplaints: number;
    totalWasteKg: number;
  };
  trend: {
    date: string;        // "dd/mm" format
    created: number;
    completed: number;
  }[];
  topEnterprises: {
    id: string;
    name: string;
    completedReports: number;
    avatar?: string;
    completionRate?: number;
  }[];
}
```

### Example Response
```json
{
  "success": true,
  "data": {
    "kpi": {
      "totalUsers": 1248,
      "totalReports": 3542,
      "inProgressReports": 89,
      "completedReports": 3124,
      "openComplaints": 12,
      "totalWasteKg": 48750
    },
    "trend": [
      { "date": "25/02", "created": 45, "completed": 38 },
      { "date": "26/02", "created": 52, "completed": 44 },
      // ... 7 days total
    ],
    "topEnterprises": [
      {
        "id": "ENT-001",
        "name": "Công ty TNHH Tái Chế Xanh Việt Nam",
        "completedReports": 156,
        "completionRate": 94
      },
      // ... top 5 total
    ]
  }
}
```

## 🎨 Customization

### Change Alert Thresholds

In `AlertBox.tsx`, modify the threshold values:

```typescript
// Line 34
if (kpi.openComplaints > 10) {  // Change 10 to desired threshold
  alerts.push({ ... });
}
```

### Change Chart Colors

In `ReportTrendChart.tsx`, modify the stroke colors:

```typescript
// Line 66-67
stroke={CHART_COLORS.primary}  // Change to any color from constants
```

### Change KPI Icons

In `KPIGrid.tsx`, replace the icon imports:

```typescript
import { Users, FileText, Clock, ... } from 'lucide-react';
```

## 🧪 Testing Mock API

To test error handling:
1. Set `MOCK_ERROR_RATE = 0.5` in `src/api/config.ts` (50% error rate)
2. Refresh the page multiple times
3. Observe error messages and retry functionality

To test different data:
1. Edit `MOCK_OVERVIEW_DATA` in `src/api/mock/admin.mock.ts`
2. Change values to trigger different alerts
3. Refresh the page

## 📝 Notes

- All components are fully typed with TypeScript
- Components handle loading, error, and empty states
- Responsive design (mobile-first)
- Follows established Tailwind CSS patterns
- Prepared for easy migration to real API
