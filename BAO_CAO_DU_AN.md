# 📊 BÁO CÁO DỰ ÁN: HỌC ÂM THANH TỪ GỐC

**Ngày tạo báo cáo:** 2024  
**Phiên bản:** 0.1.0  
**Trạng thái:** ✅ Production Ready (Deployed trên Vercel)

---

## 🎯 TỔNG QUAN DỰ ÁN

**Học Âm Thanh Từ Gốc** là một nền tảng học tập trực tuyến (PWA) chuyên về âm thanh, được xây dựng với Next.js 14, TypeScript, và Supabase. Dự án cung cấp khóa học "Học trọn đời" với 20 bài học từ cơ bản đến nâng cao, kèm theo hệ thống quiz, theo dõi tiến độ, và hỗ trợ trực tiếp qua Zalo.

**URL Production:** `https://hoc-am-thanh-tu-goc.vercel.app`

---

## 🚀 TÍNH NĂNG ĐÃ HOÀN THÀNH

### 1. ✅ PWA (Progressive Web App)
- **Service Worker** với `next-pwa` (v5.6.0)
- **Web App Manifest** (`manifest.webmanifest`) với đầy đủ metadata
- **Icons** đầy đủ (192x192, 512x512) cho iOS và Android
- **Offline support** với trang `/offline` fallback
- **Install banner** tự động cho Chrome/Android và hướng dẫn iOS Safari
- **Caching strategy**:
  - YouTube videos: NetworkFirst với cache 7 ngày
  - Static assets: NetworkFirst với cache 1 ngày
  - Offline fallback document
- **Runtime caching** cho tất cả requests
- **Skip waiting** và **register** tự động

### 2. ✅ Authentication & User Management
- **Supabase Auth** tích hợp đầy đủ với `@supabase/ssr`
- **Email + OTP** (Magic Link) - phương thức chính
- **Email + Password** - phương thức phụ
- **Session management** với middleware tự động refresh
- **Auto redirect** sau login/logout
- **User profile** lưu trên Supabase (`profiles` table)
- **Auth callback** handler tại `/auth/callback`
- **Protected routes** với guard middleware

### 3. ✅ Course Management
- **20 bài học** với video YouTube embed
- **Quiz trắc nghiệm** sau mỗi bài (5 câu hỏi, ≥80% để pass)
- **Progress tracking**:
  - Xem video ≥80% thời lượng (hoặc ≥5 phút tối thiểu)
  - Quiz đạt ≥80% để pass
  - Unlock bài tiếp theo tự động
  - Lưu watch time chi tiết (seconds per lesson)
- **Lesson sidebar** với trạng thái:
  - 🔒 Locked (chưa unlock)
  - ⭕ Unlocked (đã mở nhưng chưa hoàn thành)
  - ✅ Completed (đã xem + pass quiz)
- **Progress bar** tổng khóa học (percentage)
- **Course data** lưu trong `data/course.ts` (có thể mở rộng)

### 4. ✅ Purchase & Payment System
- **Zalo Payment Flow**:
  - Tạo đơn hàng với `status: "pending"`
  - Hiển thị thông tin chuyển khoản (Vietcombank Bạc Liêu)
  - Copy thông tin chuyển khoản (số tài khoản, tên, số tiền)
  - Copy tin nhắn Zalo mẫu tự động
  - User bấm "Tôi đã thanh toán" → tạo purchase record
  - Admin duyệt tại `/admin/purchases`
- **Purchase Guard**: Chỉ học viên đã thanh toán (`status === "paid"`) mới vào được `/learn`
- **Billing/Invoice**: Trang `/account/billing` hiển thị hóa đơn đã thanh toán
- **Price**: 3.000.000 VNĐ (Học trọn đời)
- **Purchase status**: `pending` | `paid` | `rejected`

