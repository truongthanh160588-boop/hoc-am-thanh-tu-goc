# 📋 HƯỚNG DẪN TRIỂN KHAI NÂNG CẤP BẢO MẬT

## ✅ Checklist Triển Khai

### Bước 1: Chạy Migration SQL trên Supabase

1. **Truy cập Supabase Dashboard**
   - Vào [supabase.com](https://supabase.com)
   - Chọn project của bạn
   - Vào **SQL Editor**

2. **Chạy SQL Migration**
   - Mở file `supabase/schema.sql`
   - Copy phần SQL mới (từ dòng `-- 5. ACTIVATIONS TABLE` đến hết)
   - Paste vào SQL Editor
   - Click **Run** để chạy

   **Hoặc copy đoạn này:**

```sql
-- Thêm cột role vào profiles (nếu chưa có)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Tạo bảng activations
CREATE TABLE IF NOT EXISTS activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE NULL,
  revoked_by UUID NULL REFERENCES auth.users(id),
  note TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id, device_id)
);

CREATE INDEX idx_activations_user_course ON activations(user_id, course_id);
CREATE INDEX idx_activations_course ON activations(course_id);
CREATE INDEX idx_activations_active ON activations(user_id, course_id) WHERE revoked_at IS NULL;

-- RLS cho activations
ALTER TABLE activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activations"
  ON activations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activation"
  ON activations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activations"
  ON activations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all activations"
  ON activations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger updated_at
CREATE TRIGGER update_activations_updated_at
  BEFORE UPDATE ON activations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

3. **Kiểm tra kết quả**
   - Vào **Table Editor** → Kiểm tra có bảng `activations`
   - Kiểm tra bảng `profiles` có cột `role`

---

### Bước 2: Set Admin Role cho Tài Khoản của Bạn

1. **Lấy User ID của bạn**
   - Vào Supabase Dashboard → **Authentication** → **Users**
   - Tìm email của bạn (ví dụ: `truongthanh160588@gmail.com`)
   - Copy **User ID** (UUID)

2. **Set Admin Role**
   - Vào **SQL Editor**
   - Chạy lệnh sau (thay `YOUR_USER_ID` bằng User ID của bạn):

```sql
-- Kiểm tra xem profile đã tồn tại chưa
SELECT id, role FROM profiles WHERE id = 'YOUR_USER_ID';

-- Nếu chưa có profile, tạo mới
INSERT INTO profiles (id, role, full_name)
VALUES ('YOUR_USER_ID', 'admin', 'Admin User')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Hoặc nếu đã có profile, chỉ update role
UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';
```

3. **Verify Admin Role**
   - Chạy query để kiểm tra:

```sql
SELECT id, role, full_name FROM profiles WHERE role = 'admin';
```

---

### Bước 3: Kiểm Tra Environment Variables

Đảm bảo các biến môi trường sau đã được set:

**Trong Vercel (Production):**
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `ACTIVATION_SECRET` ✅ (quan trọng - phải có)
- `ADMIN_EMAIL` hoặc `ADMIN_EMAILS` ✅

**Trong `.env.local` (Development):**
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ACTIVATION_SECRET=your-secret-key-min-32-chars
ADMIN_EMAIL=truongthanh160588@gmail.com
```

---

### Bước 4: Deploy Code Mới

1. **Commit và Push**
   ```bash
   git add .
   git commit -m "feat: Add activations table + server-side guards + enforce 2 devices"
   git push origin main
   ```

2. **Vercel sẽ tự động deploy**
   - Kiểm tra Vercel Dashboard
   - Đợi build xong
   - Test trên production URL

---

### Bước 5: Test Các Tính Năng Mới

#### Test 1: Verify Key → Ghi DB

1. **Tạo test user** (hoặc dùng user hiện có)
2. **Mua khóa học** (tạo purchase với status='paid')
3. **Vào `/courses/[courseId]`**
4. **Copy Device ID** từ ActivationCard
5. **Vào `/admin/keygen`** (với admin account)
6. **Generate key** cho Device ID đó
7. **Quay lại ActivationCard**, nhập key và kích hoạt
8. **Kiểm tra DB:**
   ```sql
   SELECT * FROM activations WHERE user_id = 'USER_ID' AND course_id = 'audio-goc-01';
   ```
   - Phải có 1 record với `revoked_at IS NULL`

#### Test 2: Enforce 2 Devices

1. **Activate device thứ 1** (như Test 1)
2. **Tạo Device ID mới** (xóa localStorage hoặc dùng browser khác)
3. **Activate device thứ 2** → Phải thành công
4. **Tạo Device ID thứ 3** và thử activate → Phải báo lỗi:
   ```
   "Vượt quá 2 thiết bị. Liên hệ admin để thu hồi thiết bị cũ."
   ```

#### Test 3: Server Guard /learn

1. **User chưa paid:**
   - Truy cập `/learn/audio-goc-01/lesson01`
   - Phải redirect về `/courses/audio-goc-01`

2. **User đã paid nhưng chưa activated:**
   - Truy cập `/learn/audio-goc-01/lesson01`
   - Phải redirect về `/courses/audio-goc-01`

3. **User đã paid + activated:**
   - Truy cập `/learn/audio-goc-01/lesson01`
   - Phải vào được trang học

4. **Test bypass localStorage:**
   - Sửa localStorage: `localStorage.setItem('hatg_activation_v1', '{"audio-goc-01":{"activated":true}}')`
   - Truy cập `/learn/audio-goc-01/lesson01` (nếu chưa activated thật)
   - Phải redirect (server guard không tin localStorage)

#### Test 4: Admin Revoke Device

1. **Vào `/admin/keygen`**
2. **Scroll xuống phần "Quản lý Activations"**
3. **Xem danh sách activations đang active**
4. **Click "Thu hồi"** trên một device
5. **Kiểm tra DB:**
   ```sql
   SELECT * FROM activations WHERE device_id = 'DEVICE_ID';
   ```
   - `revoked_at` phải có giá trị
   - `revoked_by` phải là admin user_id

6. **User bị revoke:**
   - User đó truy cập `/learn` → Phải redirect về `/courses`
   - Phải activate lại device mới

---

## 🔍 Troubleshooting

### Lỗi: "ACTIVATION_SECRET not configured"
- **Nguyên nhân:** Thiếu biến môi trường `ACTIVATION_SECRET`
- **Giải pháp:** Set `ACTIVATION_SECRET` trong Vercel env hoặc `.env.local`

### Lỗi: "Không có quyền truy cập" khi vào admin
- **Nguyên nhân:** Chưa set `role='admin'` trong profiles
- **Giải pháp:** Chạy SQL ở Bước 2

### Lỗi: "Chưa thanh toán khóa học" khi verify key
- **Nguyên nhân:** User chưa có purchase với status='paid'
- **Giải pháp:** Admin duyệt purchase tại `/admin/purchases`

### Lỗi: RLS policy violation
- **Nguyên nhân:** RLS policy chưa được tạo đúng
- **Giải pháp:** Chạy lại SQL migration ở Bước 1

### Activation không hiển thị trong admin
- **Nguyên nhân:** Admin role chưa được set
- **Giải pháp:** Check `profiles.role = 'admin'` cho admin user

---

## 📊 Kiểm Tra Sau Khi Deploy

### 1. Check Database
```sql
-- Kiểm tra bảng activations
SELECT COUNT(*) FROM activations;

-- Kiểm tra admin users
SELECT id, email, role FROM profiles WHERE role = 'admin';

-- Kiểm tra activations active
SELECT user_id, course_id, device_id, activated_at 
FROM activations 
WHERE revoked_at IS NULL;
```

### 2. Check API Routes
- `/api/verify-key` - Phải trả về JSON với `ok: true/false`
- `/api/check-activation?courseId=xxx` - Phải trả về `activated: true/false`
- `/api/admin/activations` - Phải list được activations (admin only)
- `/api/admin/revoke-device` - Phải revoke được device (admin only)

### 3. Check Pages
- `/admin/keygen` - Phải có phần "Quản lý Activations"
- `/courses/[courseId]` - ActivationCard phải check từ server
- `/learn/[courseId]/[lessonId]` - Phải guard bằng server

---

## 🎯 Workflow Mới (Sau Khi Triển Khai)

### Cho Học Viên:
1. Đăng ký/Đăng nhập
2. Mua khóa học → Chuyển khoản → Nhắn Zalo
3. Admin duyệt purchase → Status = 'paid'
4. Vào `/courses/[courseId]` → Copy Device ID
5. Gửi Device ID cho admin (Zalo)
6. Admin generate key → Gửi key lại
7. Nhập key vào ActivationCard → Kích hoạt
8. Vào học tại `/learn`

### Cho Admin:
1. Vào `/admin/purchases` → Duyệt đơn hàng
2. Vào `/admin/keygen` → Generate key cho Device ID
3. Vào `/admin/keygen` → Xem danh sách activations
4. Revoke device nếu cần (khi user vượt quá 2 devices)

---

## ✅ Checklist Hoàn Thành

- [ ] Đã chạy SQL migration trên Supabase
- [ ] Đã set admin role cho tài khoản
- [ ] Đã set ACTIVATION_SECRET trong env
- [ ] Đã deploy code mới lên Vercel
- [ ] Đã test verify key → ghi DB
- [ ] Đã test enforce 2 devices
- [ ] Đã test server guard /learn
- [ ] Đã test admin revoke device
- [ ] Đã verify không thể bypass bằng localStorage

---

**Sau khi hoàn thành tất cả các bước trên, hệ thống sẽ hoạt động với bảo mật cao hơn!** 🎉
