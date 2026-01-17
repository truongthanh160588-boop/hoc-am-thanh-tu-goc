# 📊 BÁO CÁO DỰ ÁN: HỌC ÂM THANH TỪ GỐC

**Ngày cập nhật:** 2024  
**Phiên bản:** 2.0.0  
**Trạng thái:** ✅ Production Ready (Deployed trên Vercel)  
**URL Production:** `https://hoc-am-thanh-tu-goc.vercel.app`

---

## 🎯 TỔNG QUAN DỰ ÁN

**Học Âm Thanh Từ Gốc** là một nền tảng học tập trực tuyến (PWA) chuyên về âm thanh, được xây dựng với **Next.js 14**, **TypeScript**, và **Supabase**. Dự án cung cấp khóa học "Học trọn đời" với **20 bài học** từ cơ bản đến nâng cao, kèm theo hệ thống **tự đánh giá**, theo dõi tiến độ, và hỗ trợ trực tiếp qua Zalo.

### Triết Lý Khóa Học

> **"Không dạy để nhớ – dạy để hiểu – hiểu để làm được.  
> Không hiểu thì hỏi trực tiếp – không ai bỏ rơi ai."**

### Đối Tượng

- Người đã đi làm, chơi âm thanh, kinh doanh âm thanh
- Không phải học sinh – không cần điểm số – không cần thi viết dài
- Mục tiêu: **xem đủ → hiểu → làm được**

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Tech Stack

**Frontend:**
- Next.js 14.2.0 (App Router)
- React 18.3.0
- TypeScript 5
- Tailwind CSS 3.4.1
- shadcn/ui (Component library)
- lucide-react 0.400.0 (Icons)

**Backend & Database:**
- Supabase (PostgreSQL + Auth + RLS)
- Next.js API Routes (Server-side)
- `@supabase/supabase-js 2.39.0`
- `@supabase/ssr 0.1.0`

**PWA:**
- next-pwa 5.6.0 (Service Worker)
- Web App Manifest
- Workbox (runtime caching)

**Utilities:**
- class-variance-authority 0.7.0
- clsx 2.1.1 + tailwind-merge 2.4.0
- sharp 0.34.5 (Image processing)

### Cấu Trúc Thư Mục