### 5. ✅ Device Activation System
- **Device ID**: Tự động generate bằng `crypto.randomUUID()` (lưu localStorage)
- **Activation Key**: HMAC SHA256 với secret key (format: `HATG-XXXXX-XXXXX-XXXXX-XXXXX`)
- **Key Generator**: 
  - Trang `/keygen` (public, check admin qua API)
  - Trang `/admin/keygen` (admin UI)
  - API `/api/generate-key` (POST, admin only)
- **Key Verification**: API `/api/verify-key` (POST, server-side)
- **Activation Guard**: Chỉ học viên đã kích hoạt mới học được
- **LocalStorage**: Lưu Device ID và activation state (`hatg_activation_v1`)
- **Activation state**: Lưu theo `courseId` (có thể kích hoạt nhiều khóa)

### 6. ✅ Admin Panel
- **`/admin`**: Admin dashboard (overview)
- **`/admin/purchases`**: Duyệt đơn hàng (approve/reject)
  - Hiển thị tất cả purchases (pending, paid, rejected)
  - Filter theo status
  - Approve/Reject với một click
  - Hiển thị thông tin chi tiết: email, course, amount, note, created_at
- **`/admin/keygen`**: Tạo Activation Key cho học viên
  - Nhập Device ID
  - Generate key tự động
  - Copy key dễ dàng
- **Admin Guard**: 
  - Check email trong `ADMIN_EMAIL` hoặc `ADMIN_EMAILS` env
  - Support multiple admins (comma-separated)
  - Fallback: `truongthanh160588@gmail.com`
- **Admin Badge**: Hiển thị email admin ở góc trang

### 7. ✅ UI/UX - Titan Theme
- **Dark theme** với nền đen (`#0b0f14`)
- **Titan border** với hiệu ứng glow cyan/teal
- **Gradient buttons**:
  - Primary: cyan → teal
  - Secondary: blue → purple
- **Responsive design** (mobile-first):
  - Mobile: Sidebar dùng Sheet component
  - Desktop: Sidebar cố định bên trái
- **Skeleton loading** cho lazy load components
- **Toast notifications** cho feedback (success, error)
- **Confetti animation** khi pass quiz (3 giây)
- **Progress indicators** với gradient bars
- **Card components** với border titanium
- **Icons**: lucide-react (400+ icons)

### 8. ✅ SEO & Metadata
- **Sitemap** (`/sitemap.xml`) tự động generate
- **robots.txt** trong public folder
- **Meta tags** đầy đủ:
  - Title, description
  - Open Graph (OG) tags
  - Twitter Card
- **Apple Web App** tags:
  - `apple-mobile-web-app-capable`
  - `apple-mobile-web-app-status-bar-style`
  - `apple-mobile-web-app-title`
- **Theme color**: `#0b0f14`
- **Viewport settings**: responsive, no zoom

### 9. ✅ Support & Help
- **Support Form**: Gửi thông tin ca khó (thiết bị, vấn đề, hình ảnh)
- **Zalo Integration**: Link trực tiếp đến Zalo 0974 70 4444
- **FAQ Section**: Trang landing có 4 câu hỏi thường gặp (Accordion)
- **Footer**: Copyright và thông tin liên hệ
- **Copy buttons**: Copy mã bài học, thông tin chuyển khoản

### 10. ✅ Data Persistence
- **Supabase PostgreSQL**: 
  - `profiles`: User profiles
  - `purchases`: Purchase records
  - `progress`: Learning progress (unlocked_index, completed_lessons, watch_seconds)
  - `quiz_attempts`: Quiz scores và pass status
- **Row Level Security (RLS)**: Bảo mật dữ liệu user
- **LocalStorage Fallback**: 
  - Progress khi offline hoặc lỗi Supabase
  - Device ID và activation state
  - Watch time tracking
- **Debounced Updates**: Watch time sync mỗi 10 giây
- **Auto-sync**: Progress sync từ DB về local khi load page

