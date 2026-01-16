# 📊 BÁO CÁO DỰ ÁN: HỌC ÂM THANH TỪ GỐC

**Ngày tạo báo cáo:** $(date)  
**Phiên bản:** 0.1.0  
**Trạng thái:** ✅ Production Ready (Deployed trên Vercel)

---

## 🎯 TỔNG QUAN DỰ ÁN

**Học Âm Thanh Từ Gốc** là một nền tảng học tập trực tuyến (PWA) chuyên về âm thanh, được xây dựng với Next.js 14, TypeScript, và Supabase. Dự án cung cấp khóa học "Học trọn đời" với 20 bài học từ cơ bản đến nâng cao, kèm theo hệ thống quiz, theo dõi tiến độ, và hỗ trợ trực tiếp qua Zalo.

**URL Production:** `https://hoc-am-thanh-tu-goc.vercel.app`

---

## 🚀 TÍNH NĂNG ĐÃ HOÀN THÀNH

### 1. ✅ PWA (Progressive Web App)
- **Service Worker** với `next-pwa`
- **Web App Manifest** (`manifest.webmanifest`)
- **Icons** đầy đủ (72x72 đến 512x512)
- **Offline support** với trang `/offline`
- **Install banner** cho Chrome/Android và hướng dẫn iOS Safari
- **Caching strategy** cho YouTube videos và static assets

### 2. ✅ Authentication & User Management
- **Supabase Auth** tích hợp đầy đủ
- **Email + OTP** (Magic Link) - phương thức chính
- **Email + Password** - phương thức phụ
- **Session management** với middleware
- **Auto redirect** sau login/logout
- **User profile** lưu trên Supabase

### 3. ✅ Course Management
- **20 bài học** với video YouTube
- **Quiz trắc nghiệm** sau mỗi bài (≥80% để pass)
- **Progress tracking**:
  - Xem video ≥80% thời lượng (hoặc ≥5 phút)
  - Quiz đạt ≥80%
  - Unlock bài tiếp theo tự động
- **Lesson sidebar** với trạng thái locked/unlocked/completed
- **Progress bar** tổng khóa học

### 4. ✅ Purchase & Payment System
- **Zalo Payment Flow**:
  - Tạo đơn hàng (status: pending)
  - Hướng dẫn chuyển khoản (Vietcombank Bạc Liêu)
  - Copy thông tin chuyển khoản
  - Copy tin nhắn Zalo mẫu
  - Admin duyệt tại `/admin/purchases`
- **Purchase Guard**: Chỉ học viên đã thanh toán mới vào được `/learn`
- **Billing/Invoice**: Trang `/account/billing` hiển thị hóa đơn đã thanh toán
- **Price**: 3.000.000 VNĐ (Học trọn đời)

### 5. ✅ Device Activation System
- **Device ID**: Tự động generate bằng `crypto.randomUUID()`
- **Activation Key**: HMAC SHA256 với secret key
- **Key Generator**: Trang `/keygen` cho admin tạo key
- **Key Verification**: API `/api/verify-key` server-side
- **Activation Guard**: Chỉ học viên đã kích hoạt mới học được
- **LocalStorage**: Lưu Device ID và activation state

### 6. ✅ Admin Panel
- **`/admin/purchases`**: Duyệt đơn hàng (approve/reject)
- **`/admin/keygen`**: Tạo Activation Key cho học viên
- **Admin Guard**: Chỉ email trong `ADMIN_EMAIL` env mới vào được
- **Admin Badge**: Hiển thị email admin ở góc trang

