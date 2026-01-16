# ✅ CHECKLIST: Sửa Magic Link → Mã 6 số OTP

## 🔍 Vấn đề hiện tại
Email vẫn nhận được **Magic Link** (Liên kết ma thuật) thay vì **mã 6 số**.

## ✅ Code đã đúng (không cần sửa)
- ✅ `app/auth/page.tsx` - Không có `emailRedirectTo`
- ✅ `lib/auth-supabase.ts` - Đã sửa, không có `emailRedirectTo`
- ✅ Đã xóa `/auth/callback` route

## 🔧 CẦN SỬA TRONG SUPABASE DASHBOARD

### Bước 1: Vào Supabase Dashboard
1. Truy cập: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Authentication** → **Email Templates**

### Bước 2: Tìm template OTP/Passcode
1. Tìm template có tên:
   - **"Email OTP"** hoặc
   - **"One-time passcode"** hoặc
   - **"Passcode"** hoặc
   - **"OTP"**

2. **⚠️ NẾU KHÔNG THẤY template OTP:**
   - Có thể Supabase vẫn đang dùng Magic Link mode
   - **Giải pháp:** Test lại flow đăng nhập trên website → Supabase sẽ tự tạo template OTP

### Bước 3: Kiểm tra Settings → Auth
1. Vào **Settings** → **Auth**
2. Tìm mục **"Site URL"**
3. Đảm bảo URL đúng: `https://hoc-am-thanh-tu-goc.vercel.app`
4. Click **"Save"** (nếu có thay đổi)

### Bước 4: Test lại
1. **Clear cache browser** (Ctrl+Shift+Delete)
2. Vào: `https://hoc-am-thanh-tu-goc.vercel.app/auth`
3. Nhập email → Bấm "Gửi mã"
4. Kiểm tra email:
   - ✅ **Đúng:** Email chứa mã 6 số (ví dụ: `123456`)
   - ❌ **Sai:** Email chứa link "Đăng nhập" (Magic Link)

### Bước 5: Kiểm tra Supabase Logs
1. Vào **Authentication** → **Logs**
2. Tìm log mới nhất khi bạn bấm "Gửi mã"
3. Xem log:
   - ✅ **Đúng:** Phải thấy `"otp"` hoặc `"type": "email"`
   - ❌ **Sai:** Thấy `"magiclink"` hoặc `"redirect"`

## 🚨 Nếu vẫn nhận Magic Link

### Kiểm tra lại code (đảm bảo không có):
- [ ] `emailRedirectTo` trong `signInWithOtp()`
- [ ] `redirectTo` trong bất kỳ đâu
- [ ] File `/auth/callback/route.ts` (phải đã xóa)

### Kiểm tra Supabase:
- [ ] Site URL đã đặt đúng
- [ ] Template OTP/Passcode đã có (không phải Magic Link)
- [ ] Đã test lại flow đăng nhập

### Nếu vẫn không được:
1. Đợi 5-10 phút (Supabase có thể cache)
2. Thử email khác
3. Kiểm tra Supabase Dashboard → **Authentication** → **Settings** → Có option nào về "Magic Link" không? → Tắt nếu có

## 📝 Lưu ý
- Code đã đúng, vấn đề chủ yếu là cấu hình Supabase Dashboard
- Supabase có thể cần thời gian để chuyển từ Magic Link sang OTP mode
- Test lại sau khi cấu hình xong