### 11. ✅ Learning Flow & Guards
- **Multi-layer Guards**:
  1. Authentication guard (phải đăng nhập)
  2. Purchase guard (phải đã thanh toán)
  3. Activation guard (phải đã kích hoạt)
  4. Lesson unlock guard (phải unlock bài trước)
- **Watch Time Tracking**:
  - Track seconds watched per lesson
  - Minimum 80% video length hoặc 5 phút
  - Real-time progress bar
- **Quiz System**:
  - 5 câu hỏi per lesson
  - Score ≥80% để pass
  - Có thể làm lại nhiều lần
  - Lưu attempt vào database
- **Unlock Logic**:
  - Bài 1: Unlock mặc định
  - Bài tiếp: Unlock khi pass quiz bài trước

---

## 📁 CẤU TRÚC DỰ ÁN

```
hoc-am-thanh-tu-goc/
├── app/                          # Next.js App Router
│   ├── account/
│   │   └── billing/
│   │       └── page.tsx          # Trang hóa đơn (protected)
│   ├── admin/
│   │   ├── keygen/
│   │   │   └── page.tsx          # Key Generator (admin UI)
│   │   ├── purchases/
│   │   │   └── page.tsx          # Duyệt đơn hàng
│   │   └── page.tsx              # Admin dashboard
│   ├── api/
│   │   ├── generate-key/
│   │   │   └── route.ts          # API tạo Activation Key (POST, admin only)
│   │   └── verify-key/
│   │       └── route.ts          # API verify Activation Key (POST)
│   ├── auth/
│   │   ├── callback/             # Supabase OAuth callback
│   │   └── page.tsx              # Trang đăng nhập (Email + OTP/Password)
│   ├── courses/
│   │   ├── [courseId]/
│   │   │   └── page.tsx          # Chi tiết khóa học + Mua khóa học
│   │   └── page.tsx              # Danh sách khóa học
│   ├── keygen/
│   │   └── page.tsx              # Key Generator (public, API check admin)
│   ├── learn/
│   │   └── [courseId]/
│   │       └── [lessonId]/
│   │           └── page.tsx      # Trang học bài (Video + Quiz)
│   ├── offline/
│   │   └── page.tsx              # Trang offline fallback
│   ├── preview/
│   │   └── page.tsx              # Trang preview (nếu có)
│   ├── start/
│   │   └── page.tsx              # Trang hướng dẫn học viên (4 bước)
│   ├── globals.css               # Global styles + Titan theme
│   ├── layout.tsx                # Root layout (metadata, AppShell)
│   ├── page.tsx                  # Landing page (Hero, Benefits, FAQ, CTA)
│   └── sitemap.ts                # Sitemap generator
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── accordion.tsx         # FAQ accordion
│   │   ├── alert.tsx             # Alert messages
│   │   ├── badge.tsx              # Badges/labels
│   │   ├── button.tsx             # Buttons với variants
│   │   ├── card.tsx               # Card container
│   │   ├── dialog.tsx             # Modal dialogs
│   │   ├── input.tsx              # Text inputs
│   │   ├── otp-input.tsx          # 6-digit OTP input
│   │   ├── progress.tsx           # Progress bars
│   │   ├── sheet.tsx              # Sidebar/mobile menu
│   │   ├── skeleton.tsx           # Loading skeletons
│   │   └── toast.tsx              # Toast notifications
│   ├── admin/
│   │   ├── CourseEditor.tsx       # Editor khóa học (nếu có)
│   │   ├── LessonEditor.tsx       # Editor bài học (nếu có)
│   │   └── LessonList.tsx         # Danh sách bài học (nếu có)
│   ├── ActivationCard.tsx         # Card kích hoạt Device ID
│   ├── AppShell.tsx               # Layout wrapper (Topbar, Footer, Navigation)
│   ├── Confetti.tsx               # Animation khi pass quiz
│   ├── CourseCard.tsx             # Card khóa học
│   ├── InstallPwaBanner.tsx       # Banner cài PWA
│   ├── LessonSidebar.tsx          # Sidebar danh sách bài
│   ├── ProgressBar.tsx            # Progress bar tổng khóa
│   ├── QuizPanel.tsx               # Panel quiz (5 câu hỏi)
│   ├── SupportForm.tsx            # Form gửi thông tin ca khó
│   └── YouTubeEmbed.tsx            # Component embed YouTube (với watch time tracking)
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Supabase client-side
│   │   ├── server.ts              # Supabase server-side
│   │   └── middleware.ts           # Supabase middleware (session refresh)
│   ├── admin.ts                   # Admin utilities
│   ├── auth-supabase.ts           # Auth utilities (getAuthUser, signOut)
│   ├── auth.ts                    # Auth helpers (nếu có)
│   ├── courseStore.ts             # Course data store
│   ├── debounce.ts                 # Debounce utility
│   ├── device-activation.ts       # Device ID & Activation logic
│   ├── guard.ts                   # Lesson unlock guard
│   ├── lesson-watched.ts          # Lesson watched state
│   ├── progress.ts                # Progress localStorage
│   ├── progress-supabase.ts       # Progress Supabase (get, update, watch time)
│   ├── purchase-supabase.ts       # Purchase Supabase helpers
│   ├── purchase-zalo.ts           # Zalo purchase logic
│   ├── purchase.ts                # Purchase helpers
│   ├── utils.ts                   # General utilities
│   └── watch-time.ts              # Watch time tracking
├── public/
│   ├── icons/                     # PWA icons
│   ├── logo.png                   # Logo thương hiệu
│   ├── manifest.webmanifest       # PWA manifest
│   ├── robots.txt                 # SEO robots
│   ├── sw.js                      # Service Worker (generated)
│   └── workbox-*.js               # Workbox files (generated)
├── supabase/
│   └── schema.sql                 # Database schema (4 tables + RLS)
├── data/
│   └── course.ts                  # Course data (20 lessons với quiz)
├── styles/
│   └── titan.css                  # Titan theme styles (nếu có)
├── scripts/
│   └── generate-icons.js          # Script tạo icons từ SVG
├── middleware.ts                  # Next.js middleware (session refresh)
├── next.config.mjs                # Next.js config + PWA
├── package.json                   # Dependencies
├── tailwind.config.ts             # Tailwind config
├── tsconfig.json                  # TypeScript config
└── README.md                      # Hướng dẫn setup
```

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Frontend
- **Next.js 14.2.0** (App Router)
- **React 18.3.0**
- **TypeScript 5**
- **Tailwind CSS 3.4.1**
- **shadcn/ui** (Component library)
- **lucide-react 0.400.0** (Icons)

