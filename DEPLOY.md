# 🚀 Hướng dẫn Deploy và Test

## ✅ Build đã thành công!

Project đã được build thành công. Bây giờ bạn có thể deploy và test.

## 📦 Cách 1: Deploy lên Vercel (Khuyến nghị - Nhanh nhất)

### Bước 1: Push code lên GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Bước 2: Deploy trên Vercel
1. Vào https://vercel.com
2. Đăng nhập bằng GitHub
3. Click "Add New Project"
4. Import repository của bạn
5. Vercel sẽ tự động detect Next.js và deploy

### Bước 3: Cấu hình Environment Variables (nếu dùng Supabase)
Trong Vercel Dashboard → Settings → Environment Variables, thêm:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional)
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

### Bước 4: Lấy link test
- Production: `https://your-project.vercel.app`
- Preview: Mỗi PR sẽ có preview link tự động

---

## 🏠 Cách 2: Test Local với Production Build

### Chạy production server local:
```bash
npm run build
npm run start
```

App sẽ chạy tại: `http://localhost:3000`

### Share link với ngrok (để test từ xa):
```bash
# Cài ngrok: https://ngrok.com/download
ngrok http 3000
```

Bạn sẽ nhận được link như: `https://xxxx-xx-xx-xx-xx.ngrok.io`

---

## 🧪 Test Checklist

Sau khi có link, test các chức năng:

### ✅ Authentication
- [ ] Đăng nhập bằng OTP (Email)
- [ ] Đăng nhập bằng Password
- [ ] Đăng ký tài khoản mới
- [ ] Đăng xuất

### ✅ Mua khóa học
- [ ] Xem danh sách khóa học
- [ ] Click "Mua khóa học"
- [ ] Nhập mã giao dịch
- [ ] Trạng thái "Đang chờ duyệt"

### ✅ Học bài
- [ ] Xem video bài học
- [ ] Đánh dấu "Đã xem" (sau khi xem đủ 80%)
- [ ] Làm quiz
- [ ] Mở bài tiếp theo khi pass quiz

### ✅ PWA
- [ ] Cài ứng dụng (nút "Cài ứng dụng")
- [ ] Test offline mode
- [ ] Icon hiển thị đúng

### ✅ Admin (nếu có quyền)
- [ ] Vào `/admin` để chỉnh sửa bài học
- [ ] Vào `/admin/purchases` để duyệt đơn

---

## 📝 Lưu ý

1. **Supabase**: Nếu chưa setup Supabase, app vẫn chạy được với localStorage
2. **PWA**: Chỉ hoạt động trên HTTPS (Vercel tự động có HTTPS)
3. **Icons**: Cần tạo file PNG icons nếu chưa có (xem `scripts/generate-icons.js`)

---

## 🔗 Link Test

Sau khi deploy, link của bạn sẽ là:
- **Vercel**: `https://your-project-name.vercel.app`
- **Local + ngrok**: `https://xxxx.ngrok.io`

Gửi link này cho người dùng để test!
