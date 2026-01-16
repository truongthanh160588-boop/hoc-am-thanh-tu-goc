# Hướng dẫn Deploy lên Vercel

## 📋 Yêu cầu trước khi deploy

1. **GitHub Repository**: Code phải được push lên GitHub
2. **Vercel Account**: Đăng ký tại [vercel.com](https://vercel.com)

## 🚀 Các bước deploy

### Bước 1: Import GitHub Repository

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Chọn repository từ GitHub
4. Vercel tự động detect Next.js, giữ nguyên settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (mặc định)
   - **Output Directory**: `.next` (mặc định)
   - **Install Command**: `npm install` (mặc định)

### Bước 2: Cấu hình Environment Variables

**QUAN TRỌNG**: Phải set ENV trước khi deploy lần đầu!

Trong Vercel Dashboard → Project Settings → Environment Variables, thêm:

#### Bắt buộc (Production)

```env
# Admin Email (dùng cho /admin/*)
ADMIN_EMAIL=truongthanh160588@gmail.com
NEXT_PUBLIC_ADMIN_EMAILS=truongthanh160588@gmail.com

# Activation System (QUAN TRỌNG - bảo mật)
# Phải là chuỗi bí mật dài (tối thiểu 32 ký tự)
# Nếu thay đổi → tất cả key cũ sẽ không hoạt động
ACTIVATION_SECRET=your-secret-key-min-32-chars-here
```

#### Tùy chọn

```env
# Admin Token (cho API access)
ADMIN_TOKEN=your-admin-token-optional

# Supabase (nếu dùng)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Lưu ý**:
- `ACTIVATION_SECRET`: Phải là chuỗi bí mật dài (tối thiểu 32 ký tự) để chống giả key
- `ADMIN_EMAIL`: Email chính của admin để truy cập `/admin/*`
- Set cho cả **Production**, **Preview**, và **Development** (hoặc chỉ Production nếu muốn)

### Bước 3: Deploy

1. Click **"Deploy"**
2. Chờ build hoàn tất (thường 2-5 phút)
3. Vercel sẽ tự động tạo URL: `https://your-project.vercel.app`

### Bước 4: Kiểm tra sau khi deploy

1. **Test Landing Page**: `https://your-project.vercel.app`
2. **Test Admin Keygen**: `https://your-project.vercel.app/admin/keygen`
   - Đăng nhập với email: `truongthanh160588@gmail.com`
   - Test generate key
3. **Test Admin Purchases**: `https://your-project.vercel.app/admin/purchases`
4. **Test API Routes**:
   - `/api/verify-key` (POST)
   - `/api/generate-key` (POST, admin only)

## 🔐 Truy cập Admin

Sau khi deploy, truy cập các trang admin (cần đăng nhập với email: `truongthanh160588@gmail.com`):

- **Key Generator**: `/admin/keygen`
  - Tạo Activation Key cho học viên
  - Nhập Device ID từ học viên → Generate → Copy key gửi lại

- **Quản lý đơn hàng**: `/admin/purchases`
  - Duyệt đơn hàng từ học viên
  - Xem danh sách pending → Bấm "Đã thanh toán" để kích hoạt

## 🛠️ Troubleshooting

### Lỗi: "ACTIVATION_SECRET not configured"

**Nguyên nhân**: Chưa set `ACTIVATION_SECRET` trong Vercel Environment Variables

**Giải pháp**:
1. Vào Vercel Dashboard → Project Settings → Environment Variables
2. Thêm `ACTIVATION_SECRET` với giá trị bất kỳ (tối thiểu 32 ký tự)
3. Redeploy project

### Lỗi: "Không có quyền truy cập" khi vào `/admin/keygen`

**Nguyên nhân**: Email đăng nhập không khớp với `ADMIN_EMAIL`

**Giải pháp**:
1. Kiểm tra email đăng nhập phải là: `truongthanh160588@gmail.com`
2. Kiểm tra `ADMIN_EMAIL` trong Vercel ENV đã đúng chưa
3. Đăng xuất và đăng nhập lại

### Lỗi: Build failed

**Nguyên nhân**: Có thể do:
- Thiếu dependencies
- Lỗi TypeScript
- Lỗi syntax

**Giải pháp**:
1. Test build local trước: `npm run build`
2. Fix lỗi nếu có
3. Push code mới lên GitHub
4. Vercel sẽ tự động redeploy

### Logo không hiển thị

**Nguyên nhân**: File logo không tồn tại hoặc tên sai

**Giải pháp**:
1. Đảm bảo có file `public/logo.png` (chữ thường)
2. Push file lên GitHub
3. Redeploy

### Lỗi: "ACTIVATION_SECRET not configured" khi verify key

**Nguyên nhân**: Chưa set `ACTIVATION_SECRET` trong Vercel ENV

**Giải pháp**:
1. Vào Vercel Dashboard → Project Settings → Environment Variables
2. Thêm `ACTIVATION_SECRET` với giá trị bất kỳ (tối thiểu 32 ký tự)
3. **Redeploy** project (quan trọng - ENV chỉ áp dụng sau khi redeploy)

## 📝 Lưu ý quan trọng

1. **ACTIVATION_SECRET**: 
   - Phải giữ bí mật, không commit vào Git
   - Nên dùng chuỗi ngẫu nhiên dài (ví dụ: `openssl rand -hex 32`)
   - Nếu thay đổi → tất cả key cũ sẽ không hoạt động
   - **QUAN TRỌNG**: Sau khi set ENV trong Vercel, phải **Redeploy** để áp dụng

2. **ADMIN_EMAIL**:
   - Email này dùng để check quyền admin tại `/admin/*`
   - Email mặc định: `truongthanh160588@gmail.com`
   - Có thể set nhiều email: `email1@gmail.com,email2@gmail.com`
   - Set trong `ADMIN_EMAIL` hoặc `NEXT_PUBLIC_ADMIN_EMAILS`

3. **Device ID & Activation**:
   - Device ID tự động tạo và lưu localStorage
   - Activation state lưu localStorage: `hatg_activation_v1`
   - Chưa activated → không cho vào `/learn/*`
   - Admin generate key tại `/admin/keygen`

4. **PWA**:
   - PWA chỉ hoạt động đầy đủ trên HTTPS (Vercel tự động có)
   - Test trên mobile: mở URL Vercel → "Add to Home Screen"
   - Service Worker tự động register

5. **Custom Domain**:
   - Vercel cho phép thêm custom domain miễn phí
   - Vào Project Settings → Domains → Add Domain

## 🔄 Update sau khi deploy

Mỗi khi push code mới lên GitHub:
- Vercel tự động detect và deploy
- Có thể xem logs trong Vercel Dashboard → Deployments

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra Vercel Build Logs
2. Kiểm tra Environment Variables đã set đúng chưa
3. Test build local: `npm run build`

---

**Phần mềm phát triển bởi Trương Thanh - Zalo: 0974 70 4444**