### Backend & Database
- **Supabase**:
  - Authentication (Email + OTP/Password)
  - PostgreSQL Database
  - Row Level Security (RLS)
  - `@supabase/supabase-js 2.39.0`
  - `@supabase/ssr 0.1.0`
- **Next.js API Routes** (Server-side, Node.js runtime)

### PWA
- **next-pwa 5.6.0** (Service Worker)
- **Web App Manifest**
- **Workbox** (runtime caching)

### Utilities
- **class-variance-authority 0.7.0** (Component variants)
- **clsx 2.1.1** + **tailwind-merge 2.4.0** (Class utilities)

### Development
- **ESLint** + **eslint-config-next**
- **PostCSS** + **Autoprefixer**
- **TypeScript** strict mode

---

## 📍 ROUTES & PAGES

### Public Routes
- **`/`** - Landing page
  - Hero section với logo
  - Benefits section (3 cards)
  - Roadmap section (4 giai đoạn)
  - FAQ section (4 câu hỏi)
  - CTA section
  - Footer
  - Install PWA Banner

- **`/auth`** - Đăng nhập
  - Email input
  - OTP (Magic Link) hoặc Password
  - Auto redirect sau login

- **`/courses`** - Danh sách khóa học
  - Hiển thị CourseCard
  - Link đến chi tiết khóa học

