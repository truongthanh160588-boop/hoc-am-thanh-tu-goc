# Hướng dẫn Setup Supabase

## 1. Tạo Project Supabase

1. Truy cập https://supabase.com
2. Đăng ký/đăng nhập
3. Click "New Project"
4. Điền thông tin:
   - Name: `hoc-am-thanh-tu-goc`
   - Database Password: (tạo password mạnh)
   - Region: chọn gần nhất (Singapore cho VN)
5. Chờ project được tạo (2-3 phút)

## 2. Lấy API Keys

1. Vào **Settings** → **API**
2. Copy các giá trị:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: (key dài)
   - **service_role**: (key dài, giữ bí mật!)

## 3. Chạy SQL Migration

1. Vào **SQL Editor** trong Supabase Dashboard
2. Click **New Query**
3. Copy toàn bộ nội dung file `supabase/schema.sql`
4. Paste vào editor
5. Click **Run** (hoặc Ctrl+Enter)
6. Kiểm tra kết quả: nếu thành công sẽ thấy "Success"

## 4. Cấu hình Authentication

1. Vào **Authentication** → **Providers**
2. Bật **Email** provider
3. (Tùy chọn) Cấu hình email templates:
   - Magic Link template
   - OTP template

## 5. Cấu hình Environment Variables

Tạo file `.env.local` trong root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,truongthanh@example.com
```

**Lưu ý**: 
- Không commit file `.env.local` lên Git
- `NEXT_PUBLIC_*` sẽ được expose ra client (OK cho anon key)
- `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng server-side (nếu cần)

## 6. Test

1. Chạy `npm run dev`
2. Vào `/auth`
3. Thử đăng nhập với OTP hoặc Password
4. Kiểm tra trong Supabase Dashboard → **Authentication** → **Users** xem có user mới không

## 7. Admin Emails

Thêm email admin vào `.env.local`:
```
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com,admin@example.com
```

Các email này sẽ có quyền:
- Vào `/admin` (quản lý khóa học)
- Vào `/admin/purchases` (duyệt đơn hàng)

## Troubleshooting

### Lỗi "relation does not exist"
- Kiểm tra đã chạy SQL migration chưa
- Kiểm tra tên bảng trong code có đúng không

### Lỗi RLS (Row Level Security)
- Kiểm tra policies trong `schema.sql` đã được tạo
- Test với user thật, không dùng service_role key ở client

### OTP không gửi được
- Kiểm tra email provider đã bật
- Kiểm tra email có trong spam folder
- Xem logs trong Supabase Dashboard → Logs

### Progress không lưu
- Kiểm tra user đã đăng nhập
- Kiểm tra RLS policies cho bảng `progress`
- Xem console browser có lỗi không
