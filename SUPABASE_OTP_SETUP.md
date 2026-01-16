# Hướng dẫn cấu hình Supabase gửi mã 6 số (OTP) thay vì Magic Link

## Vấn đề
Supabase mặc định gửi **Magic Link** (liên kết đăng nhập) thay vì **mã 6 số OTP**.

## Giải pháp: Cấu hình Email Template trong Supabase

### Bước 1: Vào Supabase Dashboard
1. Truy cập https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Authentication** → **Email Templates**

### Bước 2: Cấu hình Email Template "Magic Link"
1. Tìm template **"Magic Link"**
2. Click **"Edit"** hoặc **"Customize"**

### Bước 3: Thay đổi nội dung email
Thay thế toàn bộ nội dung email bằng:

**Subject (Tiêu đề):**
```
Mã đăng nhập của bạn: {{ .Token }}
```

**Body (Nội dung):**
```
Chào bạn,

Mã đăng nhập 6 số của bạn là: **{{ .Token }}**

Mã này có hiệu lực trong 60 phút.

Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.

Trân trọng,
Học Âm Thanh Từ Gốc
```

**Lưu ý quan trọng:**
- `{{ .Token }}` là biến tự động chứa mã 6 số
- Không xóa biến này
- Không thêm link nào khác

### Bước 4: Lưu và test
1. Click **"Save"**
2. Test lại flow đăng nhập
3. Kiểm tra email nhận được có mã 6 số không

## Cách 2: Dùng Custom SMTP (Nếu có)

Nếu bạn dùng Custom SMTP (SendGrid, Mailgun, etc.):
1. Vào **Settings** → **Auth** → **SMTP Settings**
2. Cấu hình SMTP của bạn
3. Email template sẽ tự động dùng mã 6 số

## Kiểm tra

Sau khi cấu hình:
1. Vào `/auth` trên website
2. Nhập email → Bấm "Gửi mã"
3. Kiểm tra email nhận được:
   - ✅ **Đúng**: Email chứa mã 6 số (ví dụ: `123456`)
   - ❌ **Sai**: Email chứa link "Đăng nhập" (Magic Link)

## Troubleshooting

### Vẫn nhận Magic Link?
1. Kiểm tra lại Email Template đã lưu chưa
2. Clear cache browser và thử lại
3. Kiểm tra có dùng `emailRedirectTo` trong code không (phải bỏ)

### Mã 6 số không hoạt động?
1. Kiểm tra code đang dùng `verifyOtp()` với `type: "email"`
2. Đảm bảo không có `emailRedirectTo` trong `signInWithOtp()`
3. Kiểm tra Supabase Dashboard → Authentication → Settings → "Enable email confirmations" phải BẬT

## Tham khảo
- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase OTP Auth](https://supabase.com/docs/guides/auth/auth-otp)