```
hoc-am-thanh-tu-goc/
├── app/                          # Next.js App Router
│   ├── account/
│   │   └── billing/              # Trang hóa đơn (protected)
│   ├── admin/
│   │   ├── keygen/               # Key Generator (admin only)
│   │   ├── purchases/            # Duyệt đơn hàng (admin only)
│   │   └── page.tsx              # Admin dashboard
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin APIs
│   │   │   ├── activations/      # List activations
│   │   │   ├── purchases/        # List/Update purchases
│   │   │   └── revoke-device/    # Revoke device activation
│   │   ├── check-activation/     # Check activation status
│   │   ├── generate-key/         # Generate activation key (admin)
│   │   ├── purchases/            # Purchase APIs
│   │   │   ├── create/           # Create purchase
│   │   │   └── status/            # Get purchase status
│   │   ├── verify-key/           # Verify activation key
│   │   └── video-call/
│   │       └── booking/          # Book video call
│   ├── auth/
│   │   ├── callback/             # Supabase OAuth callback
│   │   └── page.tsx              # Đăng nhập (Email + OTP)
│   ├── courses/
│   │   ├── [courseId]/
│   │   │   └── page.tsx          # Chi tiết khóa học + Mua khóa học
│   │   └── page.tsx              # Danh sách khóa học
│   ├── learn/
│   │   └── [courseId]/
│   │       └── [lessonId]/
│   │           ├── layout.tsx    # Server guard (paid + activated)
│   │           └── page.tsx      # Trang học bài (Video + Self Assessment)
│   ├── offline/
│   │   └── page.tsx              # Trang offline fallback
│   ├── globals.css               # Global styles + Titan theme
│   ├── layout.tsx                # Root layout (metadata, PWA icons)
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── ActivationCard.tsx        # Device activation UI (deprecated)
│   ├── LessonSelfAssessment.tsx  # Self-assessment cho từng bài
│   ├── LessonSidebar.tsx         # Sidebar danh sách bài học
│   ├── PracticeToolPanel.tsx     # Link đến công cụ thực hành
│   ├── ProgressBar.tsx           # Progress bar tổng khóa học
│   ├── SelfAssessmentPanel.tsx   # Self-assessment cho cụm bài
│   ├── VideoCallBooking.tsx       # Form đăng ký video call
│   └── YouTubeEmbed.tsx          # YouTube video player với tracking
├── lib/
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Client-side client
│   │   ├── server.ts             # Server-side client
│   │   ├── service.ts            # Service role client (admin only)
│   │   └── middleware.ts         # Middleware client
│   ├── auth-supabase.ts          # Auth helpers
│   ├── cluster-progress.ts       # Cluster-based progress tracking
│   ├── courseStore.ts            # Course data store
│   ├── guard.ts                  # Lesson access guards
│   ├── learn-guard.ts            # Learn page guards
│   ├── lesson-watched.ts         # Lesson watched state
│   ├── progress.ts               # Progress tracking (localStorage)
│   ├── progress-supabase.ts      # Progress tracking (Supabase)
│   ├── purchases.ts              # Purchase helpers (server-only)
│   ├── watch-time.ts             # Watch time tracking
│   └── ...                       # Other utilities
├── data/
│   └── course.ts                 # Course data (20 lessons)
├── supabase/
│   └── schema.sql                # Database schema
├── public/                       # Static assets
│   ├── icons/                    # PWA icons
│   ├── manifest.webmanifest      # PWA manifest
│   └── ...
└── scripts/
    └── generate-icons.js         # Icon generation script
```

---

## 🗄️ DATABASE SCHEMA

### Tables

#### 1. `profiles`
User profiles với role-based access control.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies:**
- Users can view/update own profile
- Admins can view all profiles (via service role)

#### 2. `purchases`
Purchase records với status tracking.

```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
  amount NUMERIC DEFAULT 0,
  note TEXT,
  proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);
```

**RLS Policies:**
- Users can view own purchases
- Users can insert own purchases (only 'pending')
- Admins can view/update all purchases

**Indexes:**
- `idx_purchases_user_id` on `user_id`
- `idx_purchases_status` on `status`
- `idx_purchases_course_id` on `course_id`

#### 3. `progress`
Learning progress tracking.

```sql
CREATE TABLE progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  unlocked_lesson_index INTEGER DEFAULT 0,
  completed_lessons JSONB DEFAULT '[]',
  watch_seconds JSONB DEFAULT '{}',  -- {lessonId: seconds}
  self_assessments JSONB DEFAULT '{}',  -- {lessonId: {understandPercent, timestamp}}
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);
```

**RLS Policies:**
- Users can view/update own progress

**Indexes:**
- `idx_progress_user_course` on `(user_id, course_id)`

#### 4. `video_call_bookings`
Video call booking requests.