- **`/courses/[courseId]`** - Chi tiết khóa học
  - Thông tin khóa học
  - ActivationCard (nếu chưa kích hoạt)
  - Nút "Mua khóa học" (nếu chưa mua)
  - Dialog chuyển khoản (số TK, tên, số tiền)
  - Copy buttons
  - Link Zalo

- **`/learn/[courseId]/[lessonId]`** - Trang học bài
  - Progress bar tổng khóa
  - Lesson sidebar (desktop/mobile)
  - Video YouTube embed
  - Watch time tracking
  - Đánh dấu "Đã xem" (sau khi xem ≥80%)
  - Quiz panel (5 câu hỏi)
  - Confetti khi pass quiz
  - Nút "Bài tiếp theo"

- **`/keygen`** - Key Generator (public)
  - Nhập Device ID
  - Generate key (check admin qua API)
  - Copy key

- **`/start`** - Trang hướng dẫn học viên
  - 4 bước hướng dẫn

- **`/offline`** - Trang offline fallback
  - Thông báo offline
  - Hướng dẫn kiểm tra kết nối

### Protected Routes (Require Auth)
- **`/account/billing`** - Hóa đơn đã thanh toán
  - Danh sách purchases với status "paid"
  - Thông tin chi tiết: course, amount, date

### Admin Routes (Require Admin Email)
- **`/admin`** - Admin dashboard
  - Overview statistics
  - Quick links

- **`/admin/keygen`** - Key Generator (admin UI)
  - Nhập Device ID
  - Generate key
  - Copy key

- **`/admin/purchases`** - Duyệt đơn hàng
  - Danh sách tất cả purchases
  - Filter theo status
  - Approve/Reject buttons
  - Thông tin chi tiết: email, course, amount, note, date

### API Routes
- **`/api/generate-key`** - Tạo Activation Key
  - Method: POST
  - Body: `{ deviceId: string, courseId?: string }`
  - Headers: `x-admin-token` (optional) hoặc check Supabase session
  - Response: `{ ok: boolean, key?: string, message?: string }`
  - Admin only

- **`/api/verify-key`** - Verify Activation Key
  - Method: POST
  - Body: `{ deviceId: string, key: string, courseId: string }`
  - Response: `{ ok: boolean, message?: string }`
  - Public (nhưng cần key hợp lệ)

- **`/auth/callback`** - Supabase OAuth callback
  - Handle OAuth redirects
  - Auto login

---

## 🗄️ DATABASE SCHEMA (Supabase)

### Tables

#### 1. `profiles`
```sql
- id (UUID, PK, references auth.users)
- full_name (TEXT, nullable)
- phone (TEXT, nullable)
- created_at (TIMESTAMP WITH TIME ZONE)
- updated_at (TIMESTAMP WITH TIME ZONE)
```

**RLS Policies:**
- Users can SELECT own profile
- Users can UPDATE own profile
- Users can INSERT own profile

#### 2. `purchases`
```sql
- id (UUID, PK, default gen_random_uuid())
- user_id (UUID, NOT NULL, references auth.users)
- course_id (TEXT, NOT NULL)
- status (TEXT, NOT NULL, default 'pending', CHECK: 'pending'|'paid'|'rejected')
- amount_vnd (INTEGER, default 0)
- transaction_code (TEXT, nullable)
- note (TEXT, nullable)
- created_at (TIMESTAMP WITH TIME ZONE)
- updated_at (TIMESTAMP WITH TIME ZONE)
```

**Indexes:**
- `idx_purchases_user_id` on `user_id`
- `idx_purchases_status` on `status`

**RLS Policies:**
- Users can SELECT own purchases
- Users can INSERT own purchases
- Admin can view all (handled in app logic with service role)