### 7. ✅ UI/UX - Titan Theme
- **Dark theme** với nền đen (#0b0f14)
- **Titan border** với hiệu ứng glow cyan/teal
- **Gradient buttons** (cyan → teal, blue → purple)
- **Responsive design** (mobile-first)
- **Skeleton loading** cho lazy load
- **Toast notifications** cho feedback
- **Confetti animation** khi pass quiz

### 8. ✅ SEO & Metadata
- **Sitemap** (`/sitemap.xml`)
- **robots.txt**
- **Meta tags** đầy đủ (title, description, OG)
- **Apple Web App** tags
- **Theme color** và viewport settings

### 9. ✅ Support & Help
- **Support Form**: Gửi thông tin ca khó (thiết bị, vấn đề)
- **Zalo Integration**: Link trực tiếp đến Zalo 0974 70 4444
- **FAQ Section**: Trang landing có câu hỏi thường gặp
- **Footer**: Copyright và thông tin liên hệ

### 10. ✅ Data Persistence
- **Supabase PostgreSQL**: Progress, purchases, quiz attempts
- **LocalStorage Fallback**: Khi offline hoặc lỗi Supabase
- **Debounced Updates**: Watch time sync mỗi 10s
- **Row Level Security (RLS)**: Bảo mật dữ liệu user

---

## 📁 CẤU TRÚC DỰ ÁN

```
hoc-am-thanh-tu-goc/
├── app/                          # Next.js App Router
│   ├── account/
│   │   └── billing/             # Trang hóa đơn
│   ├── admin/
│   │   ├── keygen/              # Key Generator (admin)
│   │   ├── purchases/           # Duyệt đơn hàng
│   │   └── page.tsx             # Admin dashboard
│   ├── api/
│   │   ├── generate-key/        # API tạo Activation Key
│   │   └── verify-key/          # API verify Activation Key
│   ├── auth/
│   │   ├── callback/            # Supabase OAuth callback
│   │   └── page.tsx             # Trang đăng nhập
│   ├── courses/
│   │   ├── [courseId]/          # Chi tiết khóa học
│   │   └── page.tsx             # Danh sách khóa học
│   ├── keygen/
│   │   └── page.tsx             # Key Generator (public)
│   ├── learn/
│   │   └── [courseId]/
│   │       └── [lessonId]/      # Trang học bài
│   ├── offline/
│   │   └── page.tsx             # Trang offline
│   ├── start/
│   │   └── page.tsx             # Trang hướng dẫn học viên
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── sitemap.ts                # Sitemap generator
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── ActivationCard.tsx        # Card kích hoạt Device ID
│   ├── AppShell.tsx              # Layout wrapper (Topbar, Footer)
│   ├── Confetti.tsx              # Animation khi pass quiz
│   ├── CourseCard.tsx            # Card khóa học
│   ├── InstallPwaBanner.tsx     # Banner cài PWA
│   ├── LessonSidebar.tsx         # Sidebar danh sách bài
│   ├── ProgressBar.tsx           # Progress bar tổng khóa
│   ├── QuizPanel.tsx             # Panel quiz
│   ├── SupportForm.tsx           # Form gửi thông tin ca khó
│   └── YouTubeEmbed.tsx          # Component embed YouTube
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Supabase client-side
│   │   ├── server.ts             # Supabase server-side
│   │   └── middleware.ts         # Supabase middleware
│   ├── auth-supabase.ts          # Auth utilities
│   ├── courseStore.ts            # Course data store
│   ├── device-activation.ts      # Device ID & Activation logic
│   ├── guard.ts                  # Lesson unlock guard
│   ├── lesson-watched.ts         # Lesson watched state
│   ├── progress.ts               # Progress localStorage
│   ├── progress-supabase.ts      # Progress Supabase
│   ├── purchase-zalo.ts          # Zalo purchase logic
│   └── watch-time.ts             # Watch time tracking
├── public/
│   ├── icons/                    # PWA icons
│   ├── logo.png                  # Logo thương hiệu
│   ├── manifest.webmanifest      # PWA manifest
│   └── robots.txt                # SEO robots
├── supabase/
│   └── schema.sql                # Database schema
├── data/
│   └── course.ts                 # Course data (20 lessons)
├── middleware.ts                  # Next.js middleware (session refresh)
├── next.config.mjs               # Next.js config + PWA
├── package.json                   # Dependencies
└── README.md                      # Hướng dẫn setup
```

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Frontend
- **Next.js 14** (App Router)
- **React 18.3**
- **TypeScript 5**
- **Tailwind CSS 3.4**
- **shadcn/ui** (Component library)
- **lucide-react** (Icons)

### Backend & Database
- **Supabase**:
  - Authentication (Email + OTP/Password)
  - PostgreSQL Database
  - Row Level Security (RLS)
- **Next.js API Routes** (Server-side)

### PWA
- **next-pwa** (Service Worker)
- **Web App Manifest**

### Utilities
- **class-variance-authority** (Component variants)
- **clsx** + **tailwind-merge** (Class utilities)

---

## 📍 ROUTES & PAGES

### Public Routes
- **`/`** - Landing page (Hero, Benefits, FAQ, CTA)
- **`/auth`** - Đăng nhập (Email + OTP/Password)
- **`/courses`** - Danh sách khóa học
- **`/courses/[courseId]`** - Chi tiết khóa học + Mua khóa học
- **`/learn/[courseId]/[lessonId]`** - Trang học bài (Video + Quiz)
- **`/keygen`** - Key Generator (public, API check admin)
- **`/start`** - Trang hướng dẫn học viên (4 bước)
- **`/offline`** - Trang offline fallback

### Protected Routes (Require Auth)
- **`/account/billing`** - Hóa đơn đã thanh toán

### Admin Routes (Require Admin Email)
- **`/admin`** - Admin dashboard
- **`/admin/keygen`** - Key Generator (admin UI)
- **`/admin/purchases`** - Duyệt đơn hàng

### API Routes
- **`/api/generate-key`** - Tạo Activation Key (POST, admin only)
- **`/api/verify-key`** - Verify Activation Key (POST)
- **`/auth/callback`** - Supabase OAuth callback

---

## 🗄️ DATABASE SCHEMA (Supabase)

### Tables

#### 1. `profiles`
- `id` (UUID, PK, references `auth.users`)
- `full_name` (text)
- `phone` (text)
- `created_at` (timestamp)

#### 2. `purchases`
- `id` (UUID, PK)
- `user_id` (UUID, references `auth.users`)
- `course_id` (text)
- `status` (text: "pending" | "paid" | "rejected")
- `amount_vnd` (integer)
- `note` (text, optional)
- `created_at` (timestamp)

#### 3. `progress`
- `id` (UUID, PK)
- `user_id` (UUID, references `auth.users`)
- `course_id` (text)
- `unlocked_index` (integer)
- `completed_lessons` (text[])
- `watch_seconds` (jsonb: `{ [lessonId]: number }`)
- `updated_at` (timestamp)
- Unique constraint: `(user_id, course_id)`

#### 4. `quiz_attempts`
- `id` (UUID, PK)
- `user_id` (UUID, references `auth.users`)
- `course_id` (text)
- `lesson_id` (text)
- `score` (integer, 0-100)
- `passed` (boolean)
- `created_at` (timestamp)

### Row Level Security (RLS)
- User chỉ có thể SELECT/UPDATE `profiles` của chính mình
- User chỉ có thể SELECT/INSERT `purchases` của chính mình
- User chỉ có thể SELECT/INSERT/UPDATE `progress` của chính mình
- User chỉ có thể SELECT/INSERT `quiz_attempts` của chính mình

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
# Hoặc
ADMIN_EMAILS=truongthanh160588@gmail.com,admin2@example.com

# Activation System
ACTIVATION_SECRET=your-secret-key-min-32-chars
```

### Optional
```env
ADMIN_TOKEN=your-admin-token (for API access)
NEXT_PUBLIC_BASE_URL=https://hoc-am-thanh-tu-goc.vercel.app
```

---

## 📦 DEPENDENCIES

### Production
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

### Development
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

- `Button` - Buttons với variants (primary, outline, ghost)
- `Card` - Card container
- `Dialog` - Modal dialogs
- `Input` - Text inputs
- `OTPInput` - 6-digit OTP input
- `Sheet` - Sidebar/mobile menu
- `Toast` - Toast notifications
- `Badge` - Badges/labels
- `Alert` - Alert messages
- `Accordion` - FAQ accordion
- `Progress` - Progress bars
- `Skeleton` - Loading skeletons

---

## 🔄 WORKFLOW & LOGIC

### 1. User Registration & Login
1. User vào `/auth`
2. Nhập email → Chọn OTP hoặc Password
3. Nếu OTP: Nhận email magic link → Click → Auto login
4. Nếu Password: Nhập password → Login
5. Redirect về `/courses`

### 2. Purchase Flow
1. User vào `/courses/[courseId]`
2. Bấm "Mua khóa học" (3.000.000 VNĐ)
3. Dialog hiện: Thông tin chuyển khoản + Copy buttons
4. User chuyển khoản → Bấm "Tôi đã thanh toán"
5. Tạo `purchase` với `status="pending"`
6. User nhắn Zalo (có template sẵn)
7. Admin vào `/admin/purchases` → Bấm "Đã thanh toán"
8. `status` → `"paid"` → User có thể vào học

### 3. Activation Flow
1. User vào `/courses/[courseId]` (chưa activated)
2. Hiện `ActivationCard` với Device ID (auto generate)
3. User copy Device ID → Gửi cho admin
4. Admin vào `/keygen` → Nhập Device ID → Generate Key
5. Admin gửi Key cho user
6. User nhập Key vào `ActivationCard` → Bấm "Kích hoạt"
7. API `/api/verify-key` verify → Lưu activation state
8. User có thể vào học

### 4. Learning Flow
1. User vào `/learn/[courseId]/[lessonId]`
2. **Guard checks**:
   - Đã đăng nhập?
   - Đã mua khóa học? (`purchase.status === "paid"`)
   - Đã kích hoạt? (`activation[courseId].activated === true`)
   - Bài học đã unlock? (`lessonIndex <= progress.unlockedLessonIndex`)
3. Nếu pass guard:
   - Load video YouTube
   - Track watch time (≥80% hoặc ≥5 phút)
   - Hiện nút "Đánh dấu đã xem" khi đủ thời lượng
   - Sau khi đánh dấu → Unlock quiz
   - Làm quiz → ≥80% → Pass → Unlock bài tiếp theo
4. Progress sync:
   - Watch time: Debounced update mỗi 10s
   - Quiz pass: Immediate update
   - Fallback localStorage nếu Supabase lỗi

---

## 📊 STATISTICS

### Code Metrics
- **Total Routes**: 17 routes
- **Components**: 20+ components
- **API Routes**: 2 routes
- **Database Tables**: 4 tables
- **Lines of Code**: ~5,000+ lines

### Features Count
- ✅ 10 major features completed
- ✅ 20 lessons with quizzes
- ✅ Full PWA support
- ✅ Complete auth system
- ✅ Payment & billing
- ✅ Admin panel
- ✅ Device activation
- ✅ Progress tracking
- ✅ Offline support

---

## 🚀 DEPLOYMENT

### Current Status
- **Platform**: Vercel
- **URL**: `https://hoc-am-thanh-tu-goc.vercel.app`
- **Status**: ✅ Live & Production Ready
- **Auto Deploy**: Enabled (GitHub push → Vercel deploy)

### Build Commands
```bash
npm run build    # Build production
npm run start    # Start production server
npm run dev      # Development server
```

### Build Output
- Static pages: 17 pages
- Dynamic routes: 3 routes
- API routes: 2 routes
- Middleware: 70.2 kB
- First Load JS: ~87-167 kB per page

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
**Cập nhật lần cuối**: $(date)