```sql
CREATE TABLE video_call_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  cluster_number INTEGER NOT NULL,
  phone TEXT NOT NULL,
  preferred_time TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies:**
- Users can view/insert own bookings
- Admins can view/update all bookings

---

## 🔌 API ROUTES

### Public APIs

#### `POST /api/purchases/create`
Tạo purchase mới (pending).

**Request:**
```json
{
  "courseId": "audio-goc-01",
  "amount": 1000000,
  "note": "Chuyển khoản ngân hàng"
}
```

**Response:**
```json
{
  "success": true,
  "purchase": {
    "id": "...",
    "status": "pending",
    ...
  }
}
```

#### `GET /api/purchases/status?courseId=...`
Lấy purchase status của user hiện tại.

**Response:**
```json
{
  "purchase": {
    "status": "paid",
    ...
  }
}
```

#### `POST /api/verify-key`
Verify activation key (deprecated - không còn dùng).

#### `GET /api/check-activation?courseId=...`
Check activation status (deprecated - không còn dùng).

### Admin APIs

#### `GET /api/admin/purchases?status=pending`
List purchases (admin only).

**Response:**
```json
{
  "purchases": [
    {
      "id": "...",
      "user_email": "...",
      "course_id": "...",
      "status": "pending",
      ...
    }
  ]
}
```

#### `POST /api/admin/purchases/update`
Update purchase status (admin only).

**Request:**
```json
{
  "purchaseId": "...",
  "status": "paid"  // or "rejected"
}
```

#### `POST /api/video-call/booking`
Book video call.

**Request:**
```json
{
  "courseId": "audio-goc-01",
  "clusterNumber": 1,
  "phone": "0123456789",
  "preferredTime": "Tối thứ 2",
  "note": "Cần hỗ trợ về phase"
}
```

---

## 🎨 COMPONENTS & UI

### Core Components

#### `LessonSelfAssessment`
Component tự đánh giá cho từng bài học.

**Props:**
- `lessonId`, `courseId`, `userId`
- `watchPercent`, `watchSeconds`, `requiredSeconds`
- `isWatched`: boolean
- `onMarkWatched`: () => void
- `onContinue`: () => void

**Features:**
- Hiển thị % đã xem video
- Nút "Đánh dấu đã xem" (chỉ bật khi ≥ 85%)
- Tự đánh giá mức độ hiểu (0%, 50%, 70%, 85%, 100%)
- Nếu hiểu < 70% → hiện VideoCallBooking
- Nếu hiểu ≥ 70% → hiện nút "Tiếp tục bài tiếp theo"

#### `SelfAssessmentPanel`
Component tự đánh giá cho cụm bài (5 bài/cụm).

**Features:**
- 3 câu hỏi tự đánh giá:
  1. % nội dung đã xem
  2. % mức độ hiểu
  3. Phần nào còn mơ hồ nhất (optional)
- Unlock cụm tiếp theo nếu hiểu ≥ 70%
- Video call booking nếu hiểu < 70%

#### `YouTubeEmbed`
YouTube video player với watch time tracking.

**Features:**
- YouTube IFrame API integration
- Real-time watch time tracking
- Fallback iframe nếu API không load
- Update watch time mỗi 2 giây
- Debounced updates (5 giây)

#### `VideoCallBooking`
Form đăng ký video call 1-1.

**Fields:**
- Phone (required)
- Preferred time (optional)
- Note (optional)

**Flow:**
- Submit → API `/api/video-call/booking`
- Success → Callback `onBookingComplete`
- Vẫn cho phép tiếp tục sau khi booking

#### `LessonSidebar`
Sidebar danh sách bài học.

**Features:**
- Hiển thị tất cả 20 bài học
- Trạng thái: locked/unlocked/completed
- Practice Tool Panel (sau Lesson 3)
- Link đến từng bài học

### UI Components (shadcn/ui)

- `Button` - Buttons với variants
- `Card` - Card container
- `Progress` - Progress bar
- `Accordion` - FAQ accordion
- `Alert` - Alert messages
- `Badge` - Badges/labels
- `Input` - Input fields
- `Sheet` - Sidebar sheet (mobile)
- `Toast` - Toast notifications

---

## 🔄 LUỒNG HOẠT ĐỘNG

### 1. Luồng Mua Khóa Học

```
User → /courses/[courseId]
  ↓
Chưa login → Redirect /auth
  ↓
Đã login → Check purchase status
  ↓
Chưa mua → Hiện nút "Đăng ký khóa học"
  ↓
Click → POST /api/purchases/create
  ↓
Status = "pending"
  ↓
Admin → /admin/purchases → Approve
  ↓
Status = "paid" → User có thể học
```

### 2. Luồng Học Bài

```
User → /learn/[courseId]/[lessonId]
  ↓
Server Guard (layout.tsx):
  - Check auth
  - Check purchase.status = 'paid'
  ↓