#### 3. `progress`
```sql
- id (UUID, PK, default gen_random_uuid())
- user_id (UUID, NOT NULL, references auth.users)
- course_id (TEXT, NOT NULL)
- unlocked_index (INTEGER, default 0)
- completed_lessons (TEXT[], default '{}')
- watch_seconds (JSONB, default '{}')
- updated_at (TIMESTAMP WITH TIME ZONE)
- UNIQUE(user_id, course_id)
```

**Indexes:**
- `idx_progress_user_course` on `(user_id, course_id)`

**RLS Policies:**
- Users can SELECT own progress
- Users can INSERT own progress
- Users can UPDATE own progress

#### 4. `quiz_attempts`
```sql
- id (UUID, PK, default gen_random_uuid())
- user_id (UUID, NOT NULL, references auth.users)
- course_id (TEXT, NOT NULL)
- lesson_id (TEXT, NOT NULL)
- score (INTEGER, NOT NULL, 0-100)
- passed (BOOLEAN, NOT NULL)
- created_at (TIMESTAMP WITH TIME ZONE)
```

**Indexes:**
- `idx_quiz_attempts_user` on `(user_id, course_id, lesson_id)`

**RLS Policies:**
- Users can SELECT own quiz attempts
- Users can INSERT own quiz attempts

### Functions & Triggers
- **`update_updated_at_column()`**: Auto-update `updated_at` timestamp
- **Triggers**: Applied to `profiles`, `purchases`, `progress`

---

## 🔐 ENVIRONMENT VARIABLES

### Required (Production)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Admin
ADMIN_EMAIL=truongthanh160588@gmail.com
# Hoặc (support multiple admins)
ADMIN_EMAILS=truongthanh160588@gmail.com,admin2@example.com
NEXT_PUBLIC_ADMIN_EMAILS=truongthanh160588@gmail.com,admin2@example.com

