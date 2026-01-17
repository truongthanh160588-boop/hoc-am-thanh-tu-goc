# 🔍 KIỂM TRA DEPLOYMENT VERCEL

**Ngày kiểm tra:** 2024  
**Repository:** `https://github.com/truongthanh160588-boop/hoc-am-thanh-tu-goc.git`

---

## ✅ KIỂM TRA CẤU HÌNH

### 1. Git Repository
- ✅ **Remote:** `origin https://github.com/truongthanh160588-boop/hoc-am-thanh-tu-goc.git`
- ✅ **Branch:** `main`
- ✅ **Status:** Code đã được push lên GitHub

### 2. Next.js Configuration
- ✅ **Framework:** Next.js 14.2.0 (App Router)
- ✅ **Build Command:** `npm run build` (tự động detect)
- ✅ **Output Directory:** `.next` (mặc định)
- ✅ **Node Version:** 20.x (khuyến nghị)

### 3. PWA Configuration
- ✅ **next-pwa:** v5.6.0
- ✅ **Manifest:** `/manifest.webmanifest`
- ✅ **Service Worker:** Tự động generate
- ✅ **Icons:** Đã có đầy đủ (192x192, 512x512, apple-touch-icon)

---

## 🔧 ENVIRONMENT VARIABLES CẦN THIẾT

### Bắt Buộc (cho Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Tùy Chọn (cho Admin & Activation)
```
SUPABASE_SERVICE_ROLE_KEY=xxx (cho admin APIs)
ACTIVATION_SECRET=xxx (deprecated - không còn dùng)
```

### Cách Thêm Environment Variables trên Vercel:
1. Vào Vercel Dashboard
2. Chọn project → **Settings** → **Environment Variables**
3. Thêm từng biến:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** URL từ Supabase Dashboard
   - **Environment:** Production, Preview, Development (chọn cả 3)
4. Lặp lại cho các biến khác

---

## 📋 CHECKLIST DEPLOYMENT

### Trước Khi Deploy
- [x] Code đã push lên GitHub
- [x] `package.json` có đầy đủ dependencies
- [x] `next.config.mjs` cấu hình đúng
- [x] Không có linter errors
- [x] Build thành công local (`npm run build`)

### Trên Vercel Dashboard
- [ ] Project đã được import từ GitHub
- [ ] Framework auto-detected: Next.js
- [ ] Build Command: `npm run build` (hoặc để trống)
- [ ] Output Directory: `.next` (hoặc để trống)
- [ ] Node Version: 20.x
- [ ] Environment Variables đã được thêm đầy đủ

### Sau Khi Deploy
- [ ] Build thành công (không có errors)
- [ ] URL production hoạt động: `https://your-project.vercel.app`
- [ ] Homepage load được
- [ ] Authentication hoạt động (Supabase)
- [ ] Database connection OK
- [ ] PWA manifest load được
- [ ] Icons hiển thị đúng

---

## 🚀 HƯỚNG DẪN DEPLOY LẦN ĐẦU

### Bước 1: Đăng Nhập Vercel
1. Vào https://vercel.com
2. Đăng nhập bằng GitHub account
3. Authorize Vercel truy cập repositories

### Bước 2: Import Project
1. Click **"Add New Project"**
2. Chọn repository: `truongthanh160588-boop/hoc-am-thanh-tu-goc`
3. Vercel sẽ tự động detect:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

### Bước 3: Cấu Hình Environment Variables
Trước khi deploy, thêm environment variables:

**Trong Vercel Dashboard → Project Settings → Environment Variables:**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Apply to:** Production, Preview, Development (chọn cả 3)

### Bước 4: Deploy
1. Click **"Deploy"**
2. Chờ build hoàn tất (thường 2-5 phút)
3. Kiểm tra build logs nếu có lỗi