Client Load:
  - Load user
  - Load progress
  - Load watch time
  ↓
Step 1: Xem Video
  - YouTubeEmbed tracks watch time
  - Update mỗi 2 giây
  - Sync to DB mỗi 10 giây
  ↓
Step 2: Tự Đánh Giá Nhanh
  - Hiển thị % đã xem
  - Nút "Đánh dấu đã xem" (≥ 85%)
  - Tự đánh giá mức độ hiểu
  ↓
Nếu hiểu ≥ 70%:
  - Nút "Tiếp tục bài tiếp theo"
  - Unlock bài tiếp theo
  ↓
Nếu hiểu < 70%:
  - Hiện VideoCallBooking
  - Sau booking → vẫn cho tiếp tục
```

### 3. Luồng Tự Đánh Giá Cụm Bài

```
Sau khi hoàn thành 5 bài trong cụm:
  ↓
Hiện SelfAssessmentPanel
  ↓
3 câu hỏi:
  1. % nội dung đã xem
  2. % mức độ hiểu
  3. Phần nào còn mơ hồ nhất
  ↓
Nếu hiểu ≥ 70%:
  - Unlock cụm tiếp theo
  ↓
Nếu hiểu < 70%:
  - Hiện VideoCallBooking
  - Sau booking → unlock cụm tiếp theo
```

### 4. Luồng Watch Time Tracking

```
YouTubeEmbed:
  - Load YouTube IFrame API
  - Init player
  - Track currentTime mỗi 2 giây
  ↓
onWatchTimeUpdate(currentTime, duration):
  - Update localStorage (watch-time.ts)
  - Debounced update (5 giây)
  ↓
Sync to Supabase:
  - updateWatchTimeSupabase()
  - Store max(currentTime) per lesson
  - Update mỗi 10 giây