# Activation System
ACTIVATION_SECRET=your-secret-key-min-32-chars
```

### Optional
```env
ADMIN_TOKEN=your-admin-token (for API access via x-admin-token header)
NEXT_PUBLIC_BASE_URL=https://hoc-am-thanh-tu-goc.vercel.app
NEXT_PUBLIC_ACTIVATION_SECRET=your-secret (fallback, not recommended)
```

**Fallback Order:**
- `ADMIN_EMAIL` → `NEXT_PUBLIC_ADMIN_EMAIL`
- `ADMIN_EMAILS` → `NEXT_PUBLIC_ADMIN_EMAILS`
- `ACTIVATION_SECRET` → `NEXT_PUBLIC_ACTIVATION_SECRET`

---

## 📦 DEPENDENCIES

### Production Dependencies
```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "lucide-react": "^0.400.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.4.0",
  "next-pwa": "^5.6.0",
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/ssr": "^0.1.0"
}
```

### Development Dependencies
```json
{
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "typescript": "^5",
  "tailwindcss": "^3.4.1",
  "postcss": "^8",
  "autoprefixer": "^10.4.19",
  "eslint": "^8",
  "eslint-config-next": "^14.2.0"
}
```

---

## 🎨 UI COMPONENTS (shadcn/ui)

### Core Components
- **`Button`** - Buttons với variants (primary, outline, ghost, size: sm, md, lg)
- **`Card`** - Card container (CardHeader, CardTitle, CardDescription, CardContent)
- **`Dialog`** - Modal dialogs
- **`Input`** - Text inputs
- **`OTPInput`** - 6-digit OTP input (cho magic link)
- **`Sheet`** - Sidebar/mobile menu
- **`Toast`** - Toast notifications (success, error)
- **`Badge`** - Badges/labels (default, outline)
- **`Alert`** - Alert messages
- **`Accordion`** - FAQ accordion
- **`Progress`** - Progress bars
- **`Skeleton`** - Loading skeletons

### Custom Components
- **`ActivationCard`** - Card kích hoạt Device ID với input key
- **`AppShell`** - Layout wrapper (Topbar, Footer, Navigation)
- **`Confetti`** - Animation khi pass quiz
- **`CourseCard`** - Card khóa học
- **`InstallPwaBanner`** - Banner cài PWA
- **`LessonSidebar`** - Sidebar danh sách bài với trạng thái
- **`ProgressBar`** - Progress bar tổng khóa học
- **`QuizPanel`** - Panel quiz với 5 câu hỏi
- **`SupportForm`** - Form gửi thông tin ca khó
- **`YouTubeEmbed`** - Component embed YouTube với watch time tracking

---

## 🔄 WORKFLOW & LOGIC

### 1. User Registration & Login
1. User vào `/auth`
2. Nhập email → Chọn OTP hoặc Password
3. **Nếu OTP**:
   - Supabase gửi magic link email
   - User click link → Redirect về `/auth/callback`
   - Auto login → Redirect về `/courses`
4. **Nếu Password**:
   - Nhập password → Login
   - Redirect về `/courses`
5. Session được lưu trong cookies (Supabase SSR)

### 2. Purchase Flow
1. User vào `/courses/[courseId]`
2. Bấm "Mua khóa học" (3.000.000 VNĐ)
3. Dialog hiện:
   - Thông tin chuyển khoản (Vietcombank Bạc Liêu)
   - Copy buttons (số TK, tên, số tiền)
   - Copy tin nhắn Zalo mẫu
4. User chuyển khoản → Bấm "Tôi đã thanh toán"
5. Tạo `purchase` record với `status="pending"`
6. User nhắn Zalo (có template sẵn) với thông tin đơn hàng
7. Admin vào `/admin/purchases` → Xem đơn hàng pending
8. Admin bấm "Duyệt" → `status` → `"paid"`
9. User có thể vào học (`/learn`)

### 3. Activation Flow
1. User vào `/courses/[courseId]` (chưa activated)
2. Hiện `ActivationCard` với Device ID (auto generate, lưu localStorage)
3. User copy Device ID → Gửi cho admin (Zalo/Email)
4. Admin vào `/admin/keygen` hoặc `/keygen`:
   - Nhập Device ID
   - Bấm "Generate Key"
   - API `/api/generate-key` tạo key (HMAC SHA256)
   - Format: `HATG-XXXXX-XXXXX-XXXXX-XXXXX`
5. Admin gửi Key cho user
6. User nhập Key vào `ActivationCard` → Bấm "Kích hoạt"
7. API `/api/verify-key` verify key (server-side)
8. Nếu hợp lệ → Lưu activation state vào localStorage
9. User có thể vào học (`/learn`)

### 4. Learning Flow
1. User vào `/learn/[courseId]/[lessonId]`
2. **Guard checks** (theo thứ tự):
   - ✅ Đã đăng nhập? → Redirect `/auth`
   - ✅ Đã mua khóa học? (`purchase.status === "paid"`) → Redirect `/courses/[courseId]`
   - ✅ Đã kích hoạt? (`activation[courseId].activated === true`) → Redirect `/courses/[courseId]`
   - ✅ Bài học đã unlock? (`lessonIndex <= progress.unlockedLessonIndex`) → Redirect `/courses/[courseId]`
3. **Nếu pass guard**:
   - Load video YouTube embed
   - Track watch time (seconds) → Update mỗi 10s (debounced)
   - Hiện progress bar (đã xem / cần xem)
   - Khi đủ thời lượng (≥80% hoặc ≥5 phút):
     - Enable nút "Đánh dấu đã xem"
     - User bấm → Mark lesson as watched
   - Sau khi đánh dấu → Unlock quiz
   - Làm quiz (5 câu hỏi):
     - Submit → Tính score
     - Nếu ≥80% → Pass → Unlock bài tiếp theo
     - Lưu attempt vào `quiz_attempts`
     - Hiện Confetti animation
   - Unlock bài tiếp theo:
     - Update `progress.unlocked_index`
     - Update `progress.completed_lessons`
4. **Progress sync**:
   - Watch time: Debounced update mỗi 10s → `progress.watch_seconds[lessonId]`
   - Quiz pass: Immediate update → `progress.unlocked_index`, `progress.completed_lessons`
   - Fallback localStorage nếu Supabase lỗi
   - Auto-sync từ DB về local khi load page

### 5. Progress Tracking
- **Watch Time**: Lưu seconds per lesson (JSONB: `{ [lessonId]: number }`)
- **Unlocked Index**: Index bài học cao nhất đã unlock (0-based)
- **Completed Lessons**: Array các lesson ID đã hoàn thành
- **Sync Strategy**:
  - Load page → Fetch từ Supabase → Sync to localStorage
  - Update → Update localStorage → Debounced sync to Supabase
  - Offline → Use localStorage only

---

## 📊 STATISTICS

### Code Metrics
- **Total Routes**: 17 routes
  - Public: 8 routes
  - Protected: 1 route
  - Admin: 3 routes
  - API: 2 routes
  - Special: 3 routes (offline, sitemap, callback)
- **Components**: 20+ components
  - UI: 12 components
  - Custom: 8+ components
- **API Routes**: 2 routes
- **Database Tables**: 4 tables
- **Lines of Code**: ~6,000+ lines

### Features Count
- ✅ 11 major features completed
- ✅ 20 lessons with quizzes (5 questions each)
- ✅ Full PWA support
- ✅ Complete auth system (OTP + Password)
- ✅ Payment & billing system
- ✅ Admin panel (3 pages)
- ✅ Device activation system
- ✅ Progress tracking (watch time + quiz)
- ✅ Offline support
- ✅ SEO optimized
- ✅ Responsive design

---

## 🚀 DEPLOYMENT

### Current Status
- **Platform**: Vercel
- **URL**: `https://hoc-am-thanh-tu-goc.vercel.app`
- **Status**: ✅ Live & Production Ready
- **Auto Deploy**: Enabled (GitHub push → Vercel deploy)
- **Build**: Next.js 14 (App Router)
- **Runtime**: Node.js