### Bước 5: Kiểm Tra
1. Mở URL production: `https://your-project.vercel.app`
2. Test các chức năng:
   - [ ] Homepage load
   - [ ] Authentication (login/logout)
   - [ ] Course listing
   - [ ] Preview lesson
   - [ ] Purchase flow

---

## 🔍 KIỂM TRA SAU DEPLOY

### 1. Build Logs
Vào Vercel Dashboard → **Deployments** → Click vào deployment mới nhất → Xem **Build Logs**

**Kiểm tra:**
- ✅ Build thành công (exit code 0)
- ✅ Không có TypeScript errors
- ✅ Không có missing dependencies
- ✅ PWA files generated

### 2. Runtime Logs
Vào **Deployments** → **Functions** → Xem runtime logs

**Kiểm tra:**
- ✅ API routes hoạt động
- ✅ Không có runtime errors
- ✅ Supabase connection OK

### 3. Network Tab (Browser DevTools)
Mở browser DevTools → Network tab

**Kiểm tra:**
- ✅ `/manifest.webmanifest` load được (200)
- ✅ `/sw.js` hoặc service worker load được
- ✅ Icons load được (200)
- ✅ API calls thành công

### 4. Console Errors
Mở browser DevTools → Console

**Kiểm tra:**
- ✅ Không có JavaScript errors
- ✅ Supabase client init thành công
- ✅ PWA registration thành công

---

## 🐛 TROUBLESHOOTING

### Lỗi Build Failed

**Nguyên nhân thường gặp:**
1. Missing environment variables
2. TypeScript errors
3. Missing dependencies
4. Build timeout

**Giải pháp:**
1. Check build logs trong Vercel Dashboard
2. Test build local: `npm run build`
3. Fix errors và push lại

### Lỗi Runtime Errors

**Nguyên nhân:**
1. Environment variables chưa được set
2. Supabase connection failed
3. API routes errors

**Giải pháp:**
1. Check environment variables trong Vercel Settings
2. Check Supabase URL và keys
3. Check runtime logs trong Vercel Dashboard

### PWA Không Hoạt Động

**Nguyên nhân:**
1. Service worker không được generate
2. Manifest không load được
3. HTTPS required (Vercel tự động có HTTPS)

**Giải pháp:**
1. Check `/manifest.webmanifest` có load được không
2. Check service worker trong Application tab (DevTools)
3. Clear cache và reload

---

## 📊 TRẠNG THÁI HIỆN TẠI

### Code Status
- ✅ **GitHub:** Code đã push lên `main` branch
- ✅ **Latest Commit:** `b564a29` - "feat: change preview from 3 lessons to 1 lesson only"
- ✅ **Build Ready:** Code sẵn sàng deploy

### Cần Kiểm Tra
- [ ] **Vercel Project:** Đã tạo project chưa?
- [ ] **Environment Variables:** Đã thêm vào Vercel chưa?
- [ ] **Deployment:** Đã deploy thành công chưa?
- [ ] **URL Production:** Link hoạt động chưa?

---

## 🔗 LINK KIỂM TRA

Sau khi deploy, kiểm tra các link sau:

1. **Homepage:** `https://your-project.vercel.app`
2. **Manifest:** `https://your-project.vercel.app/manifest.webmanifest`
3. **Auth:** `https://your-project.vercel.app/auth`
4. **Courses:** `https://your-project.vercel.app/courses`
5. **Preview Lesson:** `https://your-project.vercel.app/learn/audio-goc-01/lesson01`

---

## 📝 GHI CHÚ

- Vercel tự động deploy mỗi khi push lên `main` branch
- Preview deployments tự động tạo cho mỗi PR
- Environment variables có thể khác nhau giữa Production và Preview
- PWA chỉ hoạt động trên HTTPS (Vercel tự động có HTTPS)

---

**Lưu ý:** Nếu chưa deploy lần đầu, làm theo hướng dẫn ở trên. Nếu đã deploy, kiểm tra các mục trong checklist để đảm bảo mọi thứ hoạt động đúng.