```

---

## 🔐 SECURITY & GUARDS

### Server-Side Guards

#### `app/learn/[courseId]/[lessonId]/layout.tsx`
Server component guard cho learn pages.

**Checks:**
1. Authentication (must be logged in)
2. Purchase status (must be 'paid')
3. Lesson unlock (must unlock previous lessons)

**Redirects:**
- Not logged in → `/auth`
- Not purchased → `/courses/[courseId]`
- Lesson locked → `/courses/[courseId]`

#### `app/admin/*/layout.tsx`
Server component guard cho admin pages.

**Checks:**
- User must have `profiles.role = 'admin'`

**Redirects:**
- Not admin → `/courses`

### Client-Side Guards

#### `lib/learn-guard.ts`
Client-side guard helpers.

**Functions:**
- `checkLearnAccess()` - Check if user can access lesson
- Supports `is_preview` lessons (no payment required)

#### `lib/guard.ts`
Lesson access guards.

**Functions:**
- `canAccessLesson()` - Check lesson unlock status
- `getLessonIndex()` - Get lesson index from ID

---

## 📊 DATA FLOW

### Progress Tracking

**LocalStorage (watch-time.ts):**
```typescript
{
  watchSeconds: number,
  videoDuration: number,
  lastUpdated: number
}
```

**Supabase (progress table):**
```json
{
  "watch_seconds": {
    "lesson01": 1200,
    "lesson02": 1800,
    ...
  },
  "unlocked_lesson_index": 5,
  "completed_lessons": ["lesson01", "lesson02"],
  "self_assessments": {
    "lesson01": {
      "understandPercent": 85,
      "timestamp": 1234567890
    }
  }
}
```

### Purchase Flow

**States:**
- `pending` - Chờ admin duyệt
- `paid` - Đã duyệt, có thể học
- `rejected` - Bị từ chối

**RLS:**
- Users chỉ có thể tạo `pending` purchases
- Admins có thể update status

---

## 🚀 DEPLOYMENT

### Vercel Deployment

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
ACTIVATION_SECRET=xxx (deprecated)
```

**Build Settings:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Node Version: 20.x

**Auto Deploy:**
- Push to `main` branch → Auto deploy
- Preview deployments cho PRs

### Database Setup

1. Run `supabase/schema.sql` trên Supabase SQL Editor
2. Enable RLS cho tất cả tables
3. Create admin user:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid';
   ```

---

## 🔧 NÂNG CẤP & THÊM TÍNH NĂNG

### Thêm Bài Học Mới

**File:** `data/course.ts`

```typescript
// Thêm vào mảng titles
const titles = [
  // ... existing titles
  "Bài học mới",  // Bài 21
];

// Thêm vào mảng youtubeIds
const youtubeIds = [
  // ... existing IDs
  "NEW_YOUTUBE_ID",  // Bài 21
];
```

### Thêm API Route Mới

**File:** `app/api/[route-name]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Your logic here
  
  return NextResponse.json({ success: true });
}
```

### Thêm Component Mới

**File:** `components/NewComponent.tsx`

```typescript
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

export function NewComponent() {
  // Your component logic
  return <Card>...</Card>;
}
```

### Thêm Database Table

1. **Update Schema:** `supabase/schema.sql`
2. **Add RLS Policies**
3. **Create Helper:** `lib/new-table.ts` (server-only)
4. **Create API:** `app/api/new-table/route.ts`

### Thêm Guard Mới

**File:** `lib/new-guard.ts`

```typescript
import { createClient } from "@/lib/supabase/server";

export async function checkNewAccess(userId: string): Promise<boolean> {
  const supabase = createClient();
  // Your check logic
  return true;
}
```

**Usage trong layout:**
```typescript
// app/[route]/layout.tsx
const hasAccess = await checkNewAccess(user.id);
if (!hasAccess) {
  redirect("/unauthorized");
}
```

---

## 🐛 TROUBLESHOOTING

### Video không track watch time

**Nguyên nhân:**
- YouTube IFrame API không load
- Player chưa ready

**Giải pháp:**
- Check console logs
- Fallback iframe đã được implement
- Check `watch-time.ts` localStorage

### Purchase không hiển thị

**Nguyên nhân:**
- RLS policy chặn
- User chưa login

**Giải pháp:**
- Check Supabase RLS policies
- Check user session
- Check API response

### Admin không truy cập được

**Nguyên nhân:**
- `profiles.role` chưa set 'admin'

**Giải pháp:**
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid';
```

### Build lỗi TypeScript

**Nguyên nhân:**
- Type mismatch
- Missing imports

**Giải pháp:**
- Check `tsconfig.json`
- Run `npm run build` để xem errors
- Fix type definitions

---

## 📝 NOTES QUAN TRỌNG

### Deprecated Features

1. **Device Activation System** - Đã bỏ, không còn dùng
   - Files: `ActivationCard.tsx`, `app/api/generate-key`, `app/api/verify-key`
   - Có thể xóa sau này

2. **Quiz System** - Đã thay bằng Self Assessment
   - Files: `QuizPanel.tsx` (có thể xóa)
   - Data: `quiz` field trong `Lesson` interface (có thể xóa)

### Current Features

1. **Self Assessment** - Hệ thống mới
   - Per lesson: `LessonSelfAssessment`
   - Per cluster: `SelfAssessmentPanel`

2. **Watch Time Tracking** - Chính xác với YouTube API
   - Minimum: 85% video duration
   - Real-time updates

3. **Video Call Booking** - Hỗ trợ 1-1
   - Trigger khi hiểu < 70%
   - Vẫn cho tiếp tục sau booking

### Best Practices

1. **Server-Side Guards** - Luôn check ở server
2. **RLS Policies** - Bảo mật database
3. **TypeScript** - Strict mode enabled
4. **Error Handling** - Try-catch trong API routes
5. **Debouncing** - Watch time updates
6. **LocalStorage Fallback** - Offline support

---

## 📚 TÀI LIỆU THAM KHẢO

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)

---

**Lưu ý:** Báo cáo này được cập nhật lần cuối vào 2024. Khi nâng cấp dự án, vui lòng cập nhật báo cáo này để đảm bảo tính chính xác.
