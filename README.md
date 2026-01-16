# Học Âm Thanh Từ Gốc

Web App/PWA học âm thanh với Next.js 14, TypeScript, Tailwind CSS và shadcn/ui.

## Tính năng

- 🎨 UI hiện đại phong cách "Titan": nền đen, card tối, viền titanium, điểm nhấn cyan/teal
- 📚 20 bài học với video YouTube
- ✅ Quiz trắc nghiệm sau mỗi bài
- 🔒 Học theo tiến độ: phải xem ≥80% video + quiz đạt ≥80% để mở bài tiếp theo
- 💾 Lưu tiến độ trên Supabase (đổi máy vẫn còn) + localStorage fallback
- 📱 PWA hoàn chỉnh: cài được trên iPhone/Android/PC
- 🔐 Đăng nhập thật với Supabase (OTP email + Password)
- 💰 Thanh toán chuyển khoản + hóa đơn điện tử trong app
- 👨‍💼 Admin duyệt đơn hàng

## Cài đặt

```bash
npm install
```

## Setup Supabase

### Bước 1: Tạo project Supabase

1. Truy cập [supabase.com](https://supabase.com)
2. Đăng ký/đăng nhập và tạo project mới
3. Lưu lại:
   - Project URL
   - Anon key
   - Service role key (Settings → API)

### Bước 2: Chạy SQL Migration

1. Vào Supabase Dashboard → SQL Editor
2. Copy nội dung file `supabase/schema.sql`
3. Paste và chạy (Run)

### Bước 3: Cấu hình Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,truongthanh160588@gmail.com

# Activation System (Device ID + Key)
ACTIVATION_SECRET=your-secret-key-here-min-32-chars
ADMIN_TOKEN=your-admin-token-here (optional, for API access)
ADMIN_EMAIL=truongthanh160588@gmail.com
```

### Bước 4: Enable Email Auth

1. Vào Supabase Dashboard → Authentication → Providers
2. Bật "Email" provider
3. Cấu hình email templates (tùy chọn)

## Chạy development

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## Build và Test PWA

```bash
npm run build
npm run start
```

Sau đó mở http://localhost:3000 và thử "Cài ứng dụng" trên Chrome/Edge.

**Lưu ý**: PWA chỉ hoạt động đầy đủ trên HTTPS (production) hoặc localhost.

## Cấu trúc dự án

- `/app` - Next.js App Router pages
- `/components` - React components
- `/components/ui` - shadcn/ui components
- `/lib` - Utilities (auth, progress, guard)
- `/data` - Dữ liệu mẫu (20 bài học)

## Routes

- `/` - Landing page
- `/auth` - Đăng nhập (fake local)
- `/courses` - Danh sách khóa học
- `/courses/[courseId]` - Chi tiết khóa học
- `/learn/[courseId]/[lessonId]` - Trang học bài
- `/admin` - Trang quản trị (demo)
- `/admin/keygen` - Key Generator (tạo Activation Key cho học viên)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react (icons)
- PWA support
- Supabase (Auth + Database)

## Lưu ý

- Dữ liệu khóa học: có thể nhập qua `/admin` hoặc hardcode trong `data/course.ts`
- Progress: lưu trên Supabase, fallback localStorage khi offline
- YouTube video IDs: cần thay thế trong admin hoặc `data/course.ts`
- Auth: Supabase OTP (magic link) hoặc Password
- Purchase: chuyển khoản thủ công, admin duyệt tại `/admin/purchases`

## Deploy lên Vercel

### Bước 1: Push code lên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/hoc-am-thanh-tu-goc.git
git push -u origin main
```

### Bước 2: Deploy trên Vercel

1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập và chọn "Add New Project"
3. Import repository từ GitHub
4. Vercel tự động detect Next.js, giữ nguyên settings
5. Click "Deploy"

### Bước 3: Cấu hình (nếu cần)

- **Environment Variables**: Không cần thiết cho bản hiện tại
- **Build Command**: `npm run build` (mặc định)
- **Output Directory**: `.next` (mặc định)

### Bước 4: Test PWA

Sau khi deploy, mở URL Vercel trên:
- **Chrome/Edge**: Sẽ hiện banner "Cài ứng dụng"
- **iOS Safari**: Hướng dẫn "Share -> Add to Home Screen"
- **Android Chrome**: Banner tự động hiện

## Tạo Icons

Nếu muốn tạo icons từ SVG:

```bash
npm install sharp --save-dev
node scripts/generate-icons.js
```

Icons sẽ được tạo trong `public/icons/`.

## Tác giả

Trương Thanh - 0974 70 4444