### Build Commands
```bash
npm run build    # Build production
npm run start    # Start production server
npm run dev      # Development server
npm run lint     # Lint code
```

### Build Output
- Static pages: 17 pages
- Dynamic routes: 3 routes (`[courseId]`, `[lessonId]`)
- API routes: 2 routes
- Middleware: ~70.2 kB
- First Load JS: ~87-167 kB per page
- Service Worker: Generated by next-pwa

### Environment Variables (Vercel)
Cần set các biến sau trong Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL` hoặc `ADMIN_EMAILS`
- `ACTIVATION_SECRET`

---

## 📝 TODO / FUTURE ENHANCEMENTS

### Potential Improvements
- [ ] Video progress bar (seek to watched position)
- [ ] Certificate generation sau khi hoàn thành khóa học
- [ ] Discussion forum / Comments
- [ ] Email notifications (quiz pass, new lesson unlock)
- [ ] Analytics dashboard (admin)
- [ ] Multi-language support
- [ ] Video subtitles/transcripts
- [ ] Download course materials (PDF, audio files)
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration (VNPay, MoMo)
- [ ] Social sharing (share progress)
- [ ] Leaderboard (top learners)
- [ ] Course reviews/ratings
- [ ] Video quality selector
- [ ] Playback speed control
- [ ] Notes/Bookmarks per lesson

---

## 👤 CONTACT & SUPPORT

**Developer**: Trương Thanh  
**Zalo**: 0974 70 4444  
**Email**: truongthanh160588@gmail.com

---

## 📄 LICENSE

Proprietary - All rights reserved

---

**Báo cáo được tạo tự động từ codebase**  
**Cập nhật lần cuối**: 2024
